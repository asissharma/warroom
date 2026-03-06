import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useTopic(topicKey: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        topicKey ? `/api/map/${encodeURIComponent(topicKey)}` : null,
        fetcher
    )

    return {
        data,
        isLoading,
        error,
        mutate
    }
}
