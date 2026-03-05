import { WifiOff, RefreshCcw } from 'lucide-react'

export default function OfflineState({ error, onRetry }: { error?: any, onRetry?: () => void }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh] p-6 content-z">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-6 relative">
                <WifiOff className="w-8 h-8 text-red-500" />
                <div className="absolute -inset-2 rounded-full border border-red-500/10 animate-ping opacity-50" />
            </div>

            <h2 className="text-xl font-bold tracking-tight text-text mb-2">SYSTEM OFFLINE</h2>
            <p className="text-sm text-muted text-center max-w-sm mb-8 leading-relaxed">
                INTEL·OS cannot connect to the MongoDB cluster. The network may be restricting the connection, or your IP is not whitelisted.
            </p>

            {error && (
                <div className="bg-surface2 border border-borderLo rounded-xl p-4 w-full max-w-sm mb-8">
                    <p className="text-[10px] font-mono text-muted2 uppercase tracking-widest mb-1">Diagnostic Info</p>
                    <p className="text-sm font-mono text-red-400 break-all">{error.message || String(error)}</p>
                </div>
            )}

            <button
                onClick={() => {
                    if (onRetry) onRetry()
                    else window.location.reload()
                }}
                className="flex items-center gap-2 bg-text text-bg px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 a-transition"
            >
                <RefreshCcw className="w-4 h-4" /> Reconnect
            </button>
        </div>
    )
}
