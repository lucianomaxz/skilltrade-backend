// src/swagger.js
import swaggerJSDoc from 'swagger-jsdoc'

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SkillTrade API',
    version: '1.0.0',
    description: 'API documentation for the SkillTrade backend project'
  },
  servers: [
    {
      url: 'http://localhost:5050',
      description: 'Local server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
}

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'] // ← Swagger leerá anotaciones desde los archivos de rutas
}

const swaggerSpec = swaggerJSDoc(options)

export default swaggerSpec
