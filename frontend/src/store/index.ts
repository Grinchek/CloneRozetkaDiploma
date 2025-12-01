import {configureStore} from "@reduxjs/toolkit";
import {apiAccount} from "../features/account/apiAccount.ts";
import { categoryApi } from '../features/categories/api/categoryApi.ts';

export const store = configureStore({
    reducer: {
        [apiAccount.reducerPath]: apiAccount.reducer,
        [categoryApi.reducerPath]: categoryApi.reducer,
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiAccount.middleware)
            .concat(categoryApi.middleware),
});