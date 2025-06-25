import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

// Tool to get character details by ID
export const getCharacterTool = new DynamicStructuredTool({
  name: 'get_character',
  description: 'Get detailed information about a Star Wars character by their ID. Use this when you need more details about a specific character.',
  schema: z.object({
    id: z.number().describe('The ID of the character to retrieve')
  }),
  func: async ({ id }) => {
    try {
      const response = await axios.get(`${BASE_URL}/characters/${id}`);
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return `Error fetching character ${id}: ${error.message}`;
    }
  }
});

// Tool to get character's films
export const getCharacterFilmsTool = new DynamicStructuredTool({
  name: 'get_character_films',
  description: 'Get all films that a specific character appears in. Use this to find what movies a character is featured in.',
  schema: z.object({
    id: z.number().describe('The ID of the character')
  }),
  func: async ({ id }) => {
    try {
      const response = await axios.get(`${BASE_URL}/characters/${id}/films`);
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return `Error fetching films for character ${id}: ${error.message}`;
    }
  }
});

// Tool to get film details by ID
export const getFilmTool = new DynamicStructuredTool({
  name: 'get_film',
  description: 'Get detailed information about a Star Wars film by its ID. Use this when you need more details about a specific movie.',
  schema: z.object({
    id: z.number().describe('The ID of the film to retrieve')
  }),
  func: async ({ id }) => {
    try {
      const response = await axios.get(`${BASE_URL}/films/${id}`);
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return `Error fetching film ${id}: ${error.message}`;
    }
  }
});

// Tool to get film's characters
export const getFilmCharactersTool = new DynamicStructuredTool({
  name: 'get_film_characters',
  description: 'Get all characters that appear in a specific film. Use this to find who appears in a movie.',
  schema: z.object({
    id: z.number().describe('The ID of the film')
  }),
  func: async ({ id }) => {
    try {
      const response = await axios.get(`${BASE_URL}/films/${id}/characters`);
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return `Error fetching characters for film ${id}: ${error.message}`;
    }
  }
});

// Tool to get planet details by ID
export const getPlanetTool = new DynamicStructuredTool({
  name: 'get_planet',
  description: 'Get detailed information about a Star Wars planet by its ID. Use this when you need more details about a specific planet.',
  schema: z.object({
    id: z.number().describe('The ID of the planet to retrieve')
  }),
  func: async ({ id }) => {
    try {
      const response = await axios.get(`${BASE_URL}/planets/${id}`);
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return `Error fetching planet ${id}: ${error.message}`;
    }
  }
});

// Tool to get planet's characters
export const getPlanetCharactersTool = new DynamicStructuredTool({
  name: 'get_planet_characters',
  description: 'Get all characters that are from a specific planet. Use this to find who is from a particular homeworld.',
  schema: z.object({
    id: z.number().describe('The ID of the planet')
  }),
  func: async ({ id }) => {
    try {
      const response = await axios.get(`${BASE_URL}/planets/${id}/characters`);
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return `Error fetching characters for planet ${id}: ${error.message}`;
    }
  }
});

// Tool to get starship details by ID
export const getStarshipTool = new DynamicStructuredTool({
  name: 'get_starship',
  description: 'Get detailed information about a Star Wars starship by its ID. Use this when you need more details about a specific starship.',
  schema: z.object({
    id: z.number().describe('The ID of the starship to retrieve')
  }),
  func: async ({ id }) => {
    try {
      const response = await axios.get(`${BASE_URL}/starships/${id}`);
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return `Error fetching starship ${id}: ${error.message}`;
    }
  }
});

// Tool to get starship's characters
export const getStarshipCharactersTool = new DynamicStructuredTool({
  name: 'get_starship_characters',
  description: 'Get all characters that pilot a specific starship. Use this to find who pilots a particular ship.',
  schema: z.object({
    id: z.number().describe('The ID of the starship')
  }),
  func: async ({ id }) => {
    try {
      const response = await axios.get(`${BASE_URL}/starships/${id}/characters`);
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return `Error fetching characters for starship ${id}: ${error.message}`;
    }
  }
});

// Tool to get species details by ID
export const getSpeciesTool = new DynamicStructuredTool({
  name: 'get_species',
  description: 'Get detailed information about a Star Wars species by its ID. Use this when you need more details about a specific species.',
  schema: z.object({
    id: z.number().describe('The ID of the species to retrieve')
  }),
  func: async ({ id }) => {
    try {
      const response = await axios.get(`${BASE_URL}/species/${id}`);
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return `Error fetching species ${id}: ${error.message}`;
    }
  }
});

