require('dotenv').config();

const app = require('./app');
const { connectMongo } = require('./config/mongo');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectMongo();
    app.listen(PORT, () => {
      console.log(`fa9lh API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start API server:', error.message);
    process.exit(1);
  }
}

start();
