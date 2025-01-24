import mongoose from "mongoose";

// Load the MongoDB URI from the environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Create a global cache object to store the connection and promise
// This ensures we reuse the connection across function calls in serverless environments
let cached = (global as any).mongoose || { conn: null, promise: null };

/**
 * Connect to the MongoDB database using Mongoose.
 *
 * - If a connection already exists (cached), it returns the existing connection.
 * - If no connection exists, it creates a new one and caches it for future use.
 * - Ensures `MONGODB_URI` is defined before attempting to connect.
 *
 * @returns {Promise<typeof mongoose>} The Mongoose connection object.
 * @throws Will throw an error if `MONGODB_URI` is not defined.
 */
export const connectToDatabase = async () => {
  // Return the cached connection if it already exists
  if (cached.conn) return cached.conn;

  // Ensure the MongoDB URI is defined
  if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");

  // If no cached promise exists, initialize a new connection promise
  cached.promise =
    cached.promise ||
    mongoose.connect(MONGODB_URI, {
      dbName: "eventify", // The name of the database to use
      bufferCommands: false, // Disable Mongoose buffering for unconnected models
    });

  // Await the connection and cache it
  cached.conn = await cached.promise;

  // Return the established connection
  return cached.conn;
};