// Tool to get species' characters
export const getSpeciesCharactersTool = new DynamicStructuredTool({
  name: 'get_species_characters',
  description: 'Get all characters that belong to a specific species. Use this to find characters of a particular species.',
  schema: z.object({
    id: z.number().describe('The ID of the species')
  }),
  func: async ({ id }) => {
    try {
      const response = await axios.get(`${BASE_URL}/species/${id}/characters`);
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return `Error fetching characters for species ${id}: ${error.message}`;
    }
  }
});

// Tool to get vehicle details by ID
export const getVehicleTool = new DynamicStructuredTool({
  name: 'get_vehicle',
  description: 'Get detailed information about a Star Wars vehicle by its ID. Use this when you need more details about a specific vehicle.',
  schema: z.object({
    id: z.number().describe('The ID of the vehicle to retrieve')
  }),
  func: async ({ id }) => {
    try {
      const response = await axios.get(`${BASE_URL}/vehicles/${id}`);
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return `Error fetching vehicle ${id}: ${error.message}`;
    }
  }
});

// Tool to search all characters with a specific attribute
export const searchCharactersTool = new DynamicStructuredTool({
  name: 'search_characters',
  description: 'Search all characters to find those with specific attributes like eye color, hair color, etc. Use this for attribute-based queries.',
  schema: z.object({
    attribute: z.string().describe('The attribute to search for (e.g., "red eyes", "blue hair", "yellow skin")'),
  }),
  func: async ({ attribute }) => {
    try {
      const response = await axios.get(`${BASE_URL}/characters`);
      const characters = response.data;
      
      // Parse the attribute search
      const attributeLower = attribute.toLowerCase();
      let matchedCharacters = [];
      
      if (attributeLower.includes('eye')) {
        const color = attributeLower.match(/(red|blue|green|yellow|brown|black|white|orange|purple|pink)/)?.[1];
        if (color) {
          matchedCharacters = characters.filter(char => 
            char.eye_color && char.eye_color.toLowerCase().includes(color)
          );
        }
      } else if (attributeLower.includes('hair')) {
        const color = attributeLower.match(/(red|blue|green|yellow|brown|black|white|orange|purple|pink|blond|blonde)/)?.[1];
        if (color) {
          matchedCharacters = characters.filter(char => 
            char.hair_color && char.hair_color.toLowerCase().includes(color)
          );
        }
      } else if (attributeLower.includes('skin')) {
        const color = attributeLower.match(/(red|blue|green|yellow|brown|black|white|orange|purple|pink|fair|dark|light)/)?.[1];
        if (color) {
          matchedCharacters = characters.filter(char => 
            char.skin_color && char.skin_color.toLowerCase().includes(color)
          );
        }
      } else if (attributeLower.includes('male') || attributeLower.includes('female')) {
        const gender = attributeLower.includes('male') ? 'male' : 'female';
        matchedCharacters = characters.filter(char => 
          char.gender && char.gender.toLowerCase() === gender
        );
      }
      
      // Return only relevant fields for matched characters
      const result = matchedCharacters.map(char => ({
        id: char.id,
        name: char.name,
        eye_color: char.eye_color,
        hair_color: char.hair_color,
        skin_color: char.skin_color,
        gender: char.gender
      }));
      
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return `Error searching characters: ${error.message}`;
    }
  }
});

// Export all tools as an array
export const swapiTools = [
  getCharacterTool,
  getCharacterFilmsTool,
  getFilmTool,
  getFilmCharactersTool,
  getPlanetTool,
  getPlanetCharactersTool,
  getStarshipTool,
  getStarshipCharactersTool,
  getSpeciesTool,
  getSpeciesCharactersTool,
  getVehicleTool,
  searchCharactersTool
];

// Helper function to extract entity IDs from vector search results
export function extractEntityIds(context) {
  const entityIds = {
    characters: [],
    films: [],
    planets: [],
    starships: [],
    species: [],
    vehicles: []
  };
  
  context.forEach(item => {
    if (item.metadata && item.metadata.entity_type && item.metadata.entity_id) {
      const entityType = item.metadata.entity_type;
      const entityId = item.metadata.entity_id;
      
      if (entityIds[entityType] && !entityIds[entityType].includes(entityId)) {
        entityIds[entityType].push(entityId);
      }
    }
  });
  
  return entityIds;
}