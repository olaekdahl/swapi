import React from 'react';
import useAppStore from '../store/useAppStore';

const QueryForm = () => {
  const { 
    apiKey, 
    selectedModel, 
    query, 
    loading, 
    sessionId,
    setQuery, 
    setLoading, 
    setError, 
    setResponse, 
    setProgressUpdates, 
    setLastRawRequest, 
    setLastRawResponse 
  } = useAppStore();

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
  );
};

export default QueryForm;