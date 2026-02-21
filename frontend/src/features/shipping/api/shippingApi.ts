import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_API_BASE + "/api";

export interface NpCity {
    ref: string;
    name: string;
}

export interface NpWarehouse {
    ref: string;
    name: string;
    number?: string | null;
}

export const shippingApi = createApi({
    reducerPath: "shippingApi",
    baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
    endpoints: (builder) => ({
        getNpCities: builder.query<NpCity[], string>({
            query: (query) => ({ url: "/shipping/np/cities", params: { query: query || undefined } }),
        }),
        getNpWarehouses: builder.query<NpWarehouse[], string>({
            query: (cityRef) => ({ url: "/shipping/np/warehouses", params: { cityRef: cityRef || undefined } }),
        }),
    }),
});

export const { useGetNpCitiesQuery, useGetNpWarehousesQuery, useLazyGetNpCitiesQuery, useLazyGetNpWarehousesQuery } = shippingApi;
