import { baseApi } from "../baseApi";

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchUsers: build.query<User[], { searchQuery: string }>({
      query: ({ searchQuery }) => {
        return {
          url: "/accounts/users",
          params: { q: searchQuery },
        };
      },
    }),
  }),
  overrideExisting: false,
});

export const { useFetchUsersQuery } = usersApi;
