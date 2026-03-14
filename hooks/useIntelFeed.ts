import useSWR from 'swr';
import { IIntelNode } from '@/lib/models/IntelNode';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface UseIntelFeedOptions {
    type?: string;
    source?: string;
    domain?: string;
    status?: string;
    tags?: string;
    dayN?: number;
    page?: number;
    limit?: number;
}

interface IntelFeedResponse {
    data: IIntelNode[];
    meta: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export function useIntelFeed(options: UseIntelFeedOptions = {}) {
    // Build query string ensuring undefined values are dropped
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
        }
    });

    const queryString = params.toString();
    const url = `/api/intel${queryString ? `?${queryString}` : ''}`;

    const { data, error, isLoading, mutate } = useSWR<IntelFeedResponse>(url, fetcher);

    return {
        feed: data?.data || [],
        meta: data?.meta || { total: 0, page: 1, limit: 50, pages: 1 },
        isLoading,
        error: error?.message || (data as any)?.error,
        refresh: mutate
    };
}
