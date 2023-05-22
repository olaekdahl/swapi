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

RUN mongod --fork --logpath=/tmp/mongodb.log && sleep 20 && \
    mongoimport --uri ${DATABASE_URI} --collection films --drop --file /swapi-data/films.json --jsonArray && \
    mongoimport --uri ${DATABASE_URI} --collection characters --drop --file /swapi-data/characters.json --jsonArray && \
    mongoimport --uri ${DATABASE_URI} --collection planets --drop --file /swapi-data/planets.json --jsonArray && \
    mongoimport --uri ${DATABASE_URI} --collection species --drop --file /swapi-data/species.json --jsonArray && \
    mongoimport --uri ${DATABASE_URI} --collection starships --drop --file /swapi-data/starships.json --jsonArray && \
    mongoimport --uri ${DATABASE_URI} --collection transports --drop --file /swapi-data/transports.json --jsonArray && \
    mongoimport --uri ${DATABASE_URI} --collection vehicles --drop --file /swapi-data/vehicles.json --jsonArray && \
    mongoimport --uri ${DATABASE_URI} --collection films_characters --drop --file /swapi-data/films_characters.json --jsonArray && \
    mongoimport --uri ${DATABASE_URI} --collection films_planets --drop --file /swapi-data/films_planets.json --jsonArray && \
    mongoimport --uri ${DATABASE_URI} --collection films_species --drop --file /swapi-data/films_species.json --jsonArray && \
    mongoimport --uri ${DATABASE_URI} --collection films_starships --drop --file /swapi-data/films_starships.json --jsonArray && \
    mongoimport --uri ${DATABASE_URI} --collection films_vehicles --drop --file /swapi-data/films_vehicles.json --jsonArray && \
    mongoimport --uri ${DATABASE_URI} --collection species_characters --drop --file /swapi-data/species_characters.json --jsonArray && \
    mongoimport --uri ${DATABASE_URI} --collection starships_characters --drop --file /swapi-data/starships_characters.json --jsonArray && \
    mongoimport --uri ${DATABASE_URI} --collection vehicles_characters --drop --file /swapi-data/vehicles_characters.json --jsonArray

RUN rm /tmp/mongodb-27017.sock
