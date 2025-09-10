import { jest } from '@jest/globals';
import { getCharacterTool } from '../langchain-tools.js';

describe('LangChain Tools Input Validation', () => {
  describe('getCharacterTool input validation', () => {
    it('should reject invalid ID (negative number)', async () => {
      const result = await getCharacterTool.func({ id: -1 });
      const parsed = JSON.parse(result);
      
      expect(parsed.error).toBeDefined();
      expect(parsed.error).toContain('Invalid character ID');
      expect(parsed.error).toContain('-1');
    });

    it('should reject invalid ID (zero)', async () => {
      const result = await getCharacterTool.func({ id: 0 });
      const parsed = JSON.parse(result);
      
      expect(parsed.error).toBeDefined();
      expect(parsed.error).toContain('Invalid character ID');
      expect(parsed.error).toContain('0');
    });

    it('should reject invalid ID (non-integer)', async () => {
      const result = await getCharacterTool.func({ id: 1.5 });
      const parsed = JSON.parse(result);
      
      expect(parsed.error).toBeDefined();
      expect(parsed.error).toContain('Invalid character ID');
      expect(parsed.error).toContain('1.5');
    });

    it('should include API call info for invalid IDs', async () => {
      const result = await getCharacterTool.func({ id: -1 });
      const parsed = JSON.parse(result);
      
      expect(parsed.apiCall).toBeDefined();
      expect(parsed.apiCall.error).toContain('Invalid ID');
      expect(parsed.apiCall.method).toBe('GET');
    });
  });
});