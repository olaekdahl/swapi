import express from 'express';
import cors from 'cors';
import jsonServer from 'json-server';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import OpenAI from 'openai';
import VectorDBSetup from './vector-db-setup.js';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { swapiTools, extractEntityIds } from './langchain-tools.js';

// Create an express web server
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'swapi-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Simple user store (in production, use a proper database)
const users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { id: 2, username: 'user', password: 'user123', role: 'user' }
];

// Passport local strategy
passport.use(new LocalStrategy((username, password, done) => {
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    return done(null, user);
  }
  return done(null, false, { message: 'Invalid credentials' });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

// Authentication middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Add Swagger support
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/swagger.json', (_, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
// Set the port
const port = process.env.PORT || 3000;

// Authentication routes
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>SWAPI Login</title>
      <link rel="stylesheet" href="/site.css" />
    </head>
    <body>
      <header></header>
      <main>
        <h1>SWAPI Login</h1>
        <form action="/login" method="post">
          <div>
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required>
          </div>
          <div>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
          </div>
          <button type="submit">Login</button>
        </form>
        <p><a href="/">Back to Home</a></p>
        <p><em>Demo credentials: admin/admin123 or user/user123</em></p>
      </main>
    </body>
    </html>
  `);
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/admin',
  failureRedirect: '/login'
}));

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

app.get('/admin', ensureAuthenticated, (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>SWAPI Admin</title>
      <link rel="stylesheet" href="/site.css" />
    </head>
    <body>
      <header></header>
      <main>
        <h1>SWAPI Admin Dashboard</h1>
        <p>Welcome, ${req.user.username}! Role: ${req.user.role}</p>
        <h2>Admin Functions</h2>
        <ul>
          <li><a href="/api">Browse API Data</a></li>
          <li><a href="/api-docs">API Documentation</a></li>
        </ul>
        <p><a href="/logout">Logout</a> | <a href="/">Home</a></p>
      </main>
    </body>
    </html>
  `);
});

// Initialize json-server router (needed for custom API routes)
const router = jsonServer.router('database.json');

