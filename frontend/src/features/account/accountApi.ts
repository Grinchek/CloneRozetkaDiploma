import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE = import.meta.env.VITE_API_BASE + '/api';

/** GET /api/account/me */
export interface UserProfileDto {
    email?: string | null;
    userName?: string | null;
    fullName?: string | null;
    phoneNumber?: string | null;
    avatarUrl?: string | null;
    isEmailConfirmed: boolean;
    createdAt?: string | null;
    role?: string | null;
}

/** PUT /api/account/profile */
export interface UpdateProfileRequest {
    fullName?: string | null;
    phoneNumber?: string | null;
}

const baseQuery = fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('token');
        if (token) headers.set('Authorization', `Bearer ${token}`);
        return headers;
    },
});

const baseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    if (result.error && result.error.status === 401) {
        localStorage.removeItem('token');
    }
    return result;
};

export const accountApi = createApi({
    reducerPath: 'accountApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Profile', 'User'],
    endpoints: (builder) => ({
        getProfile: builder.query<UserProfileDto, void>({
            query: () => ({ url: '/account/me', method: 'GET' }),
            providesTags: ['Profile'],
        }),
        updateProfile: builder.mutation<UserProfileDto, UpdateProfileRequest>({
            query: (body) => ({ url: '/account/profile', method: 'PUT', body }),
            invalidatesTags: ['Profile', 'User'],
        }),
        uploadAvatar: builder.mutation<{ avatarUrl: string }, FormData>({
            query: (body) => ({
                url: '/account/avatar',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Profile', 'User'],
        }),
        changePassword: builder.mutation<void, { currentPassword: string; newPassword: string }>({
            query: (body) => ({ url: '/account/change-password', method: 'POST', body }),
        }),
        resendConfirmation: builder.mutation<{ message?: string }, void>({
            query: () => ({ url: '/account/resend-confirmation', method: 'POST' }),
            invalidatesTags: ['Profile'],
        }),
    }),
});

export const {
    useGetProfileQuery,
    useUpdateProfileMutation,
    useUploadAvatarMutation,
    useChangePasswordMutation,
    useResendConfirmationMutation,
} = accountApi;
