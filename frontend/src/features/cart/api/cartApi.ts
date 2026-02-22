import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_API_BASE + "/api";

export interface CartItemDto {
    productId: number;
    productName: string;
    price: number;
    imageUrl?: string | null;
    quantity: number;
    lineTotal: number;
}

export interface CartDto {
    items: CartItemDto[];
    totalQuantity: number;
    totalPrice: number;
}

/** Admin: one row per user that has at least one cart item */
export interface AdminCartListItemDto {
    userId: number;
    userEmail?: string | null;
    userName?: string | null;
    totalQuantity: number;
    totalPrice: number;
    itemsCount: number;
    lastUpdatedAt?: string | null;
}

export interface AdminCartsSearchResult {
    items: AdminCartListItemDto[];
    pagination: { totalCount: number; totalPages: number; itemsPerPage: number; currentPage: number };
}

export interface AddCartItemRequest {
    productId: number;
    quantity: number;
}

export interface UpdateCartItemRequest {
    quantity: number;
}

const baseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
        const token = localStorage.getItem("token");
        if (token) headers.set("Authorization", `Bearer ${token}`);
        return headers;
    },
});

export const cartApi = createApi({
    reducerPath: "cartApi",
    baseQuery,
    tagTypes: ["Cart", "AdminCarts"],
    endpoints: (builder) => ({
        getCart: builder.query<CartDto, void>({
            query: () => "/cart",
            providesTags: [{ type: "Cart", id: "CART" }],
        }),
        addCartItem: builder.mutation<CartDto, AddCartItemRequest>({
            query: (body) => ({ url: "/cart/items", method: "POST", body }),
            invalidatesTags: [{ type: "Cart", id: "CART" }],
        }),
        updateCartItemQty: builder.mutation<CartDto, { productId: number; quantity: number }>({
            query: ({ productId, quantity }) => ({
                url: `/cart/items/${productId}`,
                method: "PUT",
                body: { quantity },
            }),
            invalidatesTags: [{ type: "Cart", id: "CART" }],
        }),
        removeCartItem: builder.mutation<CartDto, number>({
            query: (productId) => ({ url: `/cart/items/${productId}`, method: "DELETE" }),
            invalidatesTags: [{ type: "Cart", id: "CART" }],
        }),
        clearCart: builder.mutation<CartDto, void>({
            query: () => ({ url: "/cart/clear", method: "DELETE" }),
            invalidatesTags: [{ type: "Cart", id: "CART" }],
        }),
        // Admin: paged list of user carts; dateFilter: today | week | month | all (by lastUpdatedAt)
        getAdminCarts: builder.query<
            AdminCartsSearchResult,
            { page?: number; pageSize?: number; dateFilter?: "today" | "week" | "month" | "all" }
        >({
            query: (params) => ({
                url: "admin/carts",
                params: {
                    page: params?.page ?? 1,
                    pageSize: params?.pageSize ?? 20,
                    ...(params?.dateFilter && params.dateFilter !== "all" ? { dateFilter: params.dateFilter } : {}),
                },
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.items.map((c) => ({ type: "AdminCarts" as const, id: c.userId })),
                          { type: "AdminCarts", id: "LIST" },
                      ]
                    : [{ type: "AdminCarts", id: "LIST" }],
        }),
        // Admin: cart details for a user
        getAdminCartByUserId: builder.query<CartDto, number>({
            query: (userId) => `admin/carts/${userId}`,
            providesTags: (_result, _err, userId) => [{ type: "AdminCarts", id: userId }],
        }),
    }),
});

export const {
    useGetCartQuery,
    useAddCartItemMutation,
    useUpdateCartItemQtyMutation,
    useRemoveCartItemMutation,
    useClearCartMutation,
    useGetAdminCartsQuery,
    useGetAdminCartByUserIdQuery,
} = cartApi;
