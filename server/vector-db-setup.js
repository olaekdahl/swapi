import { ChromaClient } from 'chromadb';
import fs from 'fs';
import OpenAI from 'openai';

class VectorDBSetup {
  constructor() {
    this.client = new ChromaClient();
    this.collectionName = 'swapi_data';
  }

  async initialize(openaiApiKey) {
    try {
      // Initialize OpenAI client
      this.openai = new OpenAI({ apiKey: openaiApiKey });
      
      // Create or get collection
      try {
        await this.client.deleteCollection({ name: this.collectionName });
      } catch (error) {
        // Collection might not exist, which is fine
      }
      
      this.collection = await this.client.createCollection({
        name: this.collectionName,
        metadata: { 'hnsw:space': 'cosine' },
        embeddingFunction: null // Disable default embedding function since we provide custom embeddings
      });
      
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
      
      const documents = [];
      const embeddings = [];
      const metadatas = [];
      const ids = [];

      let idCounter = 0;

      // Process each entity type
      for (const [entityType, entities] of Object.entries(dbData)) {
        console.log(`Processing ${entityType}...`);
        
        if (Array.isArray(entities)) {
          for (const entity of entities) {
            try {
              // Create a comprehensive text representation of the entity
              const textContent = this.createTextContent(entityType, entity);
              
              // Generate embedding
              const embedding = await this.generateEmbedding(textContent);
              
              documents.push(textContent);
              embeddings.push(embedding);
              metadatas.push({
                entity_type: entityType,
                entity_id: entity.id,
                ...this.extractMetadata(entity)
              });
              ids.push(`${entityType}_${entity.id || idCounter++}`);
              
              // Small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
              console.error(`Failed to process ${entityType} entity:`, error.message);
            }
          }
        }
      }

      // Add all documents to the collection
      await this.collection.add({
        documents,
        embeddings,
        metadatas,
        ids
      });

      console.log(`Successfully ingested ${documents.length} documents into vector database`);
      return true;
    } catch (error) {
      console.error('Failed to ingest data:', error.message);
      return false;
    }
  }

  createTextContent(entityType, entity) {
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
    
    return content.join('. ');
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
      
      // Search for similar documents
      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: limit,
        include: ['documents', 'metadatas', 'distances']
      });
      
      return results;
    } catch (error) {
      console.error('Failed to search similar documents:', error.message);
      throw error;
    }
  }

  async getCollection() {
    try {
      return await this.client.getCollection({ name: this.collectionName });
    } catch (error) {
      return null;
    }
  }
}

export default VectorDBSetup;