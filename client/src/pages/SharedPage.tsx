import FileCard from "@/components/file-card";
import Loader from "@/components/loader";
import { useFetchSharedFileListQuery } from "@/store/slices/fileSlice";

const SharedPage = () => {
  const { data: files, isLoading } = useFetchSharedFileListQuery();
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Shared With You</h2>
      {isLoading ? (
        <div className="flex flex-1 justify-center items-center h-full">
          <Loader />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files?.map((file) => (
            <FileCard
              key={file.id}
              file={{
                id: file.id,
                username: file.shared_by,
                filename: file.filename,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedPage;
