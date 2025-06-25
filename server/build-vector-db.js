#!/usr/bin/env node

/**
 * Standalone script to build the LanceDB vector database
 * Used during GitHub Actions workflow to pre-build the database
 */

import VectorDBSetup from './vector-db-setup.js';
import process from 'process';

async function buildVectorDatabase() {
  console.log('Starting vector database build process...');
  
  // Get OpenAI API key from environment
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    console.error('Error: OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }
  
  console.log('OpenAI API key found');
  
  // Create progress callback for logging
  const progressCallback = (type, message, data = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type}: ${message}`);
    if (Object.keys(data).length > 0) {
      console.log(`[${timestamp}] Data:`, JSON.stringify(data, null, 2));
    }
  };
  
  try {
    // Initialize vector database setup
    const vectorDB = new VectorDBSetup(progressCallback);
    
    console.log('Initializing vector database...');
    const initialized = await vectorDB.initialize(openaiApiKey);
    if (!initialized) {
      console.error('Failed to initialize vector database');
      process.exit(1);
    }
    
    console.log('Ingesting data into vector database...');
    const ingested = await vectorDB.ingestData();
    if (!ingested) {
      console.error('Failed to ingest data into vector database');
      process.exit(1);
    }
    
    console.log('Vector database build completed successfully!');
    console.log('Database location: lancedb/');
    
  } catch (error) {
    console.error('Error building vector database:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the build process
buildVectorDatabase();