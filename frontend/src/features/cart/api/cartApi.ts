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
    tagTypes: ["Cart"],
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
    }),
});

export const {
    useGetCartQuery,
    useAddCartItemMutation,
    useUpdateCartItemQtyMutation,
    useRemoveCartItemMutation,
    useClearCartMutation,
} = cartApi;
