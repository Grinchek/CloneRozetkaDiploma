import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_API_BASE + "/api";

export interface FavoriteProductDto {
    id: number;
    name: string;
    slug: string;
    price: number;
    categoryId: number;
    mainImageUrl?: string | null;
}

const baseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
        const token = localStorage.getItem("token");
        if (token) headers.set("Authorization", `Bearer ${token}`);
        return headers;
    },
});

export const favoritesApi = createApi({
    reducerPath: "favoritesApi",
    baseQuery,
    tagTypes: ["Favorites"],
    endpoints: (builder) => ({
        getFavorites: builder.query<FavoriteProductDto[], void>({
            query: () => "/favorites",
            providesTags: (result) =>
                result
                    ? [
                          ...result.map((p) => ({ type: "Favorites" as const, id: p.id })),
                          { type: "Favorites", id: "LIST" },
                      ]
                    : [{ type: "Favorites", id: "LIST" }],
        }),
        getFavoriteIds: builder.query<number[], void>({
            query: () => "/favorites/ids",
            providesTags: (result) =>
                result
                    ? [
                          ...result.map((id) => ({ type: "Favorites" as const, id })),
                          { type: "Favorites", id: "LIST" },
                      ]
                    : [{ type: "Favorites", id: "LIST" }],
        }),
        addFavorite: builder.mutation<{ added: boolean }, number>({
            query: (productId) => ({
                url: `/favorites/${productId}`,
                method: "POST",
            }),
            invalidatesTags: (_result, _err, productId) => [
                { type: "Favorites", id: productId },
                { type: "Favorites", id: "LIST" },
            ],
        }),
        removeFavorite: builder.mutation<{ removed: boolean }, number>({
            query: (productId) => ({
                url: `/favorites/${productId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _err, productId) => [
                { type: "Favorites", id: productId },
                { type: "Favorites", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetFavoritesQuery,
    useGetFavoriteIdsQuery,
    useAddFavoriteMutation,
    useRemoveFavoriteMutation,
} = favoritesApi;
