/* eslint-disable @typescript-eslint/no-explicit-any */
import { useToast } from "@/hooks/use-toast";
import { useFileUploadMutation } from "@/store/slices/fileSlice";
import { useEffect } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";

interface FileUploadProps {
  onSuccess?: () => void;
}

const FileUpload = ({ onSuccess }: FileUploadProps) => {
  const { toast } = useToast();
  const [uploadFile, fileUploadResult] = useFileUploadMutation();
  const onDrop = async (acceptedFiles: FileWithPath[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      uploadFile(file);
    }
  };

  useEffect(() => {
    const { isSuccess, isError, error } = fileUploadResult;
    if (isSuccess) {
      toast({
        variant: "default",
        title: "File uploaded",
        description: "The file has been uploaded successfully.",
      });
      if (onSuccess) {
        onSuccess(); // Notify parent component about successful upload
      }
    } else if (isError) {
      const message = (error as any).message;
      toast({
        variant: "destructive",
        title: "Upload error",
        description: message,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUploadResult]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1, // Limit to a single file upload
  });

  return (
    <div
      {...getRootProps()}
      className="border-dashed border-2 p-4 cursor-pointer"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the file here ...</p>
      ) : (
        <p>Drag 'n' drop a file here, or click to select a file</p>
      )}
      {fileUploadResult.isLoading && <p className="mt-2">Uploading...</p>}
    </div>
  );
};

export default FileUpload;
