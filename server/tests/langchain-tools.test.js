import { jest } from '@jest/globals';
import { extractEntityIds } from '../langchain-tools.js';

describe('LangChain Tools - extractEntityIds', () => {
  describe('extractEntityIds function', () => {
    it('should extract entity IDs from context with metadata', () => {
      const context = [
        {
          metadata: {
            entity_type: 'characters',
            entity_id: 1
          }
        },
        {
          metadata: {
            entity_type: 'films',
            entity_id: 2
          }
        },
        {
          metadata: {
            entity_type: 'characters',
            entity_id: 3
          }
        }
      ];

      const result = extractEntityIds(context);

      expect(result).toEqual({
        characters: [1, 3],
        films: [2],
        planets: [],
        starships: [],
        species: [],
        vehicles: []
      });
    });

    it('should handle empty context', () => {
      const result = extractEntityIds([]);

      expect(result).toEqual({
        characters: [],
        films: [],
        planets: [],
        starships: [],
        species: [],
        vehicles: []
      });
    });

    it('should handle context items without metadata', () => {
      const context = [
        { text: 'some text' },
        {
          metadata: {
            entity_type: 'planets',
            entity_id: 5
          }
        }
      ];

      const result = extractEntityIds(context);

      expect(result).toEqual({
        characters: [],
        films: [],
        planets: [5],
        starships: [],
        species: [],
        vehicles: []
      });
    });

    it('should not duplicate entity IDs', () => {
      const context = [
        {
          metadata: {
            entity_type: 'starships',
            entity_id: 1
          }
        },
        {
          metadata: {
            entity_type: 'starships',
            entity_id: 1
          }
        }
      ];

      const result = extractEntityIds(context);

      expect(result.starships).toEqual([1]);
    });

    it('should handle invalid entity types', () => {
      const context = [
        {
          metadata: {
            entity_type: 'invalid_type',
            entity_id: 1
          }
        },
        {
          metadata: {
            entity_type: 'species',
            entity_id: 2
          }
        }
      ];

      const result = extractEntityIds(context);

      expect(result).toEqual({
        characters: [],
        films: [],
        planets: [],
        starships: [],
        species: [2],
        vehicles: []
      });
    });

    it('should handle missing entity_id or entity_type', () => {
      const context = [
        {
          metadata: {
            entity_type: 'characters'
            // missing entity_id
          }
        },
        {
          metadata: {
            entity_id: 1
            // missing entity_type
          }
        }
      ];

      const result = extractEntityIds(context);

      expect(result).toEqual({
        characters: [],
        films: [],
        planets: [],
        starships: [],
        species: [],
        vehicles: []
      });
    });

    it('should handle all entity types', () => {
      const context = [
        { metadata: { entity_type: 'characters', entity_id: 1 } },
        { metadata: { entity_type: 'films', entity_id: 2 } },
        { metadata: { entity_type: 'planets', entity_id: 3 } },
        { metadata: { entity_type: 'starships', entity_id: 4 } },
        { metadata: { entity_type: 'species', entity_id: 5 } },
        { metadata: { entity_type: 'vehicles', entity_id: 6 } }
      ];

      const result = extractEntityIds(context);

      expect(result).toEqual({
        characters: [1],
        films: [2],
        planets: [3],
        starships: [4],
        species: [5],
        vehicles: [6]
      });
    });

    it('should handle multiple entities of same type', () => {
      const context = [
        { metadata: { entity_type: 'characters', entity_id: 1 } },
        { metadata: { entity_type: 'characters', entity_id: 2 } },
        { metadata: { entity_type: 'characters', entity_id: 3 } },
        { metadata: { entity_type: 'films', entity_id: 1 } }
      ];

      const result = extractEntityIds(context);

      expect(result.characters).toEqual([1, 2, 3]);
      expect(result.films).toEqual([1]);
    });

    it('should handle edge cases with null/undefined values', () => {
      const context = [
        { metadata: null },
        { metadata: undefined },
        { metadata: { entity_type: null, entity_id: 1 } },
        { metadata: { entity_type: 'characters', entity_id: null } },
        { metadata: { entity_type: 'films', entity_id: 1 } }
      ];

      const result = extractEntityIds(context);

      expect(result).toEqual({
        characters: [],
        films: [1],
        planets: [],
        starships: [],
        species: [],
        vehicles: []
      });
    });
  });
});