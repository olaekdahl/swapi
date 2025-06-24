import React, { useState } from 'react';
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

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          model: selectedModel,
          query
        })
      });

      const data = await res.json();

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
            <strong>System Status:</strong> API is {status.api}, 
            Vector Database is {status.vectorDatabase}
            {status.vectorDatabase === 'not_initialized' && (
              <span> (will be initialized on first query)</span>
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
              </div>

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
      </div>
    </div>
  );
}

export default App;