// GET route for /api/films/:id/characters
/**
 * @swagger
 * /api/films/{id}/characters:
 *   get:
 *     summary: Get a list of characters for a specfic film id.
 *     description: Returns a list of characters
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The ID of the film to retrieve
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/api/films/:id/characters', (req, res) => {
  const { id } = req.params;
  const junction_data = router.db.get('films_characters').filter({ film_id: +id }).value();
  const characters_ids = junction_data.map(item => item.character_id);
  const characters = router.db.get('characters').value().filter(character => characters_ids.includes(character.id)).map(character => ({ "id": character.id, "name": character.name }));
  res.json(characters);
});

// GET route for /api/characters/:id/films
/**
 * @swagger
 * /api/characters/{id}/films:
 *   get:
 *     summary: Get a list of films for a specfic characters id.
 *     description: Returns a list of films
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The ID of the character to retrieve
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/api/characters/:id/films', (req, res) => {
  const { id } = req.params;
  const junction_data = router.db.get('films_characters').filter({ character_id: +id }).value();
  const films_ids = junction_data.map(item => item.film_id);
  const films = router.db.get('films').value().filter(film => films_ids.includes(film.id)).map(film => ({ "id": film.id, "title": film.title }));
  res.json(films);
});

// GET route for /api/films/:id/planets
/**
 * @swagger
 * /api/films/{id}/planets:
 *   get:
 *     summary: Get a list of planets for a specfic film id.
 *     description: Returns a list of planets
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The ID of the film to retrieve
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/api/films/:id/planets', (req, res) => {
  const { id } = req.params;
  const junction_data = router.db.get('films_planets').filter({ film_id: +id }).value();
  const planet_ids = junction_data.map(item => item.planet_id);
  const planets = router.db.get('planets').value().filter(planet => planet_ids.includes(planet.id)).map(planet => ({ "id": planet.id, "name": planet.name }));
  res.json(planets);
});

// GET route for /api/planets/:id/films
/**
 * @swagger
 * /api/planets/{id}/films:
 *   get:
 *     summary: Get a list of films for a specfic planet id.
 *     description: Returns a list of films
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The ID of the planet to retrieve
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/api/planets/:id/films', (req, res) => {
  const { id } = req.params;
  const junction_data = router.db.get('films_planets').filter({ planet_id: +id }).value();
  const films_ids = junction_data.map(item => item.film_id);
  const films = router.db.get('films').value().filter(film => films_ids.includes(film.id)).map(film => ({ "id": film.id, "title": film.title }));
  res.json(films);
});

// GET route for /api/films/:id/species
/**
 * @swagger
 * /api/films/{id}/species:
 *   get:
 *     summary: Get a list of species for a specfic film id.
 *     description: Returns a list of species
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The ID of the film to retrieve
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/api/films/:id/species', (req, res) => {
  const { id } = req.params;
  const junction_data = router.db.get('films_species').filter({ film_id: +id }).value();
  const species_ids = junction_data.map(item => item.species_id);
  const species = router.db.get('species').value().filter(specie => species_ids.includes(specie.id)).map(specie => ({ "id": specie.id, "name": specie.name }));
  res.json(species);
});

// GET route for /api/films/:id/starships
/**
 * @swagger
 * /api/films/{id}/starships:
 *   get:
 *     summary: Get a list of starships for a specfic film id.
 *     description: Returns a list of starships
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The ID of the film to retrieve
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/api/films/:id/starships', (req, res) => {
  const { id } = req.params;
  const junction_data = router.db.get('films_starships').filter({ film_id: +id }).value();
  const starships_ids = junction_data.map(item => item.starship_id);
  const starships = router.db.get('starships').value().filter(ship => starships_ids.includes(ship.id)).map(ship => ({ "id": ship.id, "name": ship.starship_class }));
  res.json(starships);
});

// GET route for /api/films/:id/vehicles
/**
 * @swagger
 * /api/films/{id}/vehicles:
 *   get:
 *     summary: Get a list of vehicles for a specfic film id.
 *     description: Returns a list of vehicles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The ID of the film to retrieve
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/api/films/:id/vehicles', (req, res) => {
  const { id } = req.params;
  const junction_data = router.db.get('films_vehicles').filter({ film_id: +id }).value();
  const vehicles_ids = junction_data.map(item => item.vehicle_id);
  const vehicles = router.db.get('vehicles').value().filter(vehicle => vehicles_ids.includes(vehicle.id)).map(vehicle => ({ "id": vehicle.id, "name": vehicle.vehicle_class }));
  res.json(vehicles);
});

// GET route for /api/species/:id/characters
/**
 * @swagger
 * /api/species/{id}/characters:
 *   get:
 *     summary: Get a list of characters for a specfic species id.
 *     description: Returns a list of characters
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The ID of the species to retrieve
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/api/species/:id/characters', (req, res) => {
  const { id } = req.params;
  const characters = router.db.get('characters').filter(c => c.species_id === +id)
  res.json(characters);
});

// GET route for /api/starships/:id/characters
/**
 * @swagger
 * /api/starships/{id}/characters:
 *   get:
 *     summary: Get a list of characters for a specfic starship id.
 *     description: Returns a list of characters
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The ID of the starship to retrieve
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/api/starships/:id/characters', (req, res) => {
  const { id } = req.params;
  const junction_data = router.db.get('starships_characters').filter({ starship_id: +id }).value();
  const character_ids = junction_data.map(item => item.character_id);
  const characters = router.db.get('characters').value().filter(character => character_ids.includes(character.id)).map(character => ({ "id": character.id, "name": character.name }));
  res.json(characters);
});

// GET route for /api/planets/:id/characters
/**
 * @swagger
 * /api/planets/{id}/characters:
 *   get:
 *     summary: Get a list of characters for a specfic planet id.
 *     description: Returns a list of characters
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The ID of the planet to retrieve
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/api/planets/:id/characters', (req, res) => {
  const { id } = req.params;
  const rawCharacters = router.db.get(`characters`).value()
  //console.log({ id, rawCharacters })
  const characters = rawCharacters?.filter(character => character.homeworld === +id).map(character => ({ "id": character.id, "name": character.name }));
  res.json(characters);
});

// Initialize vector database instance
const vectorDB = new VectorDBSetup((type, message, data) => {
  // Broadcast progress to all connected SSE clients
  for (const [sessionId, connection] of sseConnections) {
    try {
      const payload = {
        type,
        message,
        timestamp: new Date().toISOString(),
        ...data
      };
      connection.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (error) {
      // Connection might be closed, remove it
      sseConnections.delete(sessionId);
    }
  }
});

// Store for SSE connections
const sseConnections = new Map();

// SSE endpoint for real-time progress updates
app.get('/api/progress/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  
  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Store connection
  sseConnections.set(sessionId, res);

  // Send initial connection confirmation
  res.write(`data: ${JSON.stringify({ type: 'connected', sessionId, timestamp: new Date().toISOString() })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    sseConnections.delete(sessionId);
  });
});

// Helper function to send progress updates
function sendProgress(sessionId, type, message, data = {}) {
  const connection = sseConnections.get(sessionId);
  if (connection) {
    const payload = {
      type,
      message,
      timestamp: new Date().toISOString(),
      ...data
    };
    connection.write(`data: ${JSON.stringify(payload)}\n\n`);
  }
}

// API endpoint to check system status
/**
 * @swagger
 * /api/status:
 *   get:
 *     summary: Get system status
 *     description: Returns the status of the vector database and API
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/api/status', async (req, res) => {
  try {
    // Test LanceDB status
    let dbStatus = 'unknown';
    let dbError = null;
    
    try {
      dbStatus = await vectorDB.getStatus();
    } catch (error) {
      dbStatus = 'error';
      dbError = error.message;
    }
    
    const response = {
      api: 'running',
      vectorDatabase: dbStatus,
      timestamp: new Date().toISOString()
    };
    
    if (dbError) {
      response.error = dbError;
    }
    
    res.json(response);
  } catch (error) {
    res.json({
      api: 'running',
      vectorDatabase: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API endpoint to get available OpenAI models
/**
 * @swagger
 * /api/models:
 *   post:
 *     summary: Get available OpenAI models
 *     description: Returns a list of available OpenAI models for the provided API key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apiKey:
 *                 type: string
 *                 description: OpenAI API key
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 */
app.post('/api/models', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return res.status(400).json({ error: 'Valid API key is required' });
    }

    // Basic API key format validation (should start with sk-)
    if (!apiKey.startsWith('sk-')) {
      return res.status(400).json({ error: 'Invalid API key format' });
    }

    const openai = new OpenAI({ apiKey: apiKey.trim() });
    const models = await openai.models.list();
    
    // Filter for models that support chat completions
    const chatModels = models.data
      .filter(model => model.id.includes('gpt'))
      .map(model => ({
        id: model.id,
        name: model.id,
        created: model.created
      }))
      .sort((a, b) => b.created - a.created);

    res.json({ models: chatModels });
  } catch (error) {
    console.error('Error fetching models:', error.message);
    if (error.status === 401 || error.code === 'invalid_api_key') {
      res.status(401).json({ error: 'Invalid API key' });
    } else if (error.status === 429) {
      res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    } else {
      res.status(500).json({ error: 'Failed to fetch models' });
    }
  }
});

