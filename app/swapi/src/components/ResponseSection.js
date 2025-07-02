import React from 'react';
import useAppStore from '../store/useAppStore';

const ResponseSection = () => {
  const { response, lastRawRequest, lastRawResponse } = useAppStore();

  if (!response) return null;

  return (
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
            {response.context && response.context.map((item, index) => (
              <div key={index} className="context-item">
                <div className="context-header">
                  <span className="relevance">Relevance: {(item.relevance * 100).toFixed(1)}%</span>
                  {item.metadata && item.metadata.entity_type && (
                    <span className="entity-type">Type: {item.metadata.entity_type}</span>
                  )}
                </div>
                <p className="context-content">{item.content}</p>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
};

export default ResponseSection;