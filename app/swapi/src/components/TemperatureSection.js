import React from 'react';
import useAppStore from '../store/useAppStore';

const TemperatureSection = () => {
  const { selectedModel, temperature, setTemperature } = useAppStore();

  // Helper function to check if model is GPT-5 (matching server logic)
  const isGPT5Model = (modelName) => {
    if (!modelName) return false;
    return modelName.toLowerCase().includes('gpt-5') || modelName.toLowerCase().includes('gpt5');
  };

  // Don't show temperature control for GPT-5 models or if no model selected
  if (!selectedModel || isGPT5Model(selectedModel)) {
    return null;
  }

  const handleTemperatureChange = (e) => {
    const value = parseFloat(e.target.value);
    setTemperature(value);
  };

  return (
    <div className="temperature-section">
      <label htmlFor="temperature">
        Temperature: {temperature}
        <span className="temperature-hint"> (Controls randomness: 0 = focused, 1 = creative)</span>
      </label>
      <input
        id="temperature"
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={temperature}
        onChange={handleTemperatureChange}
        className="temperature-slider"
      />
      <div className="temperature-values">
        <span>0 (Focused)</span>
        <span>1 (Creative)</span>
      </div>
    </div>
  );
};

export default TemperatureSection;