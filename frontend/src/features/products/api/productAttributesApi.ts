import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// GET /api/categories/{id}/attributes — attributes for category (with inheritance)
// GET /api/Products/{id}/attributes — product attribute values
// PUT /api/Products/{id}/attributes — upsert product attribute values

export const AttributeDataType = {
    String: "String",
    Number: "Number",
    Bool: "Bool",
    Enum: "Enum",
} as const;
export type AttributeDataType = (typeof AttributeDataType)[keyof typeof AttributeDataType];

export interface AttributeOptionItemDto {
    id: number;
    value: string;
}

export interface CategoryAttributeItemDto {
    attributeId: number;
    name: string;
    dataType: AttributeDataType;
    unit: string | null;
    isRequired: boolean;
    sortOrder: number;
    isFilterable: boolean;
    options: AttributeOptionItemDto[];
}

export interface ProductAttributeValueDto {
    attributeId: number;
    valueString: string | null;
    valueNumber: number | null;
    valueBool: boolean | null;
    optionId: number | null;
}

export interface ProductAttributeValueUpsertItem {
    attributeId: number;
    valueString?: string | null;
    valueNumber?: number | null;
    valueBool?: boolean | null;
    optionId?: number | null;
}

export interface ProductAttributeValueUpsertRequest {
    values: ProductAttributeValueUpsertItem[];
}

// Admin: category attribute bindings + attributes list
export interface AdminCategoryAttributeBindingDto {
    attributeId: number;
    attributeName: string;
    isRequired: boolean;
    sortOrder: number;
    isFilterable: boolean;
}

export interface AdminCategoryAttributeBindingUpdateItem {
    attributeId: number;
    isRequired: boolean;
    sortOrder: number;
    isFilterable: boolean;
}

export interface AdminCategoryAttributeBindingUpdateRequest {
    bindings: AdminCategoryAttributeBindingUpdateItem[];
}

export interface AdminInheritedAttributeBindingDto {
    attributeId: number;
    attributeName: string;
    isRequired: boolean;
    sortOrder: number;
    isFilterable: boolean;
    fromCategoryId: number;
    fromCategoryName: string;
}

export interface AdminCategoryAttributeBindingsResponse {
    direct: AdminCategoryAttributeBindingDto[];
    inherited: AdminInheritedAttributeBindingDto[];
}

export interface AdminAttributeListItemDto {
    id: number;
    name: string;
    slug: string | null;
    dataType: AttributeDataType;
    unit: string | null;
}

export interface SearchResultAdmin<T> {
    items: T[];
    pagination: { totalCount: number; totalPages: number; itemsPerPage: number; currentPage: number };
}

export interface AdminAttributeOptionDto {
    id: number;
    value: string;
}

export interface AdminAttributeDetailsDto {
    id: number;
    name: string;
    slug: string | null;
    dataType: AttributeDataType;
    unit: string | null;
    options: AdminAttributeOptionDto[];
}

export interface AdminAttributeCreateRequest {
    name: string;
    slug?: string | null;
    dataType: AttributeDataType;
    unit?: string | null;
    options?: { value: string }[];
}

export interface AdminAttributeUpdateRequest {
    name: string;
    slug?: string | null;
    dataType: AttributeDataType;
    unit?: string | null;
    options?: { id?: number | null; value: string }[];
}

const API_URL = import.meta.env.VITE_API_BASE + "/api";

