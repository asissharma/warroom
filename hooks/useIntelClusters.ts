import useSWR from 'swr';
import { IIntelNode } from '@/lib/models/IntelNode';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface ClusterResponse {
    tags: { tag: string; count: number }[];
    clusters: Record<string, IIntelNode[]>;
}

export function useIntelClusters(limit: number = 20) {
    const { data, error, isLoading, mutate } = useSWR<ClusterResponse>(`/api/intel/clusters?limit=${limit}`, fetcher);

    return {
        tags: data?.tags || [],
        clusters: data?.clusters || {},
        isLoading,
        error: error?.message || (data as any)?.error,
        refresh: mutate
    };
}
