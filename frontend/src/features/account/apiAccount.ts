import {createApi} from '@reduxjs/toolkit/query/react';
import {createBaseQuery} from "../../utils/createBaseQuery.ts";
import type {IGoogleLogin} from "./types/IGoogleLogin.ts";
import type {ILoginResult} from "./types/ILoginResult.ts";


export const apiAccount = createApi({
    reducerPath: "apiAccount",
    baseQuery: createBaseQuery("auth"),
    endpoints: (builder) => ({
        loginByGoogle: builder.mutation<ILoginResult[], IGoogleLogin>({
            query: (model) => ({
                url: 'googleLogin',
                method: 'POST',
                body: model
            })
        })
    }),
});

export const {useLoginByGoogleMutation} = apiAccount;