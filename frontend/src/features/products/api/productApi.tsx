import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ========== Backend contract (ProductsController + DTOs) ==========
// GET  /api/Products/list — all
// GET  /api/Products/paged?page&pageSize&search&isDeleted — paged (search by name/slug; isDeleted: true=deleted, false=active, null=all)
// GET  /api/Products/{id} — one
// POST /api/Products — [FromForm] Name, Slug, Price, Description?, CategoryId, Images (List<IFormFile>?)
// PUT  /api/Products/{id} — [FromForm] Name, Slug, Price, Description?, CategoryId, NewImages (List<IFormFile>?)
// DELETE /api/Products/{id} — soft delete
// POST /api/Products/{id}/restore — restore

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
    slug: string;
    price: number;
    categoryId: number;
    mainImageUrl?: string | null;
    isDeleted: boolean;
}

export interface ProductDetailsDto {
    id: number;
    name: string;
    slug: string;
    price: number;
    description?: string | null;
    categoryId: number;
    imageUrls: string[];
}

/** Form data for POST create — multipart/form-data */
export interface CreateProductForm {
    name: string;
    slug: string;
    price: number;
    description?: string | null;
    categoryId: number;
    images?: File[];
}

/** Form data for PUT update — multipart/form-data. Do not send NewImages if no new files. */
export interface UpdateProductForm {
    name: string;
    slug: string;
    price: number;
    description?: string | null;
    categoryId: number;
    newImages?: File[];
}

function buildCreateProductFormData(data: CreateProductForm): FormData {
    const fd = new FormData();
    fd.append("Name", data.name);
    fd.append("Slug", data.slug);
    fd.append("Price", String(data.price));
    if (data.description != null && data.description !== "") fd.append("Description", data.description);
    fd.append("CategoryId", String(data.categoryId));
    if (data.images?.length) {
        data.images.forEach((file) => fd.append("Images", file));
    }
    return fd;
}

function buildUpdateProductFormData(data: UpdateProductForm): FormData {
    const fd = new FormData();
    fd.append("Name", data.name);
    fd.append("Slug", data.slug);
    fd.append("Price", String(data.price));
    if (data.description != null && data.description !== "") fd.append("Description", data.description);
    fd.append("CategoryId", String(data.categoryId));
    if (data.newImages?.length) {
        data.newImages.forEach((file) => fd.append("NewImages", file));
    }
    return fd;
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
        getProductsPaged: builder.query<
            SearchResult<ProductListItemDto>,
            { page: number; pageSize: number; search?: string; isDeleted?: boolean | null }
        >({
            query: ({ page, pageSize, search, isDeleted }) => {
                const params: Record<string, string | number> = { page, pageSize };
                if (search != null && search.trim() !== "") params.search = search.trim();
                if (isDeleted === true) params.isDeleted = "true";
                else if (isDeleted === false) params.isDeleted = "false";
                return { url: "Products/paged", params };
            },
            providesTags: (result) =>
                result
                    ? [
                          ...result.items.map((p) => ({ type: "Products" as const, id: p.id })),
                          { type: "Products" as const, id: "LIST" },
                      ]
                    : [{ type: "Products" as const, id: "LIST" }],
        }),

        getProductById: builder.query<ProductDetailsDto, number>({
            query: (id) => `Products/${id}`,
            providesTags: (_r, _e, id) => [{ type: "Products", id }],
        }),

        createProduct: builder.mutation<number, CreateProductForm>({
            query: (body) => ({
                url: "Products",
                method: "POST",
                body: buildCreateProductFormData(body),
            }),
            invalidatesTags: [{ type: "Products", id: "LIST" }],
        }),

        updateProduct: builder.mutation<void, { id: number; body: UpdateProductForm }>({
            query: ({ id, body }) => ({
                url: `Products/${id}`,
                method: "PUT",
                body: buildUpdateProductFormData(body),
            }),
            invalidatesTags: (_r, _e, { id }) => [
                { type: "Products", id },
                { type: "Products", id: "LIST" },
            ],
        }),

        deleteProduct: builder.mutation<void, number>({
            query: (id) => ({
                url: `Products/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_r, _e, id) => [
                { type: "Products", id },
                { type: "Products", id: "LIST" },
            ],
        }),

        restoreProduct: builder.mutation<void, number>({
            query: (id) => ({
                url: `Products/${id}/restore`,
                method: "POST",
            }),
            invalidatesTags: (_r, _e, id) => [
                { type: "Products", id },
                { type: "Products", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetProductsPagedQuery,
    useGetProductByIdQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useRestoreProductMutation,
} = productApi;
