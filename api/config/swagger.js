const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node.js API for Vercel',
      version: '1.0.0',
      description: 'A REST API built with Express and MongoDB to be deployed on Vercel',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://your-vercel-url.vercel.app'
          : `http://localhost:${process.env.PORT || 3000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
  },
  apis: ['./api/routes/*.js', './api/models/*.js'],
};

const specs = swaggerJsDoc(options);

module.exports = { swaggerUi, specs };