import { connect } from '@lancedb/lancedb';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

class VectorDBSetup {
  constructor() {
    // Set up LanceDB path
    this.dbPath = path.join(process.cwd(), 'lancedb');
    this.tableName = 'swapi_data';
    this.db = null;
    this.table = null;
    console.log(`LanceDB configured at: ${this.dbPath}`);
  }

  async initialize(openaiApiKey) {
    try {
      // Initialize OpenAI client
      this.openai = new OpenAI({ apiKey: openaiApiKey });
      
      // Connect to LanceDB (creates directory if it doesn't exist)
      this.db = await connect(this.dbPath);
      
      // Check if table exists, if so drop it to recreate with fresh data
      const tableNames = await this.db.tableNames();
      if (tableNames.includes(this.tableName)) {
        await this.db.dropTable(this.tableName);
      }
      
      console.log('Vector database initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize vector database:', error.message);
      return false;
    }
  }

  async generateEmbedding(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Failed to generate embedding:', error.message);
      throw error;
    }
  }

  async ingestData() {
    try {
      // Read the database.json file
      const dbData = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
      
      const records = [];
      let idCounter = 0;

      // Process each entity type
      for (const [entityType, entities] of Object.entries(dbData)) {
        console.log(`Processing ${entityType}...`);
        
        if (Array.isArray(entities)) {
          for (const entity of entities) {
            try {
              // Create a comprehensive text representation of the entity with relationships
              const textContent = this.createTextContent(entityType, entity, dbData);
              
              // Generate embedding
              const embedding = await this.generateEmbedding(textContent);
              
              // Create record for LanceDB
              const record = {
                id: `${entityType}_${entity.id || idCounter++}`,
                text: textContent,
                vector: embedding,
                entity_type: entityType,
                entity_id: entity.id,
                ...this.extractMetadata(entity)
              };
              
              records.push(record);
              
              // Small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
              console.error(`Failed to process ${entityType} entity:`, error.message);
            }
          }
        }
      }

      // Create table and add all records
      this.table = await this.db.createTable(this.tableName, records);

      console.log(`Successfully ingested ${records.length} documents into vector database`);
      return true;
    } catch (error) {
      console.error('Failed to ingest data:', error.message);
      return false;
    }
  }

  createTextContent(entityType, entity, dbData) {
    const content = [];
    
    // Add entity type and basic info
    content.push(`This is a ${entityType.slice(0, -1)} from Star Wars.`);
    
    // Add all textual properties
    for (const [key, value] of Object.entries(entity)) {
      if (typeof value === 'string' && value.trim() && key !== 'id') {
        if (key === 'name' || key === 'title') {
          content.push(`Name: ${value}`);
        } else if (key === 'opening_crawl') {
          content.push(`Story: ${value.replace(/\r\n/g, ' ')}`);
        } else if (key === 'description' || key === 'model' || key === 'manufacturer') {
          content.push(`${key}: ${value}`);
        } else {
          content.push(`${key.replace(/_/g, ' ')}: ${value}`);
        }
      } else if (typeof value === 'number' && key !== 'id') {
        content.push(`${key.replace(/_/g, ' ')}: ${value}`);
      }
    }
    
    // Add relationship information
    this.addRelationshipInfo(content, entityType, entity, dbData);
    
    return content.join('. ');
  }

  addRelationshipInfo(content, entityType, entity, dbData) {
    if (!entity.id || !dbData) return;

    try {
      if (entityType === 'characters') {
        // Add films this character appears in
        const filmCharacters = dbData.films_characters || [];
        const characterFilms = filmCharacters
          .filter(fc => fc.character_id === entity.id)
          .map(fc => fc.film_id);
        
        if (characterFilms.length > 0) {
          const films = dbData.films || [];
          const filmTitles = films
            .filter(film => characterFilms.includes(film.id))
            .map(film => film.title);
          
          if (filmTitles.length > 0) {
            content.push(`Appears in movies: ${filmTitles.join(', ')}`);
          }
        }

        // Add starships this character pilots
        const starshipCharacters = dbData.starships_characters || [];
        const characterStarships = starshipCharacters
          .filter(sc => sc.character_id === entity.id)
          .map(sc => sc.starship_id);
        
        if (characterStarships.length > 0) {
          const starships = dbData.starships || [];
          const starshipNames = starships
            .filter(ship => characterStarships.includes(ship.id))
            .map(ship => ship.name || ship.starship_class);
          
          if (starshipNames.length > 0) {
            content.push(`Pilots starships: ${starshipNames.join(', ')}`);
          }
        }

        // Add vehicles this character uses
        const vehicleCharacters = dbData.vehicles_characters || [];
        const characterVehicles = vehicleCharacters
          .filter(vc => vc.character_id === entity.id)
          .map(vc => vc.vehicle_id);
        
        if (characterVehicles.length > 0) {
          const vehicles = dbData.vehicles || [];
          const vehicleNames = vehicles
            .filter(vehicle => characterVehicles.includes(vehicle.id))
            .map(vehicle => vehicle.name || vehicle.vehicle_class);
          
          if (vehicleNames.length > 0) {
            content.push(`Uses vehicles: ${vehicleNames.join(', ')}`);
          }
        }

      } else if (entityType === 'films') {
        // Add characters that appear in this film
        const filmCharacters = dbData.films_characters || [];
        const filmCharacterIds = filmCharacters
          .filter(fc => fc.film_id === entity.id)
          .map(fc => fc.character_id);
        
        if (filmCharacterIds.length > 0) {
          const characters = dbData.characters || [];
          const characterNames = characters
            .filter(char => filmCharacterIds.includes(char.id))
            .map(char => char.name);
          
          if (characterNames.length > 0) {
            content.push(`Features characters: ${characterNames.join(', ')}`);
          }
        }

        // Add planets that appear in this film
        const filmPlanets = dbData.films_planets || [];
        const filmPlanetIds = filmPlanets
          .filter(fp => fp.film_id === entity.id)
          .map(fp => fp.planet_id);
        
        if (filmPlanetIds.length > 0) {
          const planets = dbData.planets || [];
          const planetNames = planets
            .filter(planet => filmPlanetIds.includes(planet.id))
            .map(planet => planet.name);
          
          if (planetNames.length > 0) {
            content.push(`Features planets: ${planetNames.join(', ')}`);
          }
        }

        // Add starships that appear in this film
        const filmStarships = dbData.films_starships || [];
        const filmStarshipIds = filmStarships
          .filter(fs => fs.film_id === entity.id)
          .map(fs => fs.starship_id);
        
        if (filmStarshipIds.length > 0) {
          const starships = dbData.starships || [];
          const starshipNames = starships
            .filter(ship => filmStarshipIds.includes(ship.id))
            .map(ship => ship.name || ship.starship_class);
          
          if (starshipNames.length > 0) {
            content.push(`Features starships: ${starshipNames.join(', ')}`);
          }
        }

      } else if (entityType === 'starships') {
        // Add characters that pilot this starship
        const starshipCharacters = dbData.starships_characters || [];
        const starshipCharacterIds = starshipCharacters
          .filter(sc => sc.starship_id === entity.id)
          .map(sc => sc.character_id);
        
        if (starshipCharacterIds.length > 0) {
          const characters = dbData.characters || [];
          const characterNames = characters
            .filter(char => starshipCharacterIds.includes(char.id))
            .map(char => char.name);
          
          if (characterNames.length > 0) {
            content.push(`Piloted by: ${characterNames.join(', ')}`);
          }
        }

        // Add films this starship appears in
        const filmStarships = dbData.films_starships || [];
        const starshipFilms = filmStarships
          .filter(fs => fs.starship_id === entity.id)
          .map(fs => fs.film_id);
        
        if (starshipFilms.length > 0) {
          const films = dbData.films || [];
          const filmTitles = films
            .filter(film => starshipFilms.includes(film.id))
            .map(film => film.title);
          
          if (filmTitles.length > 0) {
            content.push(`Appears in movies: ${filmTitles.join(', ')}`);
          }
        }

      } else if (entityType === 'vehicles') {
        // Add characters that use this vehicle
        const vehicleCharacters = dbData.vehicles_characters || [];
        const vehicleCharacterIds = vehicleCharacters
          .filter(vc => vc.vehicle_id === entity.id)
          .map(vc => vc.character_id);
        
        if (vehicleCharacterIds.length > 0) {
          const characters = dbData.characters || [];
          const characterNames = characters
            .filter(char => vehicleCharacterIds.includes(char.id))
            .map(char => char.name);
          
          if (characterNames.length > 0) {
            content.push(`Used by: ${characterNames.join(', ')}`);
          }
        }

        // Add films this vehicle appears in
        const filmVehicles = dbData.films_vehicles || [];
        const vehicleFilms = filmVehicles
          .filter(fv => fv.vehicle_id === entity.id)
          .map(fv => fv.film_id);
        
        if (vehicleFilms.length > 0) {
          const films = dbData.films || [];
          const filmTitles = films
            .filter(film => vehicleFilms.includes(film.id))
            .map(film => film.title);
          
          if (filmTitles.length > 0) {
            content.push(`Appears in movies: ${filmTitles.join(', ')}`);
          }
        }

      } else if (entityType === 'planets') {
        // Add films this planet appears in
        const filmPlanets = dbData.films_planets || [];
        const planetFilms = filmPlanets
          .filter(fp => fp.planet_id === entity.id)
          .map(fp => fp.film_id);
        
        if (planetFilms.length > 0) {
          const films = dbData.films || [];
          const filmTitles = films
            .filter(film => planetFilms.includes(film.id))
            .map(film => film.title);
          
          if (filmTitles.length > 0) {
            content.push(`Appears in movies: ${filmTitles.join(', ')}`);
          }
        }

        // Add characters from this planet
        const characters = dbData.characters || [];
        const planetCharacters = characters
          .filter(char => char.homeworld === entity.id)
          .map(char => char.name);
        
        if (planetCharacters.length > 0) {
          content.push(`Home to characters: ${planetCharacters.join(', ')}`);
        }

      } else if (entityType === 'species') {
        // Add films this species appears in
        const filmSpecies = dbData.films_species || [];
        const speciesFilms = filmSpecies
          .filter(fs => fs.species_id === entity.id)
          .map(fs => fs.film_id);
        
        if (speciesFilms.length > 0) {
          const films = dbData.films || [];
          const filmTitles = films
            .filter(film => speciesFilms.includes(film.id))
            .map(film => film.title);
          
          if (filmTitles.length > 0) {
            content.push(`Appears in movies: ${filmTitles.join(', ')}`);
          }
        }

        // Add characters of this species
        const characters = dbData.characters || [];
        const speciesCharacters = characters
          .filter(char => char.species_id === entity.id)
          .map(char => char.name);
        
        if (speciesCharacters.length > 0) {
          content.push(`Characters of this species: ${speciesCharacters.join(', ')}`);
        }
      }
    } catch (error) {
      console.error(`Error adding relationship info for ${entityType}:`, error.message);
    }
  }

  extractMetadata(entity) {
    const metadata = {};
    
    // Extract key searchable fields
    if (entity.name) metadata.name = entity.name;
    if (entity.title) metadata.title = entity.title;
    if (entity.episode_id) metadata.episode_id = entity.episode_id;
    if (entity.director) metadata.director = entity.director;
    if (entity.producer) metadata.producer = entity.producer;
    if (entity.homeworld) metadata.homeworld = entity.homeworld;
    if (entity.species) metadata.species = entity.species;
    
    return metadata;
  }

  async searchSimilar(query, apiKey, limit = 5) {
    try {
      // Generate embedding for the query
      this.openai = new OpenAI({ apiKey });
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Get table if not already loaded
      if (!this.table) {
        this.table = await this.db.openTable(this.tableName);
      }
      
      // Search for similar documents using vector similarity
      const results = await this.table
        .vectorSearch(queryEmbedding)
        .limit(limit)
        .toArray();
      
      // Format results to match the expected ChromaDB structure
      const formattedResults = {
        documents: [results.map(r => r.text)],
        metadatas: [results.map(r => ({
          entity_type: r.entity_type,
          entity_id: r.entity_id,
          name: r.name || undefined,
          title: r.title || undefined,
          episode_id: r.episode_id || undefined,
          director: r.director || undefined,
          producer: r.producer || undefined,
          homeworld: r.homeworld || undefined,
          species: r.species || undefined
        }))],
        distances: [results.map(r => r._distance || 0)]
      };
      
      return formattedResults;
    } catch (error) {
      console.error('Failed to search similar documents:', error.message);
      throw error;
    }
  }

  async getCollection() {
    try {
      if (!this.db) {
        return null;
      }
      const tableNames = await this.db.tableNames();
      return tableNames.includes(this.tableName) ? { name: this.tableName } : null;
    } catch (error) {
      return null;
    }
  }

  async getStatus() {
    try {
      if (!this.db) {
        return 'not_initialized';
      }
      const tableNames = await this.db.tableNames();
      return tableNames.includes(this.tableName) ? 'ready' : 'not_initialized';
    } catch (error) {
      return 'error';
    }
  }
}

export default VectorDBSetup;