import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ========== Backend contract (CategoriesController + DTOs) ==========
// GET /api/categories — list all
// GET /api/categories/paged?page&pageSize&search&isDeleted — paged (search by name/slug; isDeleted: true=deleted, false=active, null=all)
// GET /api/categories/{id} — get one
// POST /api/categories — [FromForm] Name, Priority, UrlSlug, ParentId?, Image?
// PUT  /api/categories — [FromForm] Id, Name, Priority, UrlSlug, ParentId?, Image?
// DELETE /api/categories/{id} — soft delete
// POST /api/categories/{id}/restore — restore

export interface CategoryDto {
    id: number;
    name: string;
    priority: number;
    urlSlug: string;
    parentId: number | null;
    image: string | null;
    isDeleted: boolean;
}

export interface PaginationModel {
    totalCount: number;
    totalPages: number;
    itemsPerPage: number;
    currentPage: number;
}

export interface PagedResponse<T> {
    items: T[];
    pagination: PaginationModel;
}

/** Form body for POST: multipart/form-data */
export interface CreateCategoryForm {
    name: string;
    priority: number;
    urlSlug: string;
    parentId?: number | null;
    image?: File | null;
}

/** Form body for PUT: multipart/form-data */
export interface UpdateCategoryForm {
    id: number;
    name: string;
    priority: number;
    urlSlug: string;
    parentId?: number | null;
    image?: File | null;
}

const API_URL = import.meta.env.VITE_API_BASE + "/api";

function buildCategoryFormData(data: CreateCategoryForm | UpdateCategoryForm): FormData {
    const fd = new FormData();
    if ("id" in data) fd.append("Id", String(data.id));
    fd.append("Name", data.name);
    fd.append("Priority", String(data.priority));
    fd.append("UrlSlug", data.urlSlug);
    if (data.parentId != null) fd.append("ParentId", String(data.parentId));
    if (data.image instanceof File) fd.append("Image", data.image);
    return fd;
}

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
        getCategories: builder.query<CategoryDto[], void>({
            query: () => "categories",
            providesTags: [{ type: "Categories", id: "LIST" }],
        }),

        getCategoriesPaged: builder.query<
            PagedResponse<CategoryDto>,
            { page: number; pageSize: number; search?: string; isDeleted?: boolean | null }
        >({
            query: ({ page, pageSize, search, isDeleted }) => {
                const params: Record<string, string | number> = { page, pageSize };
                if (search != null && search.trim() !== "") params.search = search.trim();
                // Явно передаємо "true"/"false" щоб бекенд точно отримав isDeleted
                if (isDeleted === true) params.isDeleted = "true";
                else if (isDeleted === false) params.isDeleted = "false";
                return { url: "categories/paged", params };
            },
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

        getCategoryById: builder.query<CategoryDto, number>({
            query: (id) => `categories/${id}`,
            providesTags: (_r, _e, id) => [{ type: "Categories", id }],
        }),

        createCategory: builder.mutation<number, CreateCategoryForm>({
            query: (body) => ({
                url: "categories",
                method: "POST",
                body: buildCategoryFormData(body),
            }),
            invalidatesTags: [{ type: "Categories", id: "LIST" }],
        }),

        updateCategory: builder.mutation<void, UpdateCategoryForm>({
            query: (body) => ({
                url: "categories",
                method: "PUT",
                body: buildCategoryFormData(body),
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

        restoreCategory: builder.mutation<void, number>({
            query: (id) => ({
                url: `categories/${id}/restore`,
                method: "POST",
            }),
            invalidatesTags: (_r, _e, id) => [
                { type: "Categories", id },
                { type: "Categories", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useGetCategoriesPagedQuery,
    useGetCategoryByIdQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
    useRestoreCategoryMutation,
} = categoryApi;
