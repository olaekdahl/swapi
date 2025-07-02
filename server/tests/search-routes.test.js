import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import jsonServer from 'json-server';

describe('Character Search Routes', () => {
  let app;
  let router;

  beforeAll(() => {
    // Create a minimal Express app for testing
    app = express();
    app.use(express.json());
    
    // Initialize json-server router with test data
    router = jsonServer.router({
      characters: [
        {
          id: 1,
          name: "Luke Skywalker",
          gender: "male",
          skin_color: "fair",
          hair_color: "blond",
          height: "172",
          eye_color: "blue",
          mass: "77",
          homeworld: 1,
          birth_year: "19BBY",
          species_id: 1
        },
        {
          id: 2,
          name: "C-3PO",
          gender: "n/a",
          skin_color: "gold",
          hair_color: "n/a",
          height: "167",
          eye_color: "yellow",
          mass: "75",
          homeworld: 1,
          birth_year: "112BBY",
          species_id: 2
        },
        {
          id: 4,
          name: "Darth Vader",
          gender: "male",
          skin_color: "white",
          hair_color: "none",
          height: "202",
          eye_color: "yellow",
          mass: "136",
          homeworld: 13,
          birth_year: "41.9BBY",
          species_id: 1
        }
      ]
    });

    // Add the search routes (same as in index.js)
    app.get('/api/people', (req, res) => {
      const { search } = req.query;
      let characters = router.db.get('characters').value();
      
      if (search) {
        characters = characters.filter(character => 
          character.name && character.name.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      res.json(characters);
    });

    app.get('/api/characters', (req, res) => {
      const { search } = req.query;
      let characters = router.db.get('characters').value();
      
      if (search) {
        characters = characters.filter(character => 
          character.name && character.name.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      res.json(characters);
    });
  });

  describe('GET /api/people', () => {
    it('should return all characters when no search parameter is provided', async () => {
      const response = await request(app)
        .get('/api/people')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0].name).toBe('Luke Skywalker');
    });

    it('should return filtered characters when search parameter is provided', async () => {
      const response = await request(app)
        .get('/api/people?search=Luke')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Luke Skywalker');
      expect(response.body[0].id).toBe(1);
    });

    it('should perform case-insensitive search', async () => {
      const response = await request(app)
        .get('/api/people?search=luke')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Luke Skywalker');
    });

    it('should perform partial name search', async () => {
      const response = await request(app)
        .get('/api/people?search=Darth')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Darth Vader');
    });

    it('should return empty array when no matches found', async () => {
      const response = await request(app)
        .get('/api/people?search=Yoda')
        .expect(200);

      expect(response.body).toHaveLength(0);
    });

    it('should handle empty search parameter', async () => {
      const response = await request(app)
        .get('/api/people?search=')
        .expect(200);

      expect(response.body).toHaveLength(3);
    });
  });

  describe('GET /api/characters', () => {
    it('should return all characters when no search parameter is provided', async () => {
      const response = await request(app)
        .get('/api/characters')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0].name).toBe('Luke Skywalker');
    });

    it('should return filtered characters when search parameter is provided', async () => {
      const response = await request(app)
        .get('/api/characters?search=C-3PO')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('C-3PO');
      expect(response.body[0].id).toBe(2);
    });

    it('should perform case-insensitive search', async () => {
      const response = await request(app)
        .get('/api/characters?search=c-3po')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('C-3PO');
    });
  });
});