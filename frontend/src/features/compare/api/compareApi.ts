import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_API_BASE + "/api";

export interface CompareSpecItemDto {
    attributeId: number;
    attributeName: string;
    sortOrder: number;
    displayValue: string;
}

export interface CompareProductDto {
    id: number;
    name: string;
    slug: string;
    price: number;
    oldPrice?: number | null;
    categoryId: number;
    mainImageUrl?: string | null;
    reviewsCount?: number | null;
    specifications: CompareSpecItemDto[];
}

const baseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
        const token = localStorage.getItem("token");
        if (token) headers.set("Authorization", `Bearer ${token}`);
        return headers;
    },
});

export const compareApi = createApi({
    reducerPath: "compareApi",
    baseQuery,
    tagTypes: ["Compare"],
    endpoints: (builder) => ({
        getCompare: builder.query<CompareProductDto[], void>({
            query: () => "/compare",
            providesTags: (result) =>
                result
                    ? [
                          ...result.map((p) => ({ type: "Compare" as const, id: p.id })),
                          { type: "Compare", id: "LIST" },
                      ]
                    : [{ type: "Compare", id: "LIST" }],
        }),
        getCompareIds: builder.query<number[], void>({
            query: () => "/compare/ids",
            providesTags: (result) =>
                result
                    ? [
                          ...result.map((id) => ({ type: "Compare" as const, id })),
                          { type: "Compare", id: "LIST" },
                      ]
                    : [{ type: "Compare", id: "LIST" }],
        }),
        addToCompare: builder.mutation<{ added: boolean }, number>({
            query: (productId) => ({
                url: `/compare/${productId}`,
                method: "POST",
            }),
            invalidatesTags: (_result, _err, productId) => [
                { type: "Compare", id: productId },
                { type: "Compare", id: "LIST" },
            ],
        }),
        removeFromCompare: builder.mutation<{ removed: boolean }, number>({
            query: (productId) => ({
                url: `/compare/${productId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _err, productId) => [
                { type: "Compare", id: productId },
                { type: "Compare", id: "LIST" },
            ],
        }),
        clearCompare: builder.mutation<{ cleared: boolean }, void>({
            query: () => ({
                url: "/compare",
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Compare", id: "LIST" }],
        }),
    }),
});

export const {
    useGetCompareQuery,
    useGetCompareIdsQuery,
    useAddToCompareMutation,
    useRemoveFromCompareMutation,
    useClearCompareMutation,
} = compareApi;
