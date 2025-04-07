import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
    baseQuery: fetchBaseQuery({baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL }),
    reducerPath: "api",
    tagTypes: [],
    endpoints: (build) => ({
        // Define your endpoints here when needed
        dummy: build.query({
            query: () => '/dummy',
        }),
    }),
});

// Export hooks for usage in components
export const { useDummyQuery } = api;