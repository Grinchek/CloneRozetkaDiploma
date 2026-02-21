import { configureStore } from "@reduxjs/toolkit";
import { apiAccount } from "../features/account/apiAccount.ts";
import { categoryApi } from '../features/categories/api/categoryApi.ts';
import { productApi } from "../features/products/api/productApi";
import { ordersApi } from "../features/orders/api/ordersApi";
import { shippingApi } from "../features/shipping/api/shippingApi";
import cartReducer from "./cartSlice";

export const store = configureStore({
    reducer: {
        [apiAccount.reducerPath]: apiAccount.reducer,
        [categoryApi.reducerPath]: categoryApi.reducer,
        [productApi.reducerPath]: productApi.reducer,
        [ordersApi.reducerPath]: ordersApi.reducer,
        [shippingApi.reducerPath]: shippingApi.reducer,
        cart: cartReducer,
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(apiAccount.middleware)
            .concat(categoryApi.middleware)
            .concat(productApi.middleware)
            .concat(ordersApi.middleware)
            .concat(shippingApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
