import { FileWithPath } from "react-dropzone";
import { baseApi } from "../baseApi";

export interface FileItem {
  id: number;
  filename: string;
  username: string;
}

export interface SharedFileItem {
  id: number;
  filename: string;
  shared_by: string;
  shared_at: string;
}

export interface SharedFile {
  file_id: number;
  shared_with_username: string;
}

export interface SharedFileResponse {
  message: string;
  shared_with: string;
}

export interface FileUploadResponse {
  file_id: number;
  filename: string;
  message: string;
}

export interface RevokeFileItem {
  id: number;
  filename: string;
  shared_by: string;
  shared_with: string;
  shared_at: string;
}

const filesApiWithTag = baseApi.enhanceEndpoints({
  addTagTypes: ["Files", "Revoke"],
});
const filesApi = filesApiWithTag.injectEndpoints({
  endpoints: (build) => ({
    fetchFileList: build.query<FileItem[], void>({
      query: () => "/files",
      providesTags: ["Files"],
    }),
    shareFile: build.mutation<SharedFileResponse, SharedFile>({
      query: (sharedFile) => ({
        url: "/files/share",
        method: "POST",
        body: sharedFile,
      }),
      invalidatesTags: ["Revoke"],
    }),
    fetchRevokeFileList: build.query<RevokeFileItem[], void>({
      query: () => "/files/revoke",
      providesTags: ["Revoke"],
    }),
    revokeFile: build.mutation<SharedFileResponse, SharedFile>({
      query: (sharedFile) => ({
        url: "/files/share/revoke",
        method: "POST",
        body: sharedFile,
      }),
      invalidatesTags: ["Revoke"],
    }),
    fetchSharedFileList: build.query<SharedFileItem[], void>({
      query: () => "/files/shared",
    }),
    fileUpload: build.mutation<FileUploadResponse, FileWithPath>({
      query: (fileData) => {
        const formData = new FormData();
        formData.append("file", fileData);
        return {
          url: "/files/upload",
          method: "POST",
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ["Files"],
    }),
    fileDelete: build.mutation<{ message: string }, { fileId: number }>({
      query: ({ fileId }) => {
        return {
          url: `/files/delete/${fileId}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Files", "Revoke"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useFetchFileListQuery,
  useFetchSharedFileListQuery,
  useShareFileMutation,
  useRevokeFileMutation,
  useFileUploadMutation,
  useFileDeleteMutation,
  useFetchRevokeFileListQuery,
} = filesApi;
