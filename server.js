const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const bodyParser = require('body-parser');
const axios = require('axios');

// Define el esquema GraphQL
const schema = buildSchema(`
  type Coordinates {
    latitude: Float!
    longitude: Float!
  }

  type Query {
    getCoordinates(city: String!): Coordinates
  }
`);

const root = {
  getCoordinates: async ({ city }) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${city}&format=json`;
      const response = await axios.get(url);
      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  },
};

const app = express();

app.use('/graphql', bodyParser.json(), (req, res, next) => {
  if (req.method === 'POST') {
    next();
  } else {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).send('Method Not Allowed');
  }
});

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true,
}));
app.use(express.static('public'));

app.listen(5500, () => {
  console.log('Servidor GraphQL en ejecución en el puerto 5500');
});
