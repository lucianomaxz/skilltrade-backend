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
      url: 'https://skilltrade-api.onrender.com',
      description: 'Render deployment'
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
  apis: ['./src/routes/*.js'] // Asegurate de tener todas las rutas documentadas con Swagger
}

const swaggerSpec = swaggerJSDoc(options)

export default swaggerSpec
