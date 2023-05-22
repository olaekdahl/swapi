FROM mongo:5.0

ENV DATABASE_URI mongodb://localhost:27017/swapi

RUN mkdir /swapi-data/

COPY films.json /swapi-data/films.json
COPY characters.json /swapi-data/characters.json
COPY planets.json /swapi-data/planets.json
COPY species.json /swapi-data/species.json
COPY starships.json /swapi-data/starships.json
COPY transports.json /swapi-data/transports.json
COPY vehicles.json /swapi-data/vehicles.json

COPY films_characters.json /swapi-data/films_characters.json
COPY films_planets.json /swapi-data/films_planets.json
COPY films_species.json /swapi-data/films_species.json
COPY films_starships.json /swapi-data/films_starships.json
COPY films_vehicles.json /swapi-data/films_vehicles.json
COPY species_characters.json /swapi-data/species_characters.json
COPY starships_characters.json /swapi-data/starships_characters.json
COPY vehicles_characters.json /swapi-data/vehicles_characters.json

COPY init-data.sh /docker-entrypoint-initdb.d
RUN chmod +x /docker-entrypoint-initdb.d/init-data.sh
