import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_API_BASE + "/api";

// ========== Backend contract (admin orders) ==========
// Currently backend has NO admin endpoints. Existing:
//   GET /api/orders/my     → current user's orders (OrderListItemDto[])
//   GET /api/orders/{id}  → current user's order details (OrderDetailsDto)
// TODO Backend: add GET /api/admin/orders (paged?) and GET /api/admin/orders/{id}
// List DTO (OrderListItemDto): id, createdAt, status, totalPrice, npCityName, npWarehouseName
// Details DTO: + recipientName, recipientPhone, comment, items (OrderItemDto)

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
    itemsCount: number;
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

/** Admin list item — same as OrderListItemDto; optional user fields when backend adds them */
export type AdminOrderListItemDto = OrderListItem & { userId?: number; userEmail?: string };

/** Admin details — same as OrderDetailsDto from backend */
export type AdminOrderDetailsDto = OrderDetails;

/** Paged response when backend adds pagination for admin orders */
export interface SearchResult<T> {
    items: T[];
    pagination: { totalCount: number; totalPages: number; itemsPerPage: number; currentPage: number };
}

export const ordersApi = createApi({
    reducerPath: "ordersApi",
    baseQuery,
    tagTypes: ["Orders", "Cart", "AdminOrders"],
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
        // Admin: GET /api/admin/orders returns SearchResult<OrderListItemDto>; dateFilter: today | week | month | all
        getAdminOrders: builder.query<
            SearchResult<AdminOrderListItemDto>,
            { page?: number; pageSize?: number; dateFilter?: "today" | "week" | "month" | "all" }
        >({
            query: (params) => ({
                url: "admin/orders",
                params: {
                    page: params?.page ?? 1,
                    pageSize: params?.pageSize ?? 20,
                    ...(params?.dateFilter && params.dateFilter !== "all" ? { dateFilter: params.dateFilter } : {}),
                },
            }),
            providesTags: (result) =>
                result
                    ? [...result.items.map((o) => ({ type: "AdminOrders" as const, id: o.id })), { type: "AdminOrders", id: "LIST" }]
                    : [{ type: "AdminOrders", id: "LIST" }],
        }),
        // Admin details: 404 until backend adds GET /api/admin/orders/{id}
        getAdminOrderById: builder.query<AdminOrderDetailsDto, number>({
            query: (id) => `admin/orders/${id}`,
            providesTags: (_result, _err, id) => [{ type: "AdminOrders", id }],
        }),
    }),
});

export const {
    useCreateOrderMutation,
    useGetMyOrdersQuery,
    useGetOrderByIdQuery,
    useGetAdminOrdersQuery,
    useGetAdminOrderByIdQuery,
} = ordersApi;
