import {configureStore} from "@reduxjs/toolkit";
import {apiAccount} from "../features/account/apiAccount.ts";
import { categoryApi } from '../features/categories/api/categoryApi.ts';
import { productApi } from "../features/products/api/productApi";

export const store = configureStore({
    reducer: {
        [apiAccount.reducerPath]: apiAccount.reducer,
        [categoryApi.reducerPath]: categoryApi.reducer,
        [productApi.reducerPath]: productApi.reducer,
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(apiAccount.middleware)
            .concat(categoryApi.middleware)
            .concat(productApi.middleware),
});