export const productAttributesApi = createApi({
    reducerPath: "productAttributesApi",
    baseQuery: fetchBaseQuery({
        baseUrl: API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["ProductAttributes"],
    endpoints: (builder) => ({
        getCategoryAttributes: builder.query<CategoryAttributeItemDto[], number>({
            query: (categoryId) => `categories/${categoryId}/attributes`,
            providesTags: (_r, _e, categoryId) => [
                { type: "ProductAttributes", id: `category-${categoryId}` },
            ],
        }),

        getProductAttributes: builder.query<ProductAttributeValueDto[], number>({
            query: (productId) => `Products/${productId}/attributes`,
            providesTags: (_r, _e, productId) => [
                { type: "ProductAttributes", id: `product-${productId}` },
            ],
        }),

        setProductAttributes: builder.mutation<void, { productId: number; body: ProductAttributeValueUpsertRequest }>({
            query: ({ productId, body }) => ({
                url: `Products/${productId}/attributes`,
                method: "PUT",
                body,
                headers: { "Content-Type": "application/json" },
            }),
            invalidatesTags: (_r, _e, { productId }) => [
                { type: "ProductAttributes", id: `product-${productId}` },
            ],
        }),

        getAdminCategoryAttributeBindings: builder.query<AdminCategoryAttributeBindingsResponse, number>({
            query: (categoryId) => `admin/categories/${categoryId}/attribute-bindings`,
            providesTags: (_r, _e, categoryId) => [
                { type: "ProductAttributes", id: `admin-bindings-${categoryId}` },
            ],
        }),

        setAdminCategoryAttributeBindings: builder.mutation<
            void,
            { categoryId: number; body: AdminCategoryAttributeBindingUpdateRequest }
        >({
            query: ({ categoryId, body }) => ({
                url: `admin/categories/${categoryId}/attribute-bindings`,
                method: "PUT",
                body,
                headers: { "Content-Type": "application/json" },
            }),
            invalidatesTags: (_r, _e, { categoryId }) => [
                { type: "ProductAttributes", id: `admin-bindings-${categoryId}` },
                { type: "ProductAttributes", id: `category-${categoryId}` },
            ],
        }),

        getAdminAttributesList: builder.query<
            SearchResultAdmin<AdminAttributeListItemDto>,
            { page?: number; pageSize?: number; search?: string }
        >({
            query: ({ page = 1, pageSize = 200, search }): Record<string, string | number> => {
                const params: Record<string, string | number> = { page, pageSize };
                if (search?.trim()) params.search = search.trim();
                return { url: "admin/attributes", params };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.items.map((a) => ({ type: "ProductAttributes" as const, id: `admin-attr-${a.id}` })),
                        { type: "ProductAttributes" as const, id: "ADMIN-ATTR-LIST" },
                    ]
                    : [{ type: "ProductAttributes" as const, id: "ADMIN-ATTR-LIST" }],
        }),

        getAdminAttributeById: builder.query<AdminAttributeDetailsDto, number>({
            query: (id) => `admin/attributes/${id}`,
            providesTags: (_r, _e, id) => [{ type: "ProductAttributes", id: `admin-attr-${id}` }],
        }),

        createAdminAttribute: builder.mutation<number, AdminAttributeCreateRequest>({
            query: (body) => ({
                url: "admin/attributes",
                method: "POST",
                body,
                headers: { "Content-Type": "application/json" },
            }),
            invalidatesTags: [{ type: "ProductAttributes", id: "ADMIN-ATTR-LIST" }],
        }),

        updateAdminAttribute: builder.mutation<void, { id: number; body: AdminAttributeUpdateRequest }>({
            query: ({ id, body }) => ({
                url: `admin/attributes/${id}`,
                method: "PUT",
                body,
                headers: { "Content-Type": "application/json" },
            }),
            invalidatesTags: (_r, _e, { id }) => [
                { type: "ProductAttributes", id: `admin-attr-${id}` },
                { type: "ProductAttributes", id: "ADMIN-ATTR-LIST" },
            ],
        }),

        deleteAdminAttribute: builder.mutation<void, number>({
            query: (id) => ({
                url: `admin/attributes/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_r, _e, id) => [
                { type: "ProductAttributes", id: `admin-attr-${id}` },
                { type: "ProductAttributes", id: "ADMIN-ATTR-LIST" },
            ],
        }),
    }),
});

export const {
    useGetCategoryAttributesQuery,
    useGetProductAttributesQuery,
    useSetProductAttributesMutation,
    useGetAdminCategoryAttributeBindingsQuery,
    useSetAdminCategoryAttributeBindingsMutation,
    useGetAdminAttributesListQuery,
    useGetAdminAttributeByIdQuery,
    useCreateAdminAttributeMutation,
    useUpdateAdminAttributeMutation,
    useDeleteAdminAttributeMutation,
} = productAttributesApi;
