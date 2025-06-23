import express from 'express';
import cors from 'cors';
import jsonServer from 'json-server';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';

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


// Create a router
const middlewares = jsonServer.defaults();
app.use(middlewares);
const router = jsonServer.router('database.json');
app.use('/api', router);

// Start the server
app.listen(port, () => {
  console.log(`
  API data server is listening on http://localhost:${port}/api
  Web server is listening on http://localhost:${port}
  `);
}
);
