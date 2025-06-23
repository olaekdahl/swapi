// This is the program originally used to create the database.json file and the
// json-data folder. It doesn't need to be run again.

// To make changes to the data, directly edit database.json and the individual
// files in json-data.

import fs from 'fs';

//const db = JSON.parse(fs.readFileSync('server/database_orig.json', 'utf8'));
const db = JSON.parse(fs.readFileSync('./database_orig.json', 'utf8'));

for (const key in db) {   // For each table
  for (const item of db[key]) { // For each item in the table
    item['id'] = +item['pk']; // Set the primary key to the id as a number
    for (const subfield in item.fields) { // For each property in 'fields'
      item[subfield] = item.fields[subfield];
    }
    delete item.fields;
    delete item.pk;
    delete item.model;
  }
}

// Rename certain tables
db.characters = db.people;
delete db.people;


// Create the junction tables
db.films_characters = [];
for (let film of db.films) {
  for (let characterId of film.characters) {
    db.films_characters.push({ film_id: film.id, character_id: characterId });
  }
  delete film.characters;
}

db.films_planets = [];
for (let film of db.films) {
  for (let planetId of film.planets) {
    db.films_planets.push({ film_id: film.id, planet_id: planetId });
  }
  delete film.planets;
}

db.films_species = [];
for (let film of db.films) {
  for (let speciesId of film.species) {
    db.films_species.push({ film_id: film.id, species_id: speciesId });
  }
  delete film.species;
}

db.films_starships = [];
for (let film of db.films) {
  for (let shipId of film.starships) {
    db.films_starships.push({ film_id: film.id, starship_id: shipId });
  }
  delete film.starships;
}

db.films_vehicles = [];
for (let film of db.films) {
  for (let vehicleId of film.vehicles) {
    db.films_vehicles.push({ film_id: film.id, vehicle_id: vehicleId });
  }
  delete film.vehicles;
}

db.starships_characters = [];
for (let ship of db.starships) {
  for (let pilotId of ship.pilots) {
    db.starships_characters.push({ starship_id: ship.id, character_id: pilotId });
  }
  delete ship.pilots;
}

db.vehicles_characters = [];
for (let vehicle of db.vehicles) {
  for (let pilotId of vehicle.pilots) {
    db.vehicles_characters.push({ vehicle_id: vehicle.id, character_id: pilotId });
  }
  delete vehicle.pilots;
}

// Remove created and edited fields. These are not needed in the database.
for (let bigKey in db) {
  for (let record of db[bigKey]) {
    for (let key in record) {
      if (key === 'created' || key === 'edited') {
        delete record[key];
      }
    }
  }
}

fs.writeFileSync('./database.json', JSON.stringify(db, null, 2));