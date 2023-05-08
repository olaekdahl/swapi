import express from 'express';
import jsonServer from 'json-server';

// Create an express web server
const app = express();
// Set the port
const port = process.env.PORT || 3000;

// GET route for /api/films/:id/characters
app.get('/api/films/:id/characters', (req, res) => {
  const { id } = req.params;
  const junction_data = router.db.get('films_characters').filter({ film_id: +id }).value();
  const characters_ids = junction_data.map(item => item.character_id);
  const characters = router.db.get('characters').value().filter(character => characters_ids.includes(character.id)).map(character => ({ "id": character.id, "name": character.name }));
  res.json(characters);
});

// GET route for /api/films/:id/planets
app.get('/api/films/:id/planets', (req, res) => {
  const { id } = req.params;
  const junction_data = router.db.get('films_planets').filter({ film_id: +id }).value();
  const planet_ids = junction_data.map(item => item.planet_id);
  const planets = router.db.get('planets').value().filter(planet => planet_ids.includes(planet.id)).map(planet => ({ "id": planet.id, "name": planet.name }));
  res.json(planets);
});

// GET route for /api/films/:id/species
app.get('/api/films/:id/species', (req, res) => {
  const { id } = req.params;
  const junction_data = router.db.get('films_species').filter({ film_id: +id }).value();
  const species_ids = junction_data.map(item => item.species_id);
  const species = router.db.get('species').value().filter(specie => species_ids.includes(specie.id)).map(specie => ({ "id": specie.id, "name": specie.name }));
  res.json(species);
});

// GET route for /api/films/:id/starships
app.get('/api/films/:id/starships', (req, res) => {
  const { id } = req.params;
  const junction_data = router.db.get('films_starships').filter({ film_id: +id }).value();
  const starships_ids = junction_data.map(item => item.starship_id);
  const starships = router.db.get('starships').value().filter(ship => starships_ids.includes(ship.id)).map(ship => ({ "id": ship.id, "name": ship.starship_class }));
  res.json(starships);
});

// GET route for /api/films/:id/vehicles
app.get('/api/films/:id/vehicles', (req, res) => {
  const { id } = req.params;
  const junction_data = router.db.get('films_vehicles').filter({ film_id: +id }).value();
  const vehicles_ids = junction_data.map(item => item.vehicle_id);
  const vehicles = router.db.get('vehicles').value().filter(vehicle => vehicles_ids.includes(vehicle.id)).map(vehicle => ({ "id": vehicle.id, "name": vehicle.vehicle_class }));
  res.json(vehicles);
});

// GET route for /api/species/:id/people
app.get('/api/species/:id/people', (req, res) => {
  const { id } = req.params;
  const junction_data = router.db.get('species_people').filter({ species_id: +id }).value();
  const people_ids = junction_data.map(item => item.people_id);
  const people = router.db.get('people').value().filter(person => people_ids.includes(person.id)).map(person => ({ "id": person.id, "name": person.name }));
  res.json(people);
});

// GET route for /api/starships/:id/characters
app.get('/api/starships/:id/characters', (req, res) => {
  const { id } = req.params;
  const junction_data = router.db.get('starships_characters').filter({ starship_id: +id }).value();
  const character_ids = junction_data.map(item => item.character_id);
  const characters = router.db.get('characters').value().filter(person => character_ids.includes(person.id)).map(person => ({ "id": person.id, "name": person.name }));
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
