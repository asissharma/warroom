import mongoose from 'mongoose'
import dns from 'dns'
import { Resolver } from 'dns/promises'

// ─── Root cause & fix ─────────────────────────────────────────────────────────
// Mobile hotspot / ISP routers block the SRV DNS query type that mongodb+srv://
// requires. The MongoDB driver also calls dns.lookup() (the OS getaddrinfo, NOT
// the c-ares resolver) when opening TCP sockets — so dns.setServers() alone is
// not enough. The fix: monkey-patch dns.lookup for *.mongodb.net hostnames to
// route through a private Cloudflare resolver, then use the full multi-host URI
// with replicaSet so the driver can elect a primary for writes.
// ─────────────────────────────────────────────────────────────────────────────

const _cfResolver = new Resolver()
_cfResolver.setServers(['1.1.1.1', '8.8.8.8', '1.0.0.1'])

// Patch dns.lookup for *.mongodb.net — leave everything else untouched
const _origLookup = dns.lookup.bind(dns)
    ; (dns as any).lookup = function patchedLookup(
        hostname: string,
        optionsOrCb: any,
        cb?: any,
    ) {
        if (typeof hostname === 'string' && hostname.endsWith('.mongodb.net')) {
            const callback: (err: any, addr: string, family: number) => void =
                typeof optionsOrCb === 'function' ? optionsOrCb : cb
            _cfResolver
                .resolve4(hostname)
                .then(ips => callback(null, ips[0], 4))
                .catch(() => _origLookup(hostname, optionsOrCb, cb))
            return
        }
        return _origLookup(hostname, optionsOrCb, cb)
    }

// ─── Connection ───────────────────────────────────────────────────────────────

// Direct seedlist URI — no SRV lookup needed; driver elects primary automatically
const MONGODB_URI =
    'mongodb://contactmodenno:F7LELwZLvAXsG5kY' +
    '@ac-e4d4zxv-shard-00-00.21ace6e.mongodb.net:27017' +
    ',ac-e4d4zxv-shard-00-01.21ace6e.mongodb.net:27017' +
    ',ac-e4d4zxv-shard-00-02.21ace6e.mongodb.net:27017' +
    '/WarRoom?ssl=true&replicaSet=atlas-e4d4zxv-shard-0' +
    '&authSource=admin&retryWrites=true&w=majority'

// Hot-reload safe connection cache
let cached = (global as any)._mongoose as {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
}
if (!cached) {
    cached = (global as any)._mongoose = { conn: null, promise: null }
}

export async function connectDB() {
    if (cached.conn) return cached.conn

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            dbName: 'WarRoom',
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })
    }

    try {
        cached.conn = await cached.promise
    } catch (err) {
        cached.promise = null // allow retry on next request
        throw err
    }

    return cached.conn
}
