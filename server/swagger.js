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