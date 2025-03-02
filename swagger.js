import swaggerAutogen from 'swagger-autogen'

const outputFile = './swagger_output.json'
const endpointsFiles = ["./src/index.js"]
const options = {
  info: {
    title: 'TAM Rest API',
    description: 'API for the TAM Montpellier public transport system'
  },
  host: 'tam.alexis-mateo.fr',
  "schemes": [
    "https"
  ],
  tags: [
    {
      name: 'Stop',
      description: 'Operations about stops'
    },
    {
      name: 'Line',
      description: 'Operations about lines'
    }
  ]
}
swaggerAutogen()(outputFile, endpointsFiles, options)