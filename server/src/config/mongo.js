const mongoose = require('mongoose');

let isConnected = false;

mongoose.set('strictQuery', true);

async function connectMongo() {
  if (isConnected) {
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fa9lh';
  const dbName = process.env.MONGO_DB_NAME || undefined;

  if (!uri) {
    throw new Error('MONGO_URI is required to connect to MongoDB');
  }

  await mongoose.connect(uri, {
    dbName,
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
  });

  isConnected = true;
  const { name } = mongoose.connection;
  console.log(`Connected to MongoDB database ${name}`);
  return mongoose.connection;
}

module.exports = {
  connectMongo,
  mongoose,
};