// API endpoint for natural language query
/**
 * @swagger
 * /api/query:
 *   post:
 *     summary: Process natural language query using RAG
 *     description: Uses vector search and OpenAI to answer queries about Star Wars data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apiKey:
 *                 type: string
 *                 description: OpenAI API key
 *               model:
 *                 type: string
 *                 description: OpenAI model to use
 *               query:
 *                 type: string
 *                 description: Natural language query
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
app.post('/api/query', async (req, res) => {
  try {
    const { apiKey, model, query, sessionId } = req.body;
    
    // Validate inputs
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return res.status(400).json({ error: 'Valid API key is required' });
    }
    
    if (!model || typeof model !== 'string' || model.trim().length === 0) {
      return res.status(400).json({ error: 'Valid model is required' });
    }
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'Valid query is required' });
    }

    // Basic API key format validation
    if (!apiKey.startsWith('sk-')) {
      return res.status(400).json({ error: 'Invalid API key format' });
    }

    // Query length validation
    if (query.length > 1000) {
      return res.status(400).json({ error: 'Query too long. Maximum 1000 characters allowed.' });
    }

    // Send initial progress
    if (sessionId) {
      sendProgress(sessionId, 'query_start', 'Starting query processing...', { query });
    }

    // Check if vector database is initialized, if not, initialize it
    let collection;
    try {
      if (sessionId) {
        sendProgress(sessionId, 'query_step', 'Checking vector database status...');
      }
      collection = await vectorDB.getCollection();
    } catch (error) {
      // Check if this is a LanceDB connection issue
      if (error.message.includes('connect') || error.message.includes('server')) {
        return res.status(503).json({ 
          error: 'Vector database connection failed',
          suggestion: 'Make sure the vector database is properly initialized',
          details: error.message
        });
      }
      throw error;
    }
    
    if (!collection) {
      if (sessionId) {
        sendProgress(sessionId, 'query_step', 'Vector database not initialized. Initializing now...');
      }
      console.log('Initializing vector database...');
      const initialized = await vectorDB.initialize(apiKey.trim());
      if (!initialized) {
        return res.status(500).json({ 
          error: 'Failed to initialize vector database',
          suggestion: 'Check OpenAI API key and network connectivity'
        });
      }
      
      // Check if database is already populated (from pre-built database)
      const isPopulated = await vectorDB.isDatabasePopulated();
      if (!isPopulated) {
        if (sessionId) {
          sendProgress(sessionId, 'query_step', 'Pre-built database not found. Ingesting data into vector database...');
        }
        console.log('Pre-built database not found. Ingesting data into vector database...');
        const ingested = await vectorDB.ingestData();
        if (!ingested) {
          return res.status(500).json({ error: 'Failed to ingest data into vector database' });
        }
        console.log('Vector database setup complete');
      } else {
        if (sessionId) {
          sendProgress(sessionId, 'query_step', 'Using pre-built vector database');
        }
        console.log('Using pre-built vector database');
      }
    } else {
      if (sessionId) {
        sendProgress(sessionId, 'query_step', `Using existing vector database with ${collection.count || 'unknown'} records`);
      }
      console.log(`Using existing vector database with ${collection.count || 'unknown'} records`);
    }

    // Vector search phase
    if (sessionId) {
      sendProgress(sessionId, 'query_step', 'Performing vector similarity search...', { query });
    }

    // First, get initial context from vector search
    const isAttributeQuery = /\b(red|blue|green|yellow|brown|black|white|orange|purple|pink)\s+(eyes?|hair|skin)\b/i.test(query.trim()) ||
                            /\beyes?\s+(are|is)?\s*(red|blue|green|yellow|brown|black|white|orange|purple|pink)\b/i.test(query.trim());
    const searchLimit = isAttributeQuery ? 10 : 5;
    const searchResults = await vectorDB.searchSimilar(query.trim(), apiKey.trim(), searchLimit);
    
    // Extract relevant context from search results
    const context = searchResults.documents[0].map((doc, index) => {
      const metadata = searchResults.metadatas[0][index];
      return {
        content: doc,
        metadata: metadata,
        relevance: 1 - searchResults.distances[0][index] // Convert distance to relevance
      };
    });

    if (sessionId) {
      sendProgress(sessionId, 'query_step', `Found ${context.length} relevant documents from vector search`, {
        contextCount: context.length,
        isAttributeQuery
      });
    }

    // Extract entity IDs from context for potential API calls
    const entityIds = extractEntityIds(context);
    
    if (sessionId) {
      sendProgress(sessionId, 'query_step', 'Initializing LangChain agent with API tools...');
    }

    // Initialize LangChain ChatOpenAI model
    const llm = new ChatOpenAI({
      apiKey: apiKey.trim(),
      model: model.trim(),
      temperature: 0.7,
    });

    // Create a prompt template for the agent
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `You are an expert on Star Wars data with access to detailed information through API tools. 

Initial Context from Vector Search:
{context}

You have access to tools that can get detailed information about characters, films, planets, starships, species, and vehicles. Use these tools when you need more specific details beyond what's provided in the initial context.

Guidelines:
1. Start by analyzing the initial context provided
2. If you need more details about specific entities (like character films, planet details, etc.), use the appropriate tools
3. For attribute-based queries (like "characters with red eyes"), use the search_characters tool
4. Always provide comprehensive answers citing both the initial context and any additional details from tool calls
5. Be specific about sources and include relevant details like character names, film titles, etc.

Available tools can help you get:
- Detailed character information and their films
- Film details and cast information  
- Planet information and inhabitants
- Starship and vehicle details
- Species information and characters
- Search functionality for attribute-based queries

Use the tools strategically to provide the most complete and accurate answer possible.`],
      ['human', '{input}'],
      ['placeholder', '{agent_scratchpad}']
    ]);

    // Create the agent with tools
    const agent = await createToolCallingAgent({
      llm,
      tools: swapiTools,
      prompt,
    });

    // Create agent executor
    const agentExecutor = new AgentExecutor({
      agent,
      tools: swapiTools,
      verbose: true,
      maxIterations: 10,
      returnIntermediateSteps: true, // This will capture tool calls
    });

    if (sessionId) {
      sendProgress(sessionId, 'query_step', 'Executing LangChain agent with context and tools...');
    }

    // Prepare context text for the agent
    const contextText = context
      .map(item => `${item.content} (Relevance: ${item.relevance.toFixed(2)})`)
      .join('\n\n');

    // Execute the agent with the query and context
    const result = await agentExecutor.invoke({
      input: query.trim(),
      context: contextText
    });

    if (sessionId) {
      sendProgress(sessionId, 'query_complete', 'Query processing completed successfully');
    }

    // Process intermediate steps to extract tool usage information
    const toolUsage = [];
    if (result.intermediateSteps && result.intermediateSteps.length > 0) {
      for (const step of result.intermediateSteps) {
        if (step.action && step.action.tool && step.observation) {
          toolUsage.push({
            toolName: step.action.tool,
            toolInput: step.action.toolInput,
            toolOutput: step.observation,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    const response = {
      query: query.trim(),
      answer: result.output,
      context: context,
      model: model.trim(),
      timestamp: new Date().toISOString(),
      enhanced: true, // Flag to indicate this used LangChain tools
      toolUsage: toolUsage, // New field with tool usage information
      processingSteps: [
        'Vector similarity search',
        'Context extraction',
        'LangChain agent execution',
        'API tool integration'
      ]
    };

    res.json(response);
  } catch (error) {
    console.error('Error processing query:', error.message);
    if (error.status === 401 || error.code === 'invalid_api_key') {
      res.status(401).json({ error: 'Invalid API key' });
    } else if (error.status === 429) {
      res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    } else if (error.status === 400 && error.message.includes('model')) {
      res.status(400).json({ error: 'Invalid model specified' });
    } else {
      res.status(500).json({ error: 'Failed to process query', details: error.message });
    }
  }
});

// API endpoint to demonstrate tool usage (for educational purposes)
/**
 * @swagger
 * /api/demo-tool-usage:
 *   get:
 *     summary: Demo tool usage response
 *     description: Returns a sample response showing how LangChain tools work (for educational purposes)
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/api/demo-tool-usage', (req, res) => {
  const demoResponse = {
    query: "Who is Luke Skywalker and what films is he in?",
    answer: "Luke Skywalker is a main protagonist in the Star Wars universe. He is a Jedi Knight, the son of Anakin Skywalker (Darth Vader) and Padmé Amidala. Luke appears in the original trilogy films: A New Hope (Episode IV), The Empire Strikes Back (Episode V), and Return of the Jedi (Episode VI).",
    context: [
      {
        content: "Luke Skywalker is a fictional character in the Star Wars franchise",
        relevance: 0.95
      }
    ],
    model: "gpt-4o-mini",
    timestamp: new Date().toISOString(),
    enhanced: true,
    toolUsage: [
      {
        toolName: "get_character",
        toolInput: { id: 1 },
        toolOutput: JSON.stringify({
          data: {
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
          apiCall: {
            method: "GET",
            url: "http://localhost:3000/api/characters/1",
            parameters: {},
            requestData: null,
            timestamp: new Date().toISOString(),
            responseStatus: 200,
            responseData: {
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
            error: null
          }
        }, null, 2),
        timestamp: new Date().toISOString()
      },
      {
        toolName: "get_character_films",
        toolInput: { id: 1 },
        toolOutput: JSON.stringify({
          data: [
            { id: 1, title: "A New Hope", episode_id: 4, release_date: "1977-05-25" },
            { id: 2, title: "The Empire Strikes Back", episode_id: 5, release_date: "1980-05-17" },
            { id: 3, title: "Return of the Jedi", episode_id: 6, release_date: "1983-05-25" }
          ],
          apiCall: {
            method: "GET",
            url: "http://localhost:3000/api/characters/1/films",
            parameters: {},
            requestData: null,
            timestamp: new Date().toISOString(),
            responseStatus: 200,
            responseData: [
              { id: 1, title: "A New Hope", episode_id: 4, release_date: "1977-05-25" },
              { id: 2, title: "The Empire Strikes Back", episode_id: 5, release_date: "1980-05-17" },
              { id: 3, title: "Return of the Jedi", episode_id: 6, release_date: "1983-05-25" }
            ],
            error: null
          }
        }, null, 2),
        timestamp: new Date().toISOString()
      }
    ],
    processingSteps: [
      "Vector similarity search",
      "Context extraction", 
      "LangChain agent execution",
      "API tool integration"
    ],
    isDemo: true  // Flag to identify this as demo data
  };
  
  res.json(demoResponse);
});

// API endpoint to get sample embeddings for educational purposes
/**
 * @swagger
 * /api/embeddings:
 *   get:
 *     summary: Get sample embeddings for educational purposes
 *     description: Returns sample embedding vectors from the vector database with educational explanations
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of sample embeddings to retrieve
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 embeddings:
 *                   type: array
 *                   items:
 *                     type: object
 *                 count:
 *                   type: integer
 *                 educational_info:
 *                   type: object
 *       500:
 *         description: Internal Server Error
 */
