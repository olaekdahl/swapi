FROM mongo:5.0
ENV DATABASE_URI mongodb://localhost:27017/swapi
ENV USERNAME root
ENV PASSWORD example

RUN mkdir /swapi-data/

COPY films.json /swapi-data/films.json
COPY people.json /swapi-data/people.json
COPY planets.json /swapi-data/planets.json
COPY species.json /swapi-data/species.json
COPY starships.json /swapi-data/starships.json
COPY transport.json /swapi-data/transport.json
COPY vehicles.json /swapi-data/vehicles.json

RUN mongod --fork --logpath=/tmp/mongodb.log && sleep 20 && \
    mongoimport --uri ${DATABASE_URI} --collection films --drop --file /swapi-data/films.json --jsonArray && \
    mongoimport --uri ${DATABASE_URI} --collection people --drop --file /swapi-data/people.json --jsonArray && \
    mongoimport --uri ${DATABASE_URI} --collection planets --drop --file /swapi-data/planets.json --jsonArray && \
    mongoimport --uri ${DATABASE_URI} --collection species --drop --file /swapi-data/species.json --jsonArray && \
    mongoimport --uri ${DATABASE_URI} --collection starships --drop --file /swapi-data/starships.json --jsonArray && \
    mongoimport --uri ${DATABASE_URI} --collection transport --drop --file /swapi-data/transport.json --jsonArray && \
    mongoimport --uri ${DATABASE_URI} --collection vehicles --drop --file /swapi-data/vehicles.json --jsonArray

RUN rm /tmp/mongodb-27017.sock
