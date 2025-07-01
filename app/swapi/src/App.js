import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null);
  const [progressUpdates, setProgressUpdates] = useState([]);
  const [lastRawRequest, setLastRawRequest] = useState(null);
  const [lastRawResponse, setLastRawResponse] = useState(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [embeddings, setEmbeddings] = useState(null);
  const [embeddingsLoading, setEmbeddingsLoading] = useState(false);
  const eventSourceRef = useRef(null);

  // Initialize SSE connection
  useEffect(() => {
    const connectSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource(`/api/progress/${sessionId}`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setProgressUpdates(prev => [...prev, data]);
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        // Reconnect after 5 seconds
        setTimeout(connectSSE, 5000);
      };
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [sessionId]);

  // Check system status
  const checkStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to check status:', err.message);
    }
  };

  // Clear progress updates
  const clearProgress = () => {
    setProgressUpdates([]);
  };

  // Get progress indicator color based on type
  const getProgressColor = (type) => {
    switch (type) {
      case 'vectordb_init':
      case 'vectordb_ingest':
        return '#3498db'; // Blue
      case 'vectordb_complete':
      case 'query_complete':
        return '#27ae60'; // Green
      case 'vectordb_error':
        return '#e74c3c'; // Red
      case 'vectordb_warning':
        return '#f39c12'; // Orange
      case 'query_start':
      case 'query_step':
        return '#9b59b6'; // Purple
      default:
        return '#95a5a6'; // Gray
    }
  };

  // Check status on component mount
  React.useEffect(() => {
    checkStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch available models when API key is provided
  const fetchModels = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an OpenAI API key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch models');
      }

      setModels(data.models);
      if (data.models.length > 0) {
        setSelectedModel(data.models[0].id);
      }
    } catch (err) {
      setError(err.message);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sample embeddings for educational display
  const fetchEmbeddings = async () => {
    setEmbeddingsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/embeddings?limit=15');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch embeddings');
      }

      setEmbeddings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setEmbeddingsLoading(false);
    }
  };

  // Submit query
  const handleQuery = async (e) => {
    e.preventDefault();
    
    if (!apiKey.trim() || !selectedModel || !query.trim()) {
      setError('Please provide API key, select a model, and enter a query');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);
    setProgressUpdates([]);

    const requestData = {
      apiKey,
      model: selectedModel,
      query,
      sessionId
    };

    setLastRawRequest(requestData);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await res.json();
      setLastRawResponse(data);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process query');
      }

      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Star Wars Natural Language Query</h1>
        <p>Ask questions about the Star Wars universe using natural language!</p>

        {status && (
          <div className={`status ${status.vectorDatabase === 'ready' ? 'status-ready' : 'status-pending'}`}>
            <strong>System Status:</strong> API is {status.api}. 
            Vector database is {status.vectorDatabase}
            {status.vectorDatabase === 'not_initialized' && (
              <span>. The vector database (LanceDB) initializes on first query and may take a few minutes to provision.</span>
            )}
          </div>
        )}

        <div className="api-key-section">
          <label htmlFor="apiKey">OpenAI API Key:</label>
          <div className="input-group">
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
              className="api-key-input"
            />
            <button
              onClick={fetchModels}
              disabled={loading || !apiKey.trim()}
              className="fetch-models-btn"
            >
              Load Models
            </button>
          </div>
        </div>

        {models.length > 0 && (
          <div className="model-section">
            <label htmlFor="model">Select Model:</label>
            <select
              id="model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="model-select"
            >
              {models.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={handleQuery} className="query-form">
          <label htmlFor="query">Your Question:</label>
          <textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about Star Wars... Examples:&#10;• Who is Luke Skywalker?&#10;• What is the Death Star?&#10;• Tell me about the planet Tatooine&#10;• What movies feature Darth Vader?&#10;• Which characters are from Naboo?"
            rows={4}
            className="query-input"
          />
          <button
            type="submit"
            disabled={loading || !apiKey.trim() || !selectedModel || !query.trim()}
            className="submit-btn"
          >
            {loading ? 'Processing...' : 'Ask Question'}
          </button>
        </form>

        {/* Progress Updates Section */}
        {progressUpdates.length > 0 && (
          <div className="progress-section">
            <div className="progress-header">
              <h3>Processing Progress</h3>
              <button 
                onClick={clearProgress} 
                className="clear-progress-btn"
                disabled={loading}
              >
                Clear
              </button>
            </div>
            <div className="progress-updates">
              {progressUpdates.map((update, index) => (
                <div 
                  key={index} 
                  className="progress-item"
                  style={{ borderLeft: `4px solid ${getProgressColor(update.type)}` }}
                >
                  <div className="progress-header-item">
                    <span className="progress-type">{update.type.replace(/_/g, ' ').toUpperCase()}</span>
                    <span className="progress-time">
                      {new Date(update.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="progress-message">{update.message}</div>
                  {update.progress !== undefined && (
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${update.progress}%`,
                          backgroundColor: getProgressColor(update.type)
                        }}
                      ></div>
                      <span className="progress-text">{update.progress}%</span>
                    </div>
                  )}
                  {update.processedEntities && update.totalEntities && (
                    <div className="progress-details">
                      Processing: {update.processedEntities}/{update.totalEntities} entities
                    </div>
                  )}
                  {update.entityType && update.entityProgress && update.entityTotal && (
                    <div className="progress-details">
                      {update.entityType}: {update.entityProgress}/{update.entityTotal}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {response && (
          <div className="response-section">
            <h2>Response</h2>
            <div className="response-content">
              <div className="answer">
                <h3>Answer:</h3>
                <p>{response.answer}</p>
              </div>
              
              <div className="metadata">
                <p><strong>Model:</strong> {response.model}</p>
                <p><strong>Query:</strong> {response.query}</p>
                <p><strong>Timestamp:</strong> {new Date(response.timestamp).toLocaleString()}</p>
                {response.enhanced && <p><strong>Enhanced:</strong> Used LangChain AI agent with API tools</p>}
              </div>

              {response.processingSteps && (
                <details className="processing-steps">
                  <summary>View Processing Steps</summary>
                  <div className="steps-list">
                    {response.processingSteps.map((step, index) => (
                      <div key={index} className="step-item">
                        <span className="step-number">{index + 1}</span>
                        <span className="step-description">{step}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              <details className="raw-data-details">
                <summary>View Raw Request & Response Data</summary>
                <div className="raw-data-content">
                  <div className="raw-section">
                    <h4>Request Data:</h4>
                    <pre className="raw-json">
                      {JSON.stringify(lastRawRequest, null, 2)}
                    </pre>
                  </div>
                  <div className="raw-section">
                    <h4>Response Data:</h4>
                    <pre className="raw-json">
                      {JSON.stringify(lastRawResponse, null, 2)}
                    </pre>
                  </div>
                </div>
              </details>

              <details className="context-details">
                <summary>View Context Sources</summary>
                <div className="context-sources">
                  {response.context.map((item, index) => (
                    <div key={index} className="context-item">
                      <div className="context-header">
                        <span className="relevance">Relevance: {(item.relevance * 100).toFixed(1)}%</span>
                        <span className="entity-type">Type: {item.metadata.entity_type}</span>
                      </div>
                      <p className="context-content">{item.content}</p>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        )}

        {/* Educational Embeddings Viewer Section */}
        <div className="embeddings-section" style={{ marginTop: '2rem' }}>
          <div className="embeddings-header">
            <h2>Understanding Vector Embeddings</h2>
            <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '1rem' }}>
              Explore how the system converts Star Wars content into vector embeddings for semantic search.
            </p>
            <button
              onClick={fetchEmbeddings}
              disabled={embeddingsLoading}
              className="fetch-embeddings-btn"
              style={{
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: embeddingsLoading ? 'not-allowed' : 'pointer',
                opacity: embeddingsLoading ? 0.6 : 1
              }}
            >
              {embeddingsLoading ? 'Loading...' : 'Show Sample Embeddings'}
            </button>
          </div>

          {embeddings && (
            <div className="embeddings-content" style={{ marginTop: '1rem' }}>
              <div className="educational-info" style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '1rem', 
                borderRadius: '5px', 
                marginBottom: '1rem',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ color: '#495057', marginTop: 0 }}>📚 What are Embeddings?</h3>
                <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
                  {embeddings.educational_info.explanation}
                </p>
                
                {embeddings.is_demo_data && embeddings.educational_info.demo_notice && (
                  <div style={{ 
                    backgroundColor: '#fff3cd', 
                    border: '1px solid #ffeaa7', 
                    padding: '0.75rem', 
                    borderRadius: '4px', 
                    marginTop: '1rem',
                    marginBottom: '1rem'
                  }}>
                    {embeddings.educational_info.demo_notice}
                  </div>
                )}
                
                <div style={{ marginTop: '1rem' }}>
                  <strong>Technical Details:</strong>
                  <ul style={{ color: '#6c757d', marginTop: '0.5rem' }}>
                    <li>Model: {embeddings.educational_info.model}</li>
                    <li>Dimensions: {embeddings.educational_info.dimensions}</li>
                    <li>Total Samples: {embeddings.count}</li>
                    {embeddings.is_demo_data && <li>Data Type: Demo/Educational</li>}
                  </ul>
                </div>
                <details style={{ marginTop: '1rem' }}>
                  <summary style={{ cursor: 'pointer', color: '#007bff' }}>
                    View Step-by-Step Process
                  </summary>
                  <ol style={{ marginTop: '0.5rem', color: '#6c757d' }}>
                    {embeddings.educational_info.process.map((step, index) => (
                      <li key={index} style={{ marginBottom: '0.5rem' }}>{step}</li>
                    ))}
                  </ol>
                </details>
              </div>

              <details className="embeddings-details">
                <summary style={{ cursor: 'pointer', fontSize: '1.1em', fontWeight: 'bold' }}>
                  View Sample Embedding Vectors ({embeddings.count} samples)
                </summary>
                <div className="embeddings-visualization" style={{ marginTop: '1rem' }}>
                  <div style={{ 
                    backgroundColor: '#fff3cd', 
                    border: '1px solid #ffeaa7', 
                    padding: '0.75rem', 
                    borderRadius: '4px', 
                    marginBottom: '1rem' 
                  }}>
                    <strong>Visualization Note:</strong> {embeddings.educational_info.visualization}
                  </div>
                  
                  {embeddings.embeddings && embeddings.embeddings.map((embedding, index) => (
                    <div key={embedding.id || index} className="embedding-item" style={{ 
                      border: '1px solid #dee2e6', 
                      borderRadius: '5px', 
                      padding: '1rem', 
                      marginBottom: '1rem',
                      backgroundColor: '#ffffff'
                    }}>
                      <div className="embedding-header" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <h4 style={{ margin: 0, color: '#495057' }}>
                          {embedding.entityType} #{embedding.entityId}
                        </h4>
                        <span style={{ 
                          backgroundColor: '#e9ecef', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '12px', 
                          fontSize: '0.8em' 
                        }}>
                          {embedding.embeddingDimensions}D vector
                        </span>
                      </div>
                      
                      <div className="text-content" style={{ 
                        backgroundColor: '#f8f9fa', 
                        padding: '0.75rem', 
                        borderRadius: '4px', 
                        marginBottom: '0.75rem',
                        fontSize: '0.9em',
                        color: '#495057'
                      }}>
                        <strong>Source Text:</strong> {embedding.textContent ? embedding.textContent.substring(0, 200) : 'No text'}
                        {embedding.textContent && embedding.textContent.length > 200 && '...'}
                      </div>
                      
                      <div className="vector-preview" style={{ marginBottom: '0.75rem' }}>
                        <strong style={{ color: '#495057' }}>Vector Preview (first 10 dimensions):</strong>
                        <div style={{ 
                          fontFamily: 'monospace', 
                          fontSize: '0.8em', 
                          backgroundColor: '#f8f9fa', 
                          padding: '0.5rem', 
                          borderRadius: '4px',
                          marginTop: '0.25rem',
                          overflowX: 'auto'
                        }}>
                          [{embedding.embeddingPreview && embedding.embeddingPreview.map ? 
                            embedding.embeddingPreview.map(val => val.toFixed(4)).join(', ') : 
                            'No preview available'}...]
                        </div>
                      </div>
                      
                      <div className="educational-notes" style={{ 
                        fontSize: '0.85em', 
                        color: '#6c757d',
                        borderTop: '1px solid #e9ecef',
                        paddingTop: '0.5rem'
                      }}>
                        <div><strong>Purpose:</strong> {embedding.educationalNotes?.purpose || 'Educational purpose'}</div>
                        <div><strong>Model:</strong> {embedding.educationalNotes?.model || 'text-embedding-3-small'}</div>
                        <div><strong>Similarity:</strong> {embedding.educationalNotes?.similarity || 'Vector similarity'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
      
      {/* Version information */}
      <div className="version-info" style={{ 
        fontSize: '0.8em', 
        color: '#666', 
        textAlign: 'center', 
        marginTop: '2rem', 
        padding: '1rem',
        borderTop: '1px solid #eee'
      }}>
        Version: commit PLACEHOLDER_COMMIT_SHA<br/>
        Deployed: {new Date('PLACEHOLDER_DEPLOY_TIMESTAMP').toLocaleString()}
      </div>
    </div>
  );
}

export default App;
