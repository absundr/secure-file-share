import { baseApi } from "../baseApi";

export interface UpdateUserRole {
  role: "guest" | "user" | "admin";
}

export interface UploadedFile {
  id: number;
  filename: string;
  owner: {
    username: string;
  };
  created_at: string;
}

export interface AppUser {
  id: number;
  username: string;
  email: string;
  role: {
    id: number;
    name: string;
    description: string;
  };
}

const adminApiWithTag = baseApi.enhanceEndpoints({
  addTagTypes: ["Files", "Users"],
});
const adminApi = adminApiWithTag.injectEndpoints({
  endpoints: (build) => ({
    fetchUsersAdmin: build.query<AppUser[], void>({
      query: () => "/admin/users",
      providesTags: ["Users"],
    }),
    updateUserRole: build.mutation<
      UpdateUserRole,
      { userId: number; body: UpdateUserRole }
    >({
      query: ({ userId, body }) => ({
        url: `/admin/users/${userId}/`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Users"],
    }),
    fetchFilesAdmin: build.query<UploadedFile[], void>({
      query: () => "/admin/files",
      providesTags: ["Files"],
    }),
    deleteFileAdmin: build.mutation<void, { fileId: number }>({
      query: ({ fileId }) => ({
        url: `/admin/files/delete/${fileId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Files"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useDeleteFileAdminMutation,
  useFetchFilesAdminQuery,
  useFetchUsersAdminQuery,
  useUpdateUserRoleMutation,
} = adminApi;
