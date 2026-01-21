import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface PaginationModel {
    totalCount: number;
    totalPages: number;
    itemsPerPage: number;
    currentPage: number;
}

export interface SearchResult<T> {
    items: T[];
    pagination: PaginationModel;
}

export interface ProductListItemDto {
    id: number;
    name: string;
    price: number;
    slug: string;
    categoryId: number;
    mainImageUrl?: string | null;
}

const API_URL = import.meta.env.VITE_API_BASE + "/api";

export const productApi = createApi({
    reducerPath: "productApi",
    baseQuery: fetchBaseQuery({
        baseUrl: API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["Products"],
    endpoints: (builder) => ({
        getProductsPaged: builder.query<SearchResult<ProductListItemDto>, { page: number; pageSize: number }>({
            query: ({ page, pageSize }) => ({
                url: "products/paged",
                params: { page, pageSize },
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.items.map((p) => ({ type: "Products" as const, id: p.id })),
                        { type: "Products" as const, id: "LIST" },
                    ]
                    : [{ type: "Products" as const, id: "LIST" }],
        }),

        deleteProduct: builder.mutation<void, number>({
            query: (id) => ({
                url: `products/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_r, _e, id) => [
                { type: "Products", id },
                { type: "Products", id: "LIST" },
            ],
        }),
    }),
});

export const { useGetProductsPagedQuery, useDeleteProductMutation } = productApi;
