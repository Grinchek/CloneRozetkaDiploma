import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Category {
    id: number;
    name: string;
    slug: string;

}

export interface CreateCategoryRequest {
    name: string;
    slug: string;
}

export interface UpdateCategoryRequest {
    id: number;
    name: string;
    slug: string;
}
const API_URL = import.meta.env.VITE_API_BASE + '/api';
export const categoryApi = createApi({
    reducerPath: 'categoryApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_URL,
    }),
    tagTypes: ['Categories'],
    endpoints: (builder) => ({
        getCategories: builder.query<Category[], void>({
            query: () => 'categories',
            providesTags: (result) =>
                result
                    ? [
                        ...result.map((c) => ({ type: 'Categories' as const, id: c.id })),
                        { type: 'Categories', id: 'LIST' },
                    ]
                    : [{ type: 'Categories', id: 'LIST' }],
        }),

        createCategory: builder.mutation<Category, CreateCategoryRequest>({
            query: (body) => ({
                url: 'categories',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Categories', id: 'LIST' }],
        }),

        updateCategory: builder.mutation<void, UpdateCategoryRequest>({
            query: ({ id, ...body }) => ({
                url: `categories/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Categories', id: arg.id },
                { type: 'Categories', id: 'LIST' },
            ],
        }),

        deleteCategory: builder.mutation<void, number>({
            query: (id) => ({
                url: `categories/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Categories', id },
                { type: 'Categories', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoryApi;
