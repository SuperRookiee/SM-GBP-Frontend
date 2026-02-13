import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseQueryOptions,
} from "@tanstack/react-query";
import {
    createSample,
    deleteSample,
    getSampleById,
    getSampleList,
    searchSample,
    updateSample,
} from "@/apis/sample.api";
import type {
    PageResponse,
    SampleFormValues,
    SampleItem,
    SampleSearchParams,
} from "@/types/sample.types";

export const sampleQueryKeys = {
    all: ["samples"] as const,
    list: (params: SampleSearchParams) => [...sampleQueryKeys.all, "list", params] as const,
    detail: (id: number) => [...sampleQueryKeys.all, "detail", id] as const,
    search: (params: SampleSearchParams) => [...sampleQueryKeys.all, "search", params] as const,
};

export const useSampleList = (params: SampleSearchParams) => {
    return useQuery({
        queryKey: sampleQueryKeys.list(params),
        queryFn: () => getSampleList(params),
        placeholderData: (previous) => previous,
    });
};

export const useSampleDetail = (id?: number, options?: Partial<UseQueryOptions<SampleItem>>) => {
    return useQuery({
        queryKey: sampleQueryKeys.detail(id ?? 0),
        queryFn: () => getSampleById(id ?? 0),
        enabled: Boolean(id),
        ...options,
    });
};

export const useSearchSample = (params: SampleSearchParams, enabled = true) => {
    return useQuery({
        queryKey: sampleQueryKeys.search(params),
        queryFn: () => searchSample(params),
        enabled,
        placeholderData: (previous) => previous,
    });
};

export const useCreateSample = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: SampleFormValues) => createSample(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sampleQueryKeys.all });
        },
    });
};

export const useUpdateSample = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: SampleFormValues }) => updateSample(id, payload),
        onMutate: async ({ id, payload }) => {
            await queryClient.cancelQueries({ queryKey: sampleQueryKeys.all });

            const previousQueries = queryClient.getQueriesData<PageResponse<SampleItem>>({
                queryKey: sampleQueryKeys.all,
            });
            const previousDetail = queryClient.getQueryData<SampleItem>(sampleQueryKeys.detail(id));

            previousQueries.forEach(([queryKey, oldData]) => {
                if (!oldData) return;
                queryClient.setQueryData<PageResponse<SampleItem>>(queryKey, {
                    ...oldData,
                    content: oldData.content.map((item) =>
                        item.id === id ? { ...item, ...payload } : item,
                    ),
                });
            });

            if (previousDetail) {
                queryClient.setQueryData<SampleItem>(sampleQueryKeys.detail(id), {
                    ...previousDetail,
                    ...payload,
                });
            }

            return { previousQueries, previousDetail };
        },
        onError: (_error, variables, context) => {
            context?.previousQueries.forEach(([queryKey, oldData]) => {
                queryClient.setQueryData(queryKey, oldData);
            });
            if (context?.previousDetail) {
                queryClient.setQueryData(sampleQueryKeys.detail(variables.id), context.previousDetail);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: sampleQueryKeys.all });
        },
    });
};

export const useDeleteSample = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteSample(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: sampleQueryKeys.all });

            const previousQueries = queryClient.getQueriesData<PageResponse<SampleItem>>({
                queryKey: sampleQueryKeys.all,
            });

            previousQueries.forEach(([queryKey, oldData]) => {
                if (!oldData) return;
                queryClient.setQueryData<PageResponse<SampleItem>>(queryKey, {
                    ...oldData,
                    content: oldData.content.filter((item) => item.id !== id),
                    totalElements: Math.max(oldData.totalElements - 1, 0),
                });
            });

            queryClient.removeQueries({ queryKey: sampleQueryKeys.detail(id), exact: true });
            return { previousQueries };
        },
        onError: (_error, _id, context) => {
            context?.previousQueries.forEach(([queryKey, oldData]) => {
                queryClient.setQueryData(queryKey, oldData);
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: sampleQueryKeys.all });
        },
    });
};
