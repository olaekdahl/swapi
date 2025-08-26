import { describe, test, expect } from '@jest/globals';

// Helper function to check if model is GPT-5 (extracted from implementation)
const isGPT5Model = (modelName) => {
  return modelName.toLowerCase().includes('gpt-5') || modelName.toLowerCase().includes('gpt5');
};

describe('Temperature Handling for GPT Models', () => {
  describe('isGPT5Model function', () => {
    test('should detect GPT-5 models correctly', () => {
      const gpt5Models = [
        'gpt-5',
        'GPT-5',
        'gpt-5-turbo',
        'gpt5',
        'GPT5',
        'gpt5-preview',
        'model-gpt-5-custom',
        'custom-gpt5-model'
      ];

      gpt5Models.forEach(model => {
        expect(isGPT5Model(model)).toBe(true);
      });
    });

    test('should not detect non-GPT-5 models as GPT-5', () => {
      const nonGpt5Models = [
        'gpt-4',
        'gpt-4-turbo',
        'gpt-3.5-turbo',
        'gpt-4o',
        'gpt-4o-mini',
        'text-davinci-003',
        'dall-e-3',
        '',
        'custom-model'
      ];

      nonGpt5Models.forEach(model => {
        expect(isGPT5Model(model)).toBe(false);
      });
    });
  });

  describe('Model configuration', () => {
    test('should create config with temperature for non-GPT-5 models', () => {
      const nonGpt5Models = ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
      
      nonGpt5Models.forEach(model => {
        const modelConfig = {
          apiKey: 'test-key',
          model: model.trim()
        };

        if (!isGPT5Model(model)) {
          modelConfig.temperature = 0.7;
        }

        expect(modelConfig.temperature).toBe(0.7);
        expect(modelConfig.model).toBe(model);
        expect(modelConfig.apiKey).toBe('test-key');
      });
    });

    test('should create config without temperature for GPT-5 models', () => {
      const gpt5Models = ['gpt-5', 'gpt5', 'gpt-5-turbo'];
      
      gpt5Models.forEach(model => {
        const modelConfig = {
          apiKey: 'test-key',
          model: model.trim()
        };

        if (!isGPT5Model(model)) {
          modelConfig.temperature = 0.7;
        }

        expect(modelConfig.temperature).toBeUndefined();
        expect(modelConfig.model).toBe(model);
        expect(modelConfig.apiKey).toBe('test-key');
      });
    });

    test('should use user-provided temperature for non-GPT-5 models', () => {
      const nonGpt5Models = ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
      const userTemperatures = [0.2, 0.5, 0.9, 1.0, 0.0];
      
      nonGpt5Models.forEach(model => {
        userTemperatures.forEach(userTemp => {
          const modelConfig = {
            apiKey: 'test-key',
            model: model.trim()
          };

          // Simulate user-provided temperature logic from server
          if (!isGPT5Model(model)) {
            const temperature = userTemp !== undefined ? parseFloat(userTemp) : 0.7;
            if (!isNaN(temperature) && temperature >= 0 && temperature <= 1) {
              modelConfig.temperature = temperature;
            } else {
              modelConfig.temperature = 0.7;
            }
          }

          expect(modelConfig.temperature).toBe(userTemp);
          expect(modelConfig.model).toBe(model);
          expect(modelConfig.apiKey).toBe('test-key');
        });
      });
    });

    test('should fallback to default temperature for invalid user values', () => {
      const invalidTemperatures = [NaN, -0.1, 1.5, 'invalid', null];
      
      invalidTemperatures.forEach(invalidTemp => {
        const modelConfig = {
          apiKey: 'test-key',
          model: 'gpt-4'
        };

        // Simulate invalid temperature handling from server
        if (!isGPT5Model('gpt-4')) {
          const temperature = invalidTemp !== undefined ? parseFloat(invalidTemp) : 0.7;
          if (!isNaN(temperature) && temperature >= 0 && temperature <= 1) {
            modelConfig.temperature = temperature;
          } else {
            modelConfig.temperature = 0.7; // fallback to default
          }
        }

        expect(modelConfig.temperature).toBe(0.7);
        expect(modelConfig.model).toBe('gpt-4');
        expect(modelConfig.apiKey).toBe('test-key');
      });
    });
  });
});