import React from 'react';
import useAppStore from '../store/useAppStore';

const ModelSelection = () => {
  const { models, selectedModel, setSelectedModel } = useAppStore();

  if (models.length === 0) return null;

  return (
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
  );
};

export default ModelSelection;