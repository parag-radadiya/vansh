const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Determine the server URL based on environment
const getServerUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // Use VERCEL_URL environment variable in production if available
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    // Fallback to a configured URL
    return process.env.API_URL || 'https://vansh.vercel.app';
  }
  // Development URL
  return `http://localhost:${process.env.PORT || 3000}`;
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vansh API Documentation',
      version: '1.0.0',
      description: 'REST API built with Express and MongoDB deployed on Vercel',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
    },
    servers: [
      {
        url: getServerUrl(),
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ['./api/routes/*.js', './api/models/*.js'],
};

const specs = swaggerJsDoc(options);

module.exports = { swaggerUi, specs };