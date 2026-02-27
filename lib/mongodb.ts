import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) throw new Error('MONGODB_URI not set in .env.local')

// Cache connection across hot reloads
let cached = (global as any)._mongoose

if (!cached) {
    cached = (global as any)._mongoose = { conn: null, promise: null }
}

export async function connectDB() {
    if (cached.conn) return cached.conn
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            dbName: 'intelosv4',
        })
    }
    cached.conn = await cached.promise
    return cached.conn
}
