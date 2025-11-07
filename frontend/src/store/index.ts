import {configureStore} from "@reduxjs/toolkit";
import {apiAccount} from "../features/account/apiAccount.ts";

export const store = configureStore({
    reducer: {
        [apiAccount.reducerPath]: apiAccount.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiAccount.middleware),
});