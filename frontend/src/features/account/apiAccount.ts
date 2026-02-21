import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_BASE + '/api/Auth';

const baseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('token');
        if (token) headers.set('Authorization', `Bearer ${token}`);
        return headers;
    },
});

const baseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        // Optional: you could also redirect to /login here or trigger some logout action
        // window.location.href = '/login'; 
    }
    return result;
};

export const apiAccount = createApi({
    reducerPath: 'apiAccount',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['User'], // ✅ ось це потрібно
    endpoints: (builder) => ({
        login: builder.mutation<{ token: string }, { userNameOrEmail: string; password: string }>({
            query: (body) => ({ url: '/Login', method: 'POST', body }),
            invalidatesTags: ['User'],
        }),
        register: builder.mutation<Response, FormData>({
            query: (body) => ({
                url: "/Register",
                method: "POST",
                body,
            }),
            invalidatesTags: ['User'],
        }),

        loginByGoogle: builder.mutation<{ token: string }, { token: string }>({
            query: (body) => ({ url: '/GoogleLogin', method: 'POST', body }),
            invalidatesTags: ['User'],
        }),
        me: builder.query<
            {
                isAuthenticated: boolean;
                name?: string;
                email?: string;
                avatarUrl?: string;
                role: string;
                createdAt?: string;
                isEmailVarified?: boolean;
                googleId?: string;
            },
            void
        >({
            query: () => ({ url: '/Me', method: 'GET' }),
            providesTags: ['User'],
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useLoginByGoogleMutation,
    useMeQuery,
} = apiAccount;
