import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGODB_URI;

if (!MONGODB_URI) {
  // It's OK to throw here on server start — makes misconfiguration obvious
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Mongoose connection helper that caches the connection in development to
 * avoid creating multiple connections during hot reloads.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Add any other mongoose options you need here
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseIns) => {
      return mongooseIns;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connect;

export function disconnect() {
  if (process.env.NODE_ENV === 'production') {
    return mongoose.disconnect();
  }
  // in development keep the connection open (Turbopack/Hot reload friendly)
  return Promise.resolve();
}
