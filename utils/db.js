const mongodb = require('mongodb');
const sha1 = require('sha1');

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
    return Number(fileCollection);
  }

  async keyExists(key) {
    await this.dbClient.connect();
    const db = this.dbClient.db();
    const cursor = await db.collection('users').find({ email: key });
    const docs = await cursor.toArray();
    if (docs.length > 0) {
      return true;
    }
    return false;
  }

  async insertUser(userObj) {
    await this.dbClient.connect();

    const hashedPwd = sha1(userObj.password);
    const newUserObj = { email: userObj.email, password: hashedPwd };

    const db = this.dbClient.db();
    const result = await db.collection('users').insertOne(newUserObj);
    return { id: result.insertedId, email: userObj.email };
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
