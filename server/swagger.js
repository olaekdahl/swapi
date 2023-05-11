//  wget https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.42/swagger-codegen-cli-3.0.42.jar
// java -jar ~/<path_to_jar_download>/swagger-codegen-cli-3.0.42.jar generate -i https://swapi2.azurewebsites.net/api/swagger.json -l javascript -o swapi-swagger-client

import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Star Wars API (SWAPI)',
    version: '1.0.0',
    description: 'API documentation for SWAPI',
  },
  basePath: '/api-docs'
};

const options = {
  swaggerDefinition,
  apis: ['index.js'],
  url: '/api-docs/swagger.json'
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;