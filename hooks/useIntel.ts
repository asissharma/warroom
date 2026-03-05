import useSWR from 'swr'
import type { IntelEntry } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useIntel(topic?: string) {
    const url = topic ? `/api/intel?topic=${encodeURIComponent(topic)}` : '/api/intel'
    const { data, error, mutate, isLoading } = useSWR<IntelEntry[]>(url, fetcher)

    const createEntry = async (entry: Partial<IntelEntry>) => {
        const res = await fetch('/api/intel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
        })
        if (res.ok) {
            mutate()
        }
        return res.ok
    }

    return {
        data,
        isLoading,
        error,
        createEntry
    }
}
