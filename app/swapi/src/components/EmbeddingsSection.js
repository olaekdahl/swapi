import React from 'react';
import useAppStore from '../store/useAppStore';

const EmbeddingsSection = () => {
  const { 
    embeddings, 
    embeddingsLoading, 
    setEmbeddings, 
    setEmbeddingsLoading, 
    setError 
  } = useAppStore();

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
  );
};

export default EmbeddingsSection;