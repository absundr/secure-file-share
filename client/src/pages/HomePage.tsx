import FileCard from "@/components/file-card";
import FileUpload from "@/components/file-upload";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useFetchFileListQuery,
  useShareFileMutation,
} from "@/store/slices/fileSlice";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";

const HomePage = () => {
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const { data: files = [], isLoading } = useFetchFileListQuery();
  const [shareFile, shareFileResult] = useShareFileMutation();
  const handleUploadSuccess = () => setUploadDialogOpen(false);
  const handleShareFile = (fileId: number, username: string) => {
    shareFile({
      file_id: fileId,
      shared_with_username: username,
    });
  };
  useEffect(() => {
    const { isSuccess, isError, error, data } = shareFileResult;
    if (isSuccess) {
      toast({
        variant: "default",
        title: "File shared",
        description: `The file has been shared with ${data.shared_with}`,
      });
    } else if (isError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = (error as any).message;
      toast({
        variant: "destructive",
        title: "Sharing error",
        description: message,
      });
    }
  }, [shareFileResult, toast]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Files</h2>
        <Dialog
          open={uploadDialogOpen}
          onOpenChange={() => setUploadDialogOpen((v) => !v)}
        >
          <DialogTrigger asChild>
            <Button>Upload File</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
              <DialogDescription>Select a file to upload.</DialogDescription>
            </DialogHeader>
            <FileUpload onSuccess={handleUploadSuccess} />
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <div className="flex flex-1 justify-center items-center h-full">
          <Loader />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onShare={handleShareFile}
              onFileDeleted={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
