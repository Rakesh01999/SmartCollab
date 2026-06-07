import mongoose from 'mongoose';

// ─── Cached connection for serverless environments ──────────────────────────
// On Vercel, each serverless function invocation may create a new Node process.
// Without caching, every request would open a new MongoDB connection, which is
// slow and can exhaust the connection pool. We cache the connection globally so
// that within a single invocation, re-connecting is instant.
let cachedConnection: mongoose.Connection | null = null;

const connectDB = async (): Promise<void> => {
  // If already connected (same process), skip re-connection
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return;
  }

  try {
    const connUri =
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/collab_db';

    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000,
    });

    cachedConnection = conn.connection;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const err = error as Error;
    console.error(`MongoDB Connection Error: ${err.message}`);
    console.log(
      'Ensure MongoDB is running locally, or provide MONGODB_URI in backend/.env'
    );
    // In serverless, throw so the middleware can return 500
    throw error;
  }
};

export default connectDB;
