const mongodb = require('mongodb');

class DBClient {
  constructor() {
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '27017';
    const database = process.env.DB_DATABASE || 'files_manager';
    this.connected = false;

    this.dbClient = new mongodb.MongoClient(`mongodb://${dbHost}:${dbPort}/${database}`, { useUnifiedTopology: true });
    this.dbClient.connect().then(() => {
      this.connected = true;
    }).catch((error) => console.log(error));
  }

  isAlive() {
    return this.connected;
  }

  async nbUsers() {
    await this.dbClient.connect();
    const db = this.dbClient.db();
    const userCollections = await db.collection('users').countDocuments();
    return userCollections;
  }

  async nbFiles() {
    await this.dbClient.connect();
    const db = this.dbClient.db();
    const fileCollection = await db.collection('files').countDocuments();
    return fileCollection;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
