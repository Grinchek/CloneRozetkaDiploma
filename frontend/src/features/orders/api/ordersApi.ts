import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_API_BASE + "/api";

export interface CreateOrderRequest {
    recipientName: string;
    recipientPhone: string;
    npCityRef: string;
    npCityName: string;
    npWarehouseRef: string;
    npWarehouseName: string;
    comment?: string;
}

export interface CreateOrderResponse {
    orderId: number;
    createdAt: string;
    totalPrice: number;
}

export interface OrderListItem {
    id: number;
    createdAt: string;
    status: string;
    totalPrice: number;
    npCityName: string;
    npWarehouseName: string;
}

export interface OrderItemDto {
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    imageUrl?: string | null;
    lineTotal: number;
}

export interface OrderDetails {
    id: number;
    createdAt: string;
    status: string;
    totalPrice: number;
    recipientName: string;
    recipientPhone: string;
    npCityName: string;
    npWarehouseName: string;
    comment?: string | null;
    items: OrderItemDto[];
}

const baseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
        const token = localStorage.getItem("token");
        if (token) headers.set("Authorization", `Bearer ${token}`);
        return headers;
    },
});

export const ordersApi = createApi({
    reducerPath: "ordersApi",
    baseQuery,
    tagTypes: ["Orders", "Cart"],
    endpoints: (builder) => ({
        createOrder: builder.mutation<CreateOrderResponse, CreateOrderRequest>({
            query: (body) => ({ url: "/orders", method: "POST", body }),
            invalidatesTags: [{ type: "Orders", id: "LIST" }, { type: "Cart", id: "CART" }],
        }),
        getMyOrders: builder.query<OrderListItem[], void>({
            query: () => "/orders/my",
            providesTags: [{ type: "Orders", id: "LIST" }],
        }),
        getOrderById: builder.query<OrderDetails, number>({
            query: (id) => `/orders/${id}`,
            providesTags: (_result, _err, id) => [{ type: "Orders", id }],
        }),
    }),
});

export const { useCreateOrderMutation, useGetMyOrdersQuery, useGetOrderByIdQuery } = ordersApi;