app.get('/api/embeddings', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50 for performance
    
    // Get sample embeddings (will use demo data if database not ready)
    const embeddings = await vectorDB.getSampleEmbeddings(limit);
    
    // Check if we're using demo data
    const isDemoData = embeddings.length > 0 && embeddings[0].metadata.demo;
    
    // Educational information about embeddings
    const educationalInfo = {
      explanation: "Embeddings are high-dimensional vector representations of text that capture semantic meaning. Similar concepts have similar vectors.",
      model: "text-embedding-3-small",
      dimensions: embeddings.length > 0 ? embeddings[0].embeddingDimensions : 1536,
      usage: "These embeddings enable semantic search - finding content by meaning rather than exact keyword matches",
      process: [
        "Text content is created for each Star Wars entity (characters, planets, films, etc.)",
        "OpenAI's embedding model converts this text into a numerical vector",
        "Vectors are stored in LanceDB vector database with metadata",
        "When you ask a question, your query is also converted to a vector",
        "The system finds the most similar vectors (closest in high-dimensional space)",
        "The corresponding text content is used as context for generating answers"
      ],
      visualization: "Only the first 10 dimensions are shown below for readability. The full vectors have " + 
                    (embeddings.length > 0 ? embeddings[0].embeddingDimensions : 1536) + " dimensions.",
      note: "Each number in the embedding vector represents a different semantic feature learned by the AI model",
      ...(isDemoData && {
        demo_notice: "⚠️ This is demo data for educational purposes. To see real embeddings, initialize the vector database by making a query with a valid OpenAI API key."
      })
    };

    res.json({
      embeddings,
      count: embeddings.length,
      educational_info: educationalInfo,
      is_demo_data: isDemoData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error retrieving embeddings:', error.message);
    res.status(500).json({ 
      error: 'Failed to retrieve embeddings', 
      details: error.message 
    });
  }
});

