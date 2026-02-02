import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Category {
    id: number;
    name: string;
    priority: number | null;
    urlSlug: string;
    parentId?: number | null;
    image?: string | null;
}

export interface CreateCategoryRequest {
    name: string;
    priority: number;
    urlSlug: string;
    parentId?: number | null;
    image?: string | null;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {
    id: number;
}

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

const API_URL = import.meta.env.VITE_API_BASE + "/api";

export const categoryApi = createApi({
    reducerPath: "categoryApi",
    baseQuery: fetchBaseQuery({
        baseUrl: API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["Categories"],
    endpoints: (builder) => ({
        // 🔹 ДЕРЕВО (як було)
        getCategories: builder.query<Category[], void>({
            query: () => "categories",
            providesTags: [{ type: "Categories", id: "LIST" }],
        }),

        // 🔹 ПАГІНАЦІЯ (адмін-таблиця)
        getCategoriesPaged: builder.query<
            SearchResult<Category>,
            { page: number; pageSize: number }
        >({
            query: ({ page, pageSize }) => ({
                url: "categories/paged",
                params: {
                    page,
                    pageSize, // бек очікує саме pageSize
                },
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.items.map((c) => ({
                            type: "Categories" as const,
                            id: c.id,
                        })),
                        { type: "Categories" as const, id: "LIST" },
                    ]
                    : [{ type: "Categories" as const, id: "LIST" }],
        }),

        createCategory: builder.mutation<Category, CreateCategoryRequest>({
            query: (body) => ({
                url: "categories",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Categories", id: "LIST" }],
        }),

        updateCategory: builder.mutation<void, UpdateCategoryRequest>({
            query: ({ id, ...body }) => ({
                url: `categories/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (_r, _e, arg) => [
                { type: "Categories", id: arg.id },
                { type: "Categories", id: "LIST" },
            ],
        }),

        deleteCategory: builder.mutation<void, number>({
            query: (id) => ({
                url: `categories/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_r, _e, id) => [
                { type: "Categories", id },
                { type: "Categories", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetCategoriesQuery,        // дерево
    useGetCategoriesPagedQuery,   // адмін-таблиця
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoryApi;
