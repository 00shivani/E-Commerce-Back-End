const express = require('express');
const routes = require('./routes');
const sequelize = require('./config/connection');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(routes);

// Database synchronization and server start
const startServer = async () => {
  try {
    await sequelize.sync({ force: false });
    app.listen(PORT, () => console.log('Server is now listening on port', PORT));
  } catch (error) {
    console.error('Error syncing sequelize models:', error);
  }
};

startServer();
