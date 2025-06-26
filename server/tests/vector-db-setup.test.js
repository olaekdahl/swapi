import { jest } from '@jest/globals';
import VectorDBSetup from '../vector-db-setup.js';

describe('VectorDBSetup', () => {
  let vectorDB;
  let progressCallback;

  beforeEach(() => {
    jest.clearAllMocks();
    progressCallback = jest.fn();
    vectorDB = new VectorDBSetup(progressCallback);
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      const db = new VectorDBSetup();
      
      expect(db.tableName).toBe('swapi_data');
      expect(db.db).toBeNull();
      expect(db.table).toBeNull();
    });

    it('should set progress callback if provided', () => {
      const callback = jest.fn();
      const db = new VectorDBSetup(callback);
      
      expect(db.progressCallback).toBe(callback);
    });

    it('should set dbPath based on current working directory', () => {
      const db = new VectorDBSetup();
      expect(db.dbPath).toContain('lancedb');
    });
  });

  describe('emitProgress', () => {
    it('should call progress callback if set', () => {
      vectorDB.emitProgress('test_type', 'test message', { data: 'test' });
      
      expect(progressCallback).toHaveBeenCalledWith('test_type', 'test message', { data: 'test' });
    });

    it('should not throw if progress callback is null', () => {
      const db = new VectorDBSetup(null);
      
      expect(() => db.emitProgress('test', 'message')).not.toThrow();
    });

    it('should handle multiple progress updates', () => {
      vectorDB.emitProgress('step1', 'message1');
      vectorDB.emitProgress('step2', 'message2', { progress: 50 });
      
      expect(progressCallback).toHaveBeenCalledTimes(2);
      expect(progressCallback).toHaveBeenNthCalledWith(1, 'step1', 'message1', {});
      expect(progressCallback).toHaveBeenNthCalledWith(2, 'step2', 'message2', { progress: 50 });
    });
  });

  describe('createTextContent', () => {
    it('should create text content for character entity', () => {
      const entity = {
        id: 1,
        name: 'Luke Skywalker',
        height: '172',
        hair_color: 'blond'
      };
      const dbData = { characters: [entity] };

      const result = vectorDB.createTextContent('characters', entity, dbData);
      
      expect(result).toContain('This is a character from Star Wars');
      expect(result).toContain('Name: Luke Skywalker');
      expect(result).toContain('height: 172');
      expect(result).toContain('hair color: blond');
    });

    it('should create text content for film entity', () => {
      const entity = {
        id: 1,
        title: 'A New Hope',
        director: 'George Lucas',
        opening_crawl: 'It is a period of civil war.\r\nRebel spaceships...'
      };
      const dbData = { films: [entity] };

      const result = vectorDB.createTextContent('films', entity, dbData);
      
      expect(result).toContain('This is a film from Star Wars');
      expect(result).toContain('Name: A New Hope');
      expect(result).toContain('director: George Lucas');
      expect(result).toContain('Story: It is a period of civil war. Rebel spaceships...');
    });

    it('should handle entities with relationships', () => {
      const character = { id: 1, name: 'Luke Skywalker' };
      const film = { id: 1, title: 'A New Hope' };
      const dbData = {
        characters: [character],
        films: [film],
        films_characters: [{ film_id: 1, character_id: 1 }]
      };

      const result = vectorDB.createTextContent('characters', character, dbData);
      
      expect(result).toContain('Appears in movies: A New Hope');
    });

    it('should filter out id and empty values', () => {
      const entity = {
        id: 1,
        name: 'Test',
        empty_field: '',
        null_field: null,
        undefined_field: undefined
      };

      const result = vectorDB.createTextContent('characters', entity, {});
      
      expect(result).not.toContain('id:');
      expect(result).not.toContain('empty_field');
      expect(result).not.toContain('null_field');
      expect(result).not.toContain('undefined_field');
    });

    it('should handle numerical values', () => {
      const entity = {
        id: 1,
        name: 'Test Ship',
        length: 1200,
        crew: 5
      };

      const result = vectorDB.createTextContent('starships', entity, {});
      
      expect(result).toContain('length: 1200');
      expect(result).toContain('crew: 5');
    });

    it('should handle different entity types', () => {
      const planet = { id: 1, name: 'Tatooine', climate: 'arid' };
      const starship = { id: 2, name: 'X-wing', model: 'T-65' };

      const planetContent = vectorDB.createTextContent('planets', planet, {});
      const starshipContent = vectorDB.createTextContent('starships', starship, {});
      
      expect(planetContent).toContain('This is a planet from Star Wars');
      expect(starshipContent).toContain('This is a starship from Star Wars');
    });
  });

  describe('extractMetadata', () => {
    it('should extract relevant metadata fields', () => {
      const entity = {
        id: 1,
        name: 'Luke Skywalker',
        title: 'Jedi',
        episode_id: 4,
        director: 'George Lucas',
        homeworld: 1,
        species: 1,
        irrelevant_field: 'should not be included'
      };

      const result = vectorDB.extractMetadata(entity);
      
      expect(result).toEqual({
        name: 'Luke Skywalker',
        title: 'Jedi',
        episode_id: 4,
        director: 'George Lucas',
        homeworld: 1,
        species: 1
      });
      expect(result).not.toHaveProperty('irrelevant_field');
      expect(result).not.toHaveProperty('id');
    });

    it('should handle entity with missing fields', () => {
      const entity = { id: 1, name: 'Test' };

      const result = vectorDB.extractMetadata(entity);
      
      expect(result).toEqual({ name: 'Test' });
    });

    it('should only include defined metadata fields', () => {
      const entity = {
        id: 1,
        name: 'Test',
        producer: 'Test Producer',
        unknown_field: 'ignored'
      };

      const result = vectorDB.extractMetadata(entity);
      
      expect(result).toEqual({
        name: 'Test',
        producer: 'Test Producer'
      });
    });
  });

  describe('isAttributeBasedQuery', () => {
    it('should identify eye color queries', () => {
      expect(vectorDB.isAttributeBasedQuery('red eyes')).toBe(true);
      expect(vectorDB.isAttributeBasedQuery('characters with blue eyes')).toBe(true);
      expect(vectorDB.isAttributeBasedQuery('eyes are green')).toBe(true);
    });

    it('should identify hair color queries', () => {
      expect(vectorDB.isAttributeBasedQuery('red hair')).toBe(true);
      expect(vectorDB.isAttributeBasedQuery('hair is brown')).toBe(true);
      expect(vectorDB.isAttributeBasedQuery('brown hair')).toBe(true);
    });

    it('should identify skin color queries', () => {
      expect(vectorDB.isAttributeBasedQuery('green skin')).toBe(true);
      expect(vectorDB.isAttributeBasedQuery('skin is fair')).toBe(true);
      expect(vectorDB.isAttributeBasedQuery('white skin')).toBe(true);
    });

    it('should identify gender queries', () => {
      expect(vectorDB.isAttributeBasedQuery('female characters')).toBe(true);
      expect(vectorDB.isAttributeBasedQuery('male')).toBe(true);
      expect(vectorDB.isAttributeBasedQuery('gender is female')).toBe(true);
    });

    it('should identify physical attribute queries', () => {
      expect(vectorDB.isAttributeBasedQuery('tall characters')).toBe(true);
      expect(vectorDB.isAttributeBasedQuery('height')).toBe(true);
      expect(vectorDB.isAttributeBasedQuery('mass')).toBe(true);
      expect(vectorDB.isAttributeBasedQuery('weight')).toBe(true);
    });

    it('should identify species and homeworld queries', () => {
      expect(vectorDB.isAttributeBasedQuery('species is human')).toBe(true);
      expect(vectorDB.isAttributeBasedQuery('homeworld')).toBe(true);
    });

    it('should not identify non-attribute queries', () => {
      expect(vectorDB.isAttributeBasedQuery('Luke Skywalker')).toBe(false);
      expect(vectorDB.isAttributeBasedQuery('Death Star')).toBe(false);
      expect(vectorDB.isAttributeBasedQuery('Tell me about Jedi')).toBe(false);
      expect(vectorDB.isAttributeBasedQuery('What happens in Episode IV?')).toBe(false);
    });
  });

  describe('extractKeyTerms', () => {
    it('should extract color terms', () => {
      const result = vectorDB.extractKeyTerms('characters with red eyes');
      
      expect(result).toContain('red');
      expect(result).toContain('eyes');
    });

    it('should extract special eye color combinations', () => {
      const result = vectorDB.extractKeyTerms('red eyes');
      
      expect(result).toContain('eye color: red');
    });

    it('should handle queries with no key terms', () => {
      const result = vectorDB.extractKeyTerms('tell me about the force');
      
      expect(result).toEqual(['tell me about the force']);
    });

    it('should extract multiple attribute terms', () => {
      const result = vectorDB.extractKeyTerms('tall male characters with blue eyes');
      
      expect(result).toContain('blue');
      expect(result).toContain('eyes');
      expect(result).toContain('male');
    });

    it('should handle hair color terms', () => {
      const result = vectorDB.extractKeyTerms('blond hair');
      
      expect(result).toContain('blond');
      expect(result).toContain('hair');
    });

    it('should handle skin color terms', () => {
      const result = vectorDB.extractKeyTerms('dark skin');
      
      expect(result).toContain('dark');
      expect(result).toContain('skin');
    });
  });

  describe('addRelationshipInfo', () => {
    it('should handle missing entity id', () => {
      const content = [];
      const entity = { name: 'Test' }; // no id
      
      expect(() => {
        vectorDB.addRelationshipInfo(content, 'characters', entity, {});
      }).not.toThrow();
      
      expect(content).toHaveLength(0);
    });

    it('should handle missing dbData', () => {
      const content = [];
      const entity = { id: 1, name: 'Test' };
      
      expect(() => {
        vectorDB.addRelationshipInfo(content, 'characters', entity, null);
      }).not.toThrow();
      
      expect(content).toHaveLength(0);
    });

    it('should add character film relationships', () => {
      const content = [];
      const character = { id: 1, name: 'Luke Skywalker' };
      const dbData = {
        characters: [character],
        films: [{ id: 1, title: 'A New Hope' }],
        films_characters: [{ film_id: 1, character_id: 1 }]
      };
      
      vectorDB.addRelationshipInfo(content, 'characters', character, dbData);
      
      expect(content.join('. ')).toContain('Appears in movies: A New Hope');
    });

    it('should handle errors gracefully', () => {
      const content = [];
      const entity = { id: 1, name: 'Test' };
      const malformedDbData = {
        films_characters: 'not an array', // this will cause an error
        characters: [entity]
      };
      
      // The method should not throw but will log an error
      vectorDB.addRelationshipInfo(content, 'characters', entity, malformedDbData);
      
      // Should not have added any relationship info due to error
      expect(content).toHaveLength(0);
    });
  });

  describe('mergeAndRankResults', () => {
    it('should merge vector and keyword results', () => {
      const vectorResults = [
        { id: 'char_1', text: 'Luke', _distance: 0.1 },
        { id: 'char_2', text: 'Leia', _distance: 0.2 }
      ];
      const keywordResults = [
        { id: 'char_2', text: 'Leia' },
        { id: 'char_3', text: 'Han' }
      ];
      
      const result = vectorDB.mergeAndRankResults(vectorResults, keywordResults, 'test query');
      
      expect(result).toHaveLength(3);
      expect(result.map(r => r.id)).toContain('char_1');
      expect(result.map(r => r.id)).toContain('char_2');
      expect(result.map(r => r.id)).toContain('char_3');
    });

    it('should boost results that appear in both searches', () => {
      const vectorResults = [
        { id: 'char_1', text: 'Luke', _distance: 0.1 }
      ];
      const keywordResults = [
        { id: 'char_1', text: 'Luke' }
      ];
      
      const result = vectorDB.mergeAndRankResults(vectorResults, keywordResults, 'test');
      
      expect(result[0].combinedScore).toBeGreaterThan(0.5); // Should have boost
    });

    it('should handle empty results', () => {
      const result = vectorDB.mergeAndRankResults([], [], 'test');
      
      expect(result).toHaveLength(0);
    });
  });
});