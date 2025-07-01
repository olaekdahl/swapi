import React from 'react';
import useAppStore from '../store/useAppStore';

const ProgressSection = () => {
  const { 
    progressUpdates, 
    loading, 
    response, 
    clearProgress, 
    setResponse, 
    setError 
  } = useAppStore();

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

  return (
    <div className="progress-section">
      <div className="progress-header">
        <h3>Processing Progress</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          {progressUpdates.length === 0 && (!response || response.isDemo) && (
            <button
              type="button"
              onClick={loadDemoToolUsage}
              className="demo-btn"
              style={{
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.9em'
              }}
            >
              📚 Show LangChain Tool Usage Demo
            </button>
          )}
          {response && response.isDemo && (
            <button
              type="button"
              onClick={() => setResponse(null)}
              className="clear-demo-btn"
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.9em'
              }}
            >
              🧹 Clear Demo
            </button>
          )}
          {progressUpdates.length > 0 && (
            <button 
              onClick={clearProgress} 
              className="clear-progress-btn"
              disabled={loading}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      {progressUpdates.length > 0 && (
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
      )}
      
      {/* Show detailed tool usage information in progress area when available */}
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
            <p><strong>📚 Educational Demo:</strong> This shows how LangChain agents use specialized tools to make API calls.</p>
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
  );
};

export default ProgressSection;