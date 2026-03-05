import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useMap() {
    const { data: statuses, mutate: mutateStatuses, error: statusError } = useSWR('/api/map', fetcher)
    const { data: stats, error: statsError } = useSWR('/api/stats', fetcher)

    const updateTopicStatus = async (topicKey: string, status: string) => {
        const res = await fetch(`/api/map?topicKey=${encodeURIComponent(topicKey)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        })
        if (res.ok) {
            mutateStatuses()
        }
    }

    return {
        statuses,
        stats,
        error: statusError || statsError,
        updateTopicStatus
    }
}
