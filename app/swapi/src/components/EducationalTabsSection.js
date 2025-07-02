import React, { useState } from 'react';
import useAppStore from '../store/useAppStore';

const EducationalTabsSection = () => {
  const [activeTab, setActiveTab] = useState('langchain-tools');
  
  const { 
    // LangChain Tools state
    response, 
    setResponse, 
    setError,
    clearProgress,
    // Vector Embeddings state
    embeddings, 
    embeddingsLoading, 
    setEmbeddings, 
    setEmbeddingsLoading
  } = useAppStore();

  // Load demo tool usage for educational purposes
  const loadDemoToolUsage = async () => {
    console.log('Demo button clicked');
    try {
      console.log('About to fetch demo data');
      const res = await fetch('/api/demo-tool-usage');
      console.log('Fetch completed, status:', res.status);
      const data = await res.json();
      console.log('Data parsed:', data);
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load demo');
      }
      
      // Clear any existing progress updates and set demo info
      clearProgress();
      setResponse(data);
      setError('');
      console.log('State updated successfully');
    } catch (err) {
      console.error('Error in loadDemoToolUsage:', err);
      setError(err.message);
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

  return (
    <div className="educational-tabs-section" style={{ margin: '2rem 0' }}>
      {/* Tab Navigation */}
      <div className="tab-navigation" style={{
        display: 'flex',
        borderBottom: '1px solid #dee2e6',
        marginBottom: '1rem'
      }}>
        <button
          className={`tab-button ${activeTab === 'langchain-tools' ? 'active' : ''}`}
          onClick={() => setActiveTab('langchain-tools')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderBottom: activeTab === 'langchain-tools' ? '2px solid #007bff' : '2px solid transparent',
            backgroundColor: activeTab === 'langchain-tools' ? '#f8f9fa' : 'transparent',
            color: activeTab === 'langchain-tools' ? '#007bff' : '#6c757d',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeTab === 'langchain-tools' ? 'bold' : 'normal',
            marginRight: '0.5rem'
          }}
        >
          🔧 LangChain Tools
        </button>
        <button
          className={`tab-button ${activeTab === 'vector-embeddings' ? 'active' : ''}`}
          onClick={() => setActiveTab('vector-embeddings')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderBottom: activeTab === 'vector-embeddings' ? '2px solid #007bff' : '2px solid transparent',
            backgroundColor: activeTab === 'vector-embeddings' ? '#f8f9fa' : 'transparent',
            color: activeTab === 'vector-embeddings' ? '#007bff' : '#6c757d',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeTab === 'vector-embeddings' ? 'bold' : 'normal'
          }}
        >
          📊 Vector Embeddings
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'langchain-tools' && (
          <div className="langchain-tools-tab">
            <div className="tab-header">
              <h2>Understanding LangChain Tools</h2>
              <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '1rem' }}>
                Explore how LangChain agents use specialized tools to make API calls and process information.
              </p>
              
              {/* Educational Information */}
              <div className="educational-info" style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '1rem', 
                borderRadius: '5px', 
                marginBottom: '1rem',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ color: '#495057', marginTop: 0 }}>📚 What are LangChain Tools?</h3>
                <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
                  LangChain tools are specialized functions that allow AI agents to interact with external systems and APIs. 
                  In this demo, our agent uses custom-built tools to query the Star Wars API (SWAPI) and retrieve specific 
                  information about characters, films, planets, and more. Each tool is designed for a specific type of data 
                  retrieval, making the agent more efficient and accurate.
                </p>
                
                <div style={{ marginTop: '1rem' }}>
                  <strong>How it works:</strong>
                  <ol style={{ color: '#6c757d', marginTop: '0.5rem' }}>
                    <li>User asks a natural language question</li>
                    <li>LangChain agent analyzes the question and determines which tools to use</li>
                    <li>Agent calls the appropriate tools with specific parameters</li>
                    <li>Tools make API requests to gather the required data</li>
                    <li>Agent processes the results and formulates a comprehensive answer</li>
                  </ol>
                </div>
                
                <div style={{ marginTop: '1rem' }}>
                  <strong>Available Tools:</strong>
                  <ul style={{ color: '#6c757d', marginTop: '0.5rem' }}>
                    <li>Character information and relationships</li>
                    <li>Film details and character connections</li>
                    <li>Planet data and inhabitants</li>
                    <li>Starship and vehicle specifications</li>
                    <li>Species characteristics</li>
                    <li>Advanced search capabilities</li>
                  </ul>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                {/* {(!response || response.isDemo) && ( */}
                  <button
                    type="button"
                    onClick={loadDemoToolUsage}
                    className="demo-btn"
                    style={{
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    📚 Show LangChain Tools Demo
                  </button>
                {/* )} */}
                {response && response.isDemo && (
                  <button
                    type="button"
                    onClick={() => setResponse(null)}
                    className="clear-demo-btn"
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    🧹 Clear Demo
                  </button>
                )}
              </div>
            </div>

            {/* Show detailed tool usage information when available */}
            {response && response.toolUsage && response.toolUsage.length > 0 && (
              <div style={{ 
                marginTop: '1rem',
                border: '1px solid #007bff',
                borderRadius: '5px',
                padding: '1rem',
                backgroundColor: '#f8f9fa'
              }}>
                <h4 style={{ 
                  margin: '0 0 1rem 0',
                  color: '#007bff',
                  fontSize: '1.1em'
                }}>
                  🔧 LangChain Tools API Calls
                </h4>
                <div style={{ 
                  backgroundColor: '#e3f2fd', 
                  border: '1px solid #2196f3', 
                  padding: '0.75rem', 
                  borderRadius: '4px', 
                  fontSize: '0.9em',
                  marginBottom: '1rem'
                }}>
                  <p><strong>📚 Live Demo:</strong> This shows how LangChain agents use specialized tools to make API calls.</p>
                  <p><strong>Query:</strong> {response.query}</p>
                  <p><strong>Tools Used:</strong> {response.toolUsage.length} LangChain tools were called</p>
                  <p><strong>Answer:</strong> {response.answer}</p>
                </div>

                {/* Detailed Tool Calls */}
                <div style={{ marginTop: '1rem' }}>
                  <h5 style={{ 
                    margin: '0 0 0.75rem 0',
                    color: '#495057',
                    fontSize: '1em'
                  }}>
                    🛠️ Individual Tool Calls & API Details:
                  </h5>
                  
                  {response.toolUsage.map((tool, index) => {
                    // Parse the tool output to extract API call information
                    let toolData = null;
                    let apiCallInfo = null;
                    let parseError = null;
                    
                    try {
                      const parsedOutput = JSON.parse(tool.toolOutput);
                      toolData = parsedOutput.data;
                      apiCallInfo = parsedOutput.apiCall;
                    } catch (e) {
                      // Log parsing error and track failure for fallback display
                      parseError = e.message;
                      console.error(`Failed to parse tool output for tool "${tool.toolName}" (#${index + 1}):`, e.message, '\nRaw output:', tool.toolOutput);
                    }

                    return (
                      <div key={index} style={{
                        border: '1px solid #dee2e6',
                        borderRadius: '5px',
                        padding: '0.75rem',
                        marginBottom: '0.75rem',
                        backgroundColor: '#ffffff'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.5rem'
                        }}>
                          <h6 style={{
                            margin: 0,
                            color: '#28a745',
                            fontSize: '0.95em'
                          }}>
                            🔧 Tool #{index + 1}: {tool.toolName}
                          </h6>
                          <span style={{
                            backgroundColor: '#e9ecef',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.75em',
                            color: '#6c757d'
                          }}>
                            {tool.timestamp ? new Date(tool.timestamp).toLocaleTimeString() : 'Now'}
                          </span>
                        </div>

                        {/* Tool Input */}
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong style={{ fontSize: '0.85em', color: '#6c757d' }}>Input Parameters:</strong>
                          <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '3px',
                            fontSize: '0.8em',
                            fontFamily: 'monospace',
                            color: '#495057'
                          }}>
                            {JSON.stringify(tool.toolInput)}
                          </div>
                        </div>

                        {/* API Call Information */}
                        {apiCallInfo && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong style={{ fontSize: '0.85em', color: '#6c757d' }}>API Call Made:</strong>
                            <div style={{
                              backgroundColor: '#fff3cd',
                              border: '1px solid #ffeaa7',
                              padding: '0.5rem',
                              borderRadius: '3px',
                              fontSize: '0.8em'
                            }}>
                              <div><strong>Method:</strong> {apiCallInfo.method}</div>
                              <div><strong>URL:</strong> {apiCallInfo.url}</div>
                              <div><strong>Status:</strong> <span style={{ 
                                color: apiCallInfo.responseStatus === 200 ? '#28a745' : '#dc3545' 
                              }}>{apiCallInfo.responseStatus}</span></div>
                              <div><strong>Timestamp:</strong> {new Date(apiCallInfo.timestamp).toLocaleTimeString()}</div>
                            </div>
                          </div>
                        )}

                        {/* Response Data Summary */}
                        {toolData && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong style={{ fontSize: '0.85em', color: '#6c757d' }}>Response Data:</strong>
                            <div style={{
                              backgroundColor: '#d4edda',
                              border: '1px solid #c3e6cb',
                              padding: '0.5rem',
                              borderRadius: '3px',
                              fontSize: '0.8em'
                            }}>
                              {toolData.name && <div><strong>Name:</strong> {toolData.name}</div>}
                              {toolData.title && <div><strong>Title:</strong> {toolData.title}</div>}
                              {Array.isArray(toolData) && <div><strong>Results:</strong> {toolData.length} items</div>}
                              {toolData.id && <div><strong>ID:</strong> {toolData.id}</div>}
                            </div>
                          </div>
                        )}

                        {/* Raw Output Fallback (when JSON parsing fails) */}
                        {parseError && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong style={{ fontSize: '0.85em', color: '#dc3545' }}>⚠️ Raw Tool Output (JSON Parse Failed):</strong>
                            <div style={{
                              backgroundColor: '#f8d7da',
                              border: '1px solid #f5c6cb',
                              padding: '0.5rem',
                              borderRadius: '3px',
                              fontSize: '0.8em',
                              fontFamily: 'monospace',
                              wordBreak: 'break-all',
                              whiteSpace: 'pre-wrap'
                            }}>
                              <div style={{ marginBottom: '0.25rem', color: '#721c24' }}>
                                <strong>Parse Error:</strong> {parseError}
                              </div>
                              <div style={{ color: '#495057' }}>
                                <strong>Raw Output:</strong>
                              </div>
                              <div style={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #dee2e6', 
                                padding: '0.25rem', 
                                marginTop: '0.25rem',
                                borderRadius: '2px'
                              }}>
                                {tool.toolOutput}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Educational Notes */}
                        <div style={{
                          borderTop: '1px solid #e9ecef',
                          paddingTop: '0.5rem',
                          fontSize: '0.75em',
                          color: '#6c757d'
                        }}>
                          <strong>💡 What this shows:</strong> This tool made a direct API call to get {
                            tool.toolName.includes('character') && !tool.toolName.includes('films') ? 'character information' :
                            tool.toolName.includes('films') ? 'film information' :
                            tool.toolName.includes('planet') ? 'planet information' :
                            tool.toolName.includes('starship') ? 'starship information' :
                            tool.toolName.includes('species') ? 'species information' :
                            tool.toolName.includes('vehicle') ? 'vehicle information' :
                            'specific Star Wars data'
                          }, demonstrating how LangChain agents can access live APIs to provide accurate, up-to-date information.
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'vector-embeddings' && (
          <div className="vector-embeddings-tab">
            <div className="tab-header">
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
                  opacity: embeddingsLoading ? 0.6 : 1,
                  fontSize: '1rem'
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
        )}
      </div>
    </div>
  );
};

export default EducationalTabsSection;