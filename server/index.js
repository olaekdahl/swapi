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
const vectorDB = new VectorDBSetup();

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
    const { apiKey, model, query } = req.body;
    
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

    // Check if vector database is initialized, if not, initialize it
    let collection;
    try {
      collection = await vectorDB.getCollection();
    } catch (error) {
      // Check if this is a ChromaDB server connection issue
      if (error.message.includes('connect') || error.message.includes('server')) {
        return res.status(503).json({ 
          error: 'ChromaDB server is not running',
          suggestion: 'Start ChromaDB server with: pip install chromadb && chroma run --host 0.0.0.0 --port 8000',
          details: error.message
        });
      }
      throw error;
    }
    
    if (!collection) {
      console.log('Initializing vector database...');
      const initialized = await vectorDB.initialize(apiKey.trim());
      if (!initialized) {
        return res.status(500).json({ 
          error: 'Failed to initialize vector database',
          suggestion: 'Make sure ChromaDB server is running on port 8000'
        });
      }
      
      console.log('Ingesting data into vector database...');
      const ingested = await vectorDB.ingestData();
      if (!ingested) {
        return res.status(500).json({ error: 'Failed to ingest data into vector database' });
      }
      console.log('Vector database setup complete');
    }

    // Search for similar content (use higher limit for attribute queries)
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

    // Prepare context for OpenAI
    const contextText = context
      .map(item => `${item.content} (Relevance: ${item.relevance.toFixed(2)})`)
      .join('\n\n');

    // Generate response using OpenAI
    const openai = new OpenAI({ apiKey: apiKey.trim() });
    const completion = await openai.chat.completions.create({
      model: model.trim(),
      messages: [
        {
          role: 'system',
          content: `You are an expert on Star Wars data. Use the following context to answer the user's question. If the context doesn't contain enough information to answer the question fully, say so. Always cite the relevant information from the context.

Context:
${contextText}`
        },
        {
          role: 'user',
          content: query.trim()
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const response = {
      query: query.trim(),
      answer: completion.choices[0].message.content,
      context: context,
      model: model.trim(),
      timestamp: new Date().toISOString()
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
