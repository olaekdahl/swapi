import React from 'react';
import useAppStore from '../store/useAppStore';

const ApiKeySection = () => {
  const { apiKey, loading, setApiKey, setModels, setSelectedModel, setError, setLoading } = useAppStore();

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

  return (
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
  );
};

export default ApiKeySection;