import { connect } from '@lancedb/lancedb';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

class VectorDBSetup {
  constructor(progressCallback = null) {
    // Set up LanceDB path
    this.dbPath = path.join(process.cwd(), 'lancedb');
    this.tableName = 'swapi_data';
    this.db = null;
    this.table = null;
    this.progressCallback = progressCallback;
    console.log(`LanceDB configured at: ${this.dbPath}`);
  }

  emitProgress(type, message, data = {}) {
    if (this.progressCallback) {
      this.progressCallback(type, message, data);
    }
  }

  async initialize(openaiApiKey) {
    try {
      this.emitProgress('vectordb_init', 'Initializing vector database...');
      
      // Initialize OpenAI client
      this.openai = new OpenAI({ apiKey: openaiApiKey });
      
      this.emitProgress('vectordb_init', 'Connecting to LanceDB...');
      // Connect to LanceDB (creates directory if it doesn't exist)
      this.db = await connect(this.dbPath);
      
      this.emitProgress('vectordb_init', 'Checking existing tables...');
      // Check if table exists - but don't drop it here, let ingestData handle it
      // This prevents issues where initialize is called multiple times
      const tableNames = await this.db.tableNames();
      if (tableNames.includes(this.tableName)) {
        console.log(`Table '${this.tableName}' already exists - will be handled during data ingestion`);
        this.emitProgress('vectordb_init', 'Found existing table - will refresh during data ingestion');
      } else {
        console.log(`No existing table '${this.tableName}' found - will create during data ingestion`);
        this.emitProgress('vectordb_init', 'No existing table found - will create during data ingestion');
      }
      
      this.emitProgress('vectordb_init', 'Vector database initialized successfully');
      console.log('Vector database initialized successfully');
      return true;
    } catch (error) {
      const errorMsg = 'Failed to initialize vector database: ' + error.message;
      this.emitProgress('vectordb_error', errorMsg);
      console.error(errorMsg);
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
      // Enhanced error logging for better debugging
      console.error('Failed to generate embedding:', {
        message: error.message,
        status: error.status,
        type: error.type,
        code: error.code,
        textLength: text ? text.length : 0,
        textPreview: text ? text.substring(0, 100) + '...' : 'No text provided'
      });
      
      // Check if this is a JSON parsing error from OpenAI response
      if (error.message && error.message.includes('Unexpected non-whitespace character after JSON')) {
        console.error('Detailed JSON parsing error context:', {
          errorPosition: error.message.match(/position (\d+)/)?.[1] || 'unknown',
          responseData: error.response?.data || 'No response data available',
          headers: error.response?.headers || 'No headers available'
        });
        this.emitProgress('vectordb_warning', `OpenAI API returned malformed JSON response. This may be due to rate limiting or server issues. Error: ${error.message}`);
      }
      
      throw error;
    }
  }

