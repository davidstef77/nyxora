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

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongooseIns) => mongooseIns)
      .catch((err) => {
        // Reset the promise so subsequent calls can retry
        cached.promise = null;
        // Provide a clearer error message for common Atlas/network issues
        const help = `Failed to connect to MongoDB. Check your network/Atlas IP access list and that the MONGODB_URI is correct. See: https://www.mongodb.com/docs/atlas/security-whitelist/`;
        // Attach original error as cause if available, but avoid leaking credentials
        const wrapped = new Error(`${help} Original error: ${err && err.message ? err.message : String(err)}`);
        // preserve stack for debugging
        wrapped.stack = err && err.stack ? `${wrapped.stack}\nCaused by: ${err.stack}` : wrapped.stack;
        throw wrapped;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    // If connection failed, clear cached.conn so future attempts can retry
    cached.conn = null;
    // Re-throw the error (already wrapped above)
    throw err;
  }
}

export default connect;

export function disconnect() {
  if (process.env.NODE_ENV === 'production') {
    return mongoose.disconnect();
  }
  // in development keep the connection open (Turbopack/Hot reload friendly)
  return Promise.resolve();
}
