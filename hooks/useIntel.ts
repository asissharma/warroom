import useSWR from 'swr'
import type { IntelEntry } from '@/types'

const fetcher = async (url: string) => {
    const res = await fetch(url)
    const json = await res.json()
    if (!res.ok) {
        throw new Error(json.error || 'Failed to fetch intel data')
    }
    return json
}

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
