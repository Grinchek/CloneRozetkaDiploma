import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_BASE + '/api/Auth';

/** Response of GET /api/Auth/Me */
export interface MeResponse {
    isAuthenticated: boolean;
    name?: string;
    email?: string;
    avatarUrl?: string | null;
    role: string;
}

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
        /** GET /api/Auth/Me — returns: isAuthenticated, name, email, avatarUrl, role */
        me: builder.query<MeResponse, void>({
            query: () => ({ url: '/Me', method: 'GET' }),
            providesTags: ['User'],
        }),
        forgotPassword: builder.mutation<void, { email: string }>({
            query: (body) => ({ url: '/ForgotPassword', method: 'POST', body }),
        }),
        resetPassword: builder.mutation<void, { email: string; token: string; newPassword: string }>({
            query: (body) => ({ url: '/ResetPassword', method: 'POST', body }),
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useLoginByGoogleMutation,
    useMeQuery,
    useForgotPasswordMutation,
    useResetPasswordMutation,
} = apiAccount;