  async ingestData() {
    try {
      this.emitProgress('vectordb_ingest', 'Reading database.json file...');
      
      // Enhanced JSON file reading with retry mechanism and better error handling
      let dbData;
      const maxRetries = 3;
      let lastError;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          this.emitProgress('vectordb_ingest', `Reading database.json file (attempt ${attempt}/${maxRetries})...`);
          
          // Wait a bit between retries to handle potential race conditions
          if (attempt > 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
          
          const fileContent = fs.readFileSync('./database.json', 'utf8');
          console.log(`Database file size: ${fileContent.length} characters`);
          
          // Check for common JSON file issues
          if (fileContent.trim().length === 0) {
            throw new Error('Database file is empty');
          }
          
          const trimmedContent = fileContent.trim();
          if (!trimmedContent.startsWith('{') && !trimmedContent.startsWith('[')) {
            throw new Error('Database file does not appear to contain valid JSON (does not start with { or [)');
          }
          
          // Validate JSON structure by attempting to parse
          dbData = JSON.parse(trimmedContent);
          
          // Additional validation - ensure we have expected structure
          if (typeof dbData !== 'object' || dbData === null) {
            throw new Error('Database file does not contain a valid JSON object');
          }
          
          console.log('Successfully parsed database.json');
          break; // Success, exit retry loop
          
        } catch (jsonError) {
          lastError = jsonError;
          console.error(`JSON parsing attempt ${attempt} failed:`, {
            message: jsonError.message,
            fileName: './database.json',
            fileExists: fs.existsSync('./database.json'),
            fileSize: fs.existsSync('./database.json') ? fs.statSync('./database.json').size : 0,
            attempt: attempt
          });
          
          // If this is the last attempt, handle the error
          if (attempt === maxRetries) {
            if (jsonError.message.includes('Unexpected non-whitespace character after JSON')) {
              console.error('This error typically indicates the JSON file contains multiple JSON objects, has trailing content, or is being accessed concurrently.');
              this.emitProgress('vectordb_error', `JSON parsing failed after ${maxRetries} attempts: The database.json file contains invalid JSON structure. ${jsonError.message}. This may be due to concurrent file access or corrupted JSON.`);
            } else {
              this.emitProgress('vectordb_error', `Failed to read or parse database.json after ${maxRetries} attempts: ${jsonError.message}`);
            }
            throw jsonError;
          }
          
          // Log retry attempt
          this.emitProgress('vectordb_warning', `JSON parsing attempt ${attempt} failed, retrying: ${jsonError.message}`);
        }
      }
      
      const records = [];
      let idCounter = 0;
      const entityTypes = Object.keys(dbData).filter(key => Array.isArray(dbData[key]));
      const totalEntities = entityTypes.reduce((sum, type) => sum + dbData[type].length, 0);
      let processedEntities = 0;

      this.emitProgress('vectordb_ingest', `Found ${totalEntities} entities across ${entityTypes.length} types`, {
        totalEntities,
        entityTypes: entityTypes.length
      });

      // Process each entity type
      for (const [entityType, entities] of Object.entries(dbData)) {
        if (Array.isArray(entities)) {
          this.emitProgress('vectordb_ingest', `Processing ${entities.length} ${entityType}...`, {
            entityType,
            count: entities.length,
            progress: Math.round((processedEntities / totalEntities) * 100)
          });
          console.log(`Processing ${entityType}...`);
          
          for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
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
              processedEntities++;
              
              // Emit progress every 5 entities
              if (processedEntities % 5 === 0 || i === entities.length - 1) {
                this.emitProgress('vectordb_ingest', `Processing ${entityType}: ${i + 1}/${entities.length}`, {
                  entityType,
                  entityProgress: i + 1,
                  entityTotal: entities.length,
                  overallProgress: Math.round((processedEntities / totalEntities) * 100),
                  processedEntities,
                  totalEntities
                });
              }
              
              // Small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
              console.error(`Failed to process ${entityType} entity:`, error.message);
              this.emitProgress('vectordb_warning', `Failed to process ${entityType} entity: ${error.message}`);
            }
          }
        }
      }

      this.emitProgress('vectordb_ingest', 'Creating LanceDB table with all records...', {
        totalRecords: records.length
      });

      // Handle table creation with better error handling for existing tables
      try {
        // Check if table already exists
        const tableNames = await this.db.tableNames();
        if (tableNames.includes(this.tableName)) {
          // Table exists, drop it first to ensure clean state
          console.log(`Table '${this.tableName}' already exists, dropping it for fresh data...`);
          this.emitProgress('vectordb_ingest', 'Dropping existing table for fresh data...');
          await this.db.dropTable(this.tableName);
        }
        
        // Create table with all records
        this.table = await this.db.createTable(this.tableName, records);
        
      } catch (tableError) {
        // If table creation fails due to existing table, try to handle it gracefully
        if (tableError.message && tableError.message.includes('already exists')) {
          console.log(`Table creation failed due to existing table, attempting to drop and recreate...`);
          this.emitProgress('vectordb_warning', 'Table already exists, attempting to drop and recreate...');
          
          try {
            await this.db.dropTable(this.tableName);
            this.table = await this.db.createTable(this.tableName, records);
          } catch (secondAttemptError) {
            throw new Error(`Failed to create table after handling existing table: ${secondAttemptError.message}`);
          }
        } else {
          // Re-throw if it's not a "table exists" error
          throw tableError;
        }
      }

      const successMsg = `Successfully ingested ${records.length} documents into vector database`;
      this.emitProgress('vectordb_complete', successMsg, {
        totalRecords: records.length
      });
      console.log(successMsg);
      return true;
    } catch (error) {
      const errorMsg = 'Failed to ingest data: ' + error.message;
      this.emitProgress('vectordb_error', errorMsg);
      console.error(errorMsg);
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
      
      // For attribute-based queries (like "red eyes", "blue hair"), use a higher limit
      // and combine with keyword search for better recall
      const isAttributeQuery = this.isAttributeBasedQuery(query);
      const searchLimit = isAttributeQuery ? Math.max(limit * 3, 15) : limit;
      
      // Search for similar documents using vector similarity
      const vectorResults = await this.table
        .vectorSearch(queryEmbedding)
        .limit(searchLimit)
        .toArray();
      
      let results = vectorResults;
      
      // For attribute queries, also perform keyword search and merge results
      if (isAttributeQuery) {
        const keywordResults = await this.performKeywordSearch(query, searchLimit);
        results = this.mergeAndRankResults(vectorResults, keywordResults, query);
      }
      
      // Limit final results
      results = results.slice(0, limit);
      
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

  isAttributeBasedQuery(query) {
    // Common attribute patterns
    const attributePatterns = [
      /\b(red|blue|green|yellow|brown|black|white|orange|purple|pink)\s+(eyes?|hair|skin)\b/i,
      /\beyes?\s+(are|is)?\s*(red|blue|green|yellow|brown|black|white|orange|purple|pink)\b/i,
      /\bhair\s+(is|are)?\s*(red|blue|green|yellow|brown|black|white|orange|purple|pink|blond|blonde)\b/i,
      /\bskin\s+(is|are|color)?\s*(red|blue|green|yellow|brown|black|white|orange|purple|pink|fair|dark|light)\b/i,
      /\b(tall|short|height|mass|weight)\b/i,
      /\b(male|female|gender)\b/i,
      /\bspecies\b/i,
      /\bhomeworld\b/i
    ];
    
    return attributePatterns.some(pattern => pattern.test(query));
  }

  async performKeywordSearch(query, limit) {
    try {
      // Extract key terms from the query
      const keyTerms = this.extractKeyTerms(query);
      
      // For LanceDB, we need to do a vector search but we'll use the original query vector
      // and then filter the results manually
      const queryVector = await this.generateEmbedding(query);
      const allResults = await this.table
        .vectorSearch(queryVector)
        .limit(1000) // Get a larger set to filter from
        .toArray();
      
      // Filter by exact keyword matches (more strict than vector similarity)
      const keywordMatches = allResults.filter(result => {
        const text = result.text.toLowerCase();
        // For red eyes query, we specifically look for exact eye color matches
        if (query.toLowerCase().includes('red') && (query.toLowerCase().includes('eye') || query.toLowerCase().includes('eyes'))) {
          return text.includes('eye color: red') || text.includes('eye_color: red');
        }
        // For other attribute queries, match any of the key terms
        return keyTerms.some(term => text.includes(term.toLowerCase()));
      });
      
      // Sort by relevance (exact matches first, then by number of matching keywords)
      keywordMatches.sort((a, b) => {
        const aText = a.text.toLowerCase();
        const bText = b.text.toLowerCase();
        
        // Prioritize exact attribute matches
        const aExactMatch = (query.toLowerCase().includes('red eyes') && aText.includes('eye color: red')) ? 1 : 0;
        const bExactMatch = (query.toLowerCase().includes('red eyes') && bText.includes('eye color: red')) ? 1 : 0;
        
        if (aExactMatch !== bExactMatch) {
          return bExactMatch - aExactMatch;
        }
        
        // Then by number of keyword matches
        const aMatches = keyTerms.reduce((count, term) => {
          return count + (aText.includes(term.toLowerCase()) ? 1 : 0);
        }, 0);
        const bMatches = keyTerms.reduce((count, term) => {
          return count + (bText.includes(term.toLowerCase()) ? 1 : 0);
        }, 0);
        return bMatches - aMatches;
      });
      
      return keywordMatches.slice(0, limit);
    } catch (error) {
      console.error('Keyword search failed:', error.message);
      return [];
    }
  }

  extractKeyTerms(query) {
    // Extract color terms and other important keywords
    const colorTerms = ['red', 'blue', 'green', 'yellow', 'brown', 'black', 'white', 'orange', 'purple', 'pink', 'blond', 'blonde', 'fair', 'dark', 'light'];
    const attributeTerms = ['eyes', 'eye', 'hair', 'skin', 'height', 'mass', 'weight', 'male', 'female', 'species', 'homeworld'];
    
    const words = query.toLowerCase().split(/\s+/);
    const keyTerms = [];
    
    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (colorTerms.includes(cleanWord) || attributeTerms.includes(cleanWord)) {
        keyTerms.push(cleanWord);
      }
    }
    
    // For "red eyes" query, make sure we capture the combination
    if (query.toLowerCase().includes('red') && (query.toLowerCase().includes('eye') || query.toLowerCase().includes('eyes'))) {
      keyTerms.push('eye color: red');
    }
    
    return keyTerms.length > 0 ? keyTerms : [query];
  }

  mergeAndRankResults(vectorResults, keywordResults, query) {
    // Create a map to avoid duplicates
    const resultMap = new Map();
    
    // Add vector results with their scores
    vectorResults.forEach((result, index) => {
      resultMap.set(result.id, {
        ...result,
        vectorRank: index,
        vectorScore: 1 - (result._distance || 0),
        keywordRank: -1,
        keywordScore: 0
      });
    });
    
    // Add keyword results and update scores
    keywordResults.forEach((result, index) => {
      if (resultMap.has(result.id)) {
        // Update existing result
        const existing = resultMap.get(result.id);
        existing.keywordRank = index;
        existing.keywordScore = 1 - (index / keywordResults.length);
      } else {
        // Add new result
        resultMap.set(result.id, {
          ...result,
          vectorRank: -1,
          vectorScore: 0,
          keywordRank: index,
          keywordScore: 1 - (index / keywordResults.length)
        });
      }
    });
    
    // Convert back to array and sort by combined score
    const mergedResults = Array.from(resultMap.values());
    
    // Calculate combined score (prioritize keyword matches for attribute queries)
    mergedResults.forEach(result => {
      const keywordWeight = 0.7; // Higher weight for keyword matches in attribute queries
      const vectorWeight = 0.3;
      
      result.combinedScore = (result.keywordScore * keywordWeight) + (result.vectorScore * vectorWeight);
      
      // Boost results that appear in both searches
      if (result.keywordRank >= 0 && result.vectorRank >= 0) {
        result.combinedScore += 0.2; // Boost for appearing in both
      }
    });
    
    // Sort by combined score
    mergedResults.sort((a, b) => b.combinedScore - a.combinedScore);
    
    return mergedResults;
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