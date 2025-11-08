import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_BASE + '/api/Auth';

export const apiAccount = createApi({
    reducerPath: 'apiAccount',
    baseQuery: fetchBaseQuery({
        baseUrl: API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) headers.set('Authorization', `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ['User'], // ✅ ось це потрібно
    endpoints: (builder) => ({
        login: builder.mutation<{ token: string }, { userNameOrEmail: string; password: string }>({
            query: (body) => ({ url: '/Login', method: 'POST', body }),
            invalidatesTags: ['User'],
        }),
        register: builder.mutation<{ token: string }, { userName: string; email: string; fullName: string; password: string }>({
            query: (body) => ({ url: '/Register', method: 'POST', body }),
            invalidatesTags: ['User'],
        }),
        loginByGoogle: builder.mutation<{ token: string }, { token: string }>({
            query: (body) => ({ url: '/GoogleLogin', method: 'POST', body }),
            invalidatesTags: ['User'],
        }),
        me: builder.query<
            { isAuthenticated: boolean; name?: string; email?: string; avatarUrl?: string },
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