// Serve React app at /nlq route
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files for the React app at /nlq
app.use('/nlq', express.static(path.join(__dirname, 'nlq-build')));

// Serve the React app's index.html for any /nlq/* routes (SPA routing)
app.get('/nlq/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'nlq-build', 'index.html'));
});

// GET route for /api/people/?search={name} (SWAPI compatibility)
/**
 * @swagger
 * /api/people:
 *   get:
 *     summary: Search for characters by name
 *     description: Search for Star Wars characters by name using the search query parameter
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: The name or partial name to search for
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/api/people', (req, res) => {
  const { search } = req.query;
  let characters = router.db.get('characters').value();
  
  if (search) {
    // Filter characters by name (case-insensitive partial match)
    characters = characters.filter(character => 
      character.name && character.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json(characters);
});

// GET route for /api/characters/?search={name} (consistent with current naming)
/**
 * @swagger
 * /api/characters:
 *   get:
 *     summary: Search for characters by name
 *     description: Search for Star Wars characters by name using the search query parameter
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: The name or partial name to search for
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/api/characters', (req, res) => {
  const { search } = req.query;
  let characters = router.db.get('characters').value();
  
  if (search) {
    // Filter characters by name (case-insensitive partial match)
    characters = characters.filter(character => 
      character.name && character.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json(characters);
});

// Create middlewares and mount json-server API
const middlewares = jsonServer.defaults();
app.use(middlewares);
app.use('/api', router);

// Start the server
app.listen(port, () => {
  console.log(`
  API data server is listening on http://localhost:${port}/api
  Web server is listening on http://localhost:${port}
  `);
}
);
