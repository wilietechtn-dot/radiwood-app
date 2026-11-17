
import "server-only";

import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const databaseName =
  process.env.MONGODB_DB || "radiwood_db";

if (!uri) {
  console.warn(
    "RadiWood : variable MONGODB_URI manquante."
  );
}

const globalForMongo = globalThis as typeof globalThis & {
  _radiwoodMongoClient?: Promise<MongoClient>;
};

export async function getDatabase(): Promise<Db> {
  if (!uri) {
    throw new Error(
      "MONGODB_URI n'est pas configurée dans .env.local"
    );
  }

  if (!globalForMongo._radiwoodMongoClient) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });

    globalForMongo._radiwoodMongoClient =
      client.connect().catch((error) => {
        globalForMongo._radiwoodMongoClient = undefined;
        throw error;
      });
  }

  const client =
    await globalForMongo._radiwoodMongoClient;

  return client.db(databaseName);
}
