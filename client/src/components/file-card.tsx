import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BASE_API_URL } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/store/hooks";
import { FileItem, useFileDeleteMutation } from "@/store/slices/fileSlice";
import { Download, MoreVertical, Share2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import ShareModal from "./share-modal";
import { Button } from "./ui/button";

interface FileCardProps {
  file: FileItem;
  onShare?: (fileId: number, username: string) => void;
  onFileDeleted?: () => void;
}

const FileCard = ({ file, onShare, onFileDeleted }: FileCardProps) => {
  const { toast } = useToast();
  const token = useAppSelector((store) => store.auth.token);
  const [showShareModal, setShowShareModal] = useState(false);
  const [deleteFile, deleteFileResult] = useFileDeleteMutation();
  const handleDownload = async () => {
    try {
      const response = await fetch(
        `${BASE_API_URL}/api/files/download/${file.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("content-disposition");
      let filename = "downloaded-file";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      toast({
        variant: "destructive",
        title: "Error downloading file.",
        description: "There was an error downloading the file.",
      });
    }
  };

  const handleDelete = () => deleteFile({ fileId: file.id });

  useEffect(() => {
    const { isSuccess, isError } = deleteFileResult;
    if (isSuccess) {
      toast({
        variant: "default",
        title: "File deleted",
        description: "The file has been deleted successfully.",
      });
      if (onFileDeleted) onFileDeleted();
    } else if (isError) {
      toast({
        variant: "destructive",
        title: "Error deleting file.",
        description: "There was an error deleting the file.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteFileResult]);

  return (
    <div className="border rounded-lg p-4 shadow-md">
      <div className="flex items-center justify-between">
        {/* Placeholder for file icon */}
        <div className="w-10 h-10 bg-gray-300 rounded-md flex items-center justify-center">
          <FileIcon extension={file.filename.split(".").pop()} />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-8 h-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download
            </DropdownMenuItem>
            {onShare && (
              <DropdownMenuItem onClick={() => setShowShareModal(true)}>
                <Share2 className="mr-2 h-4 w-4" /> Share
              </DropdownMenuItem>
            )}
            {onFileDeleted && (
              <DropdownMenuItem onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold break-words">{file.filename}</h3>
        <p className="text-sm text-gray-500">By: {file.username}</p>
      </div>
      {onShare && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          fileId={file.id}
          onShare={onShare}
        />
      )}
    </div>
  );
};

const FileIcon = ({ extension }: { extension: string | undefined }) => {
  const iconMap: Record<string, React.ReactNode> = {
    pdf: <FileTextIcon color="red" />,
    doc: <FileTextIcon color="blue" />,
    docx: <FileTextIcon color="blue" />,
    xls: <FileTextIcon color="green" />,
    xlsx: <FileTextIcon color="green" />,
    ppt: <FileTextIcon color="orange" />,
    pptx: <FileTextIcon color="orange" />,
    txt: <FileTextIcon color="gray" />,
    zip: <FileZipIcon color="brown" />,
    rar: <FileZipIcon color="brown" />,
    jpg: <FileImageIcon color="purple" />,
    jpeg: <FileImageIcon color="purple" />,
    png: <FileImageIcon color="purple" />,
    gif: <FileImageIcon color="purple" />,
  };

  return (
    iconMap[extension?.toLowerCase() || ""] || <FileTextIcon color="gray" />
  );
};

const FileTextIcon = ({ color }: { color: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>
);

const FileZipIcon = ({ color }: { color: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <path d="M12 18v-6"></path>
    <path d="M10 16h4"></path>
    <path d="M8 12H6a2 2 0 0 0-2 2v4"></path>
    <path d="M16 12h2a2 2 0 0 1 2 2v4"></path>
  </svg>
);

const FileImageIcon = ({ color }: { color: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

export default FileCard;
