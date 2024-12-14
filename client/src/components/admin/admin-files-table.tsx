import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BASE_API_URL } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/store/hooks";
import {
  useDeleteFileAdminMutation,
  useFetchFilesAdminQuery,
} from "@/store/slices/adminSlice";
import dayjs from "dayjs";
import { MoreVertical } from "lucide-react";
import { useEffect } from "react";
import Loader from "../loader";

const AdminFilesTable = () => {
  const { toast } = useToast();
  const token = useAppSelector((store) => store.auth.token);
  const { data: files = [], isLoading } = useFetchFilesAdminQuery();
  const [deleteFile, deleteFileResult] = useDeleteFileAdminMutation();
  const handleDownload = async (fileId: number, filename: string) => {
    try {
      const response = await fetch(
        `${BASE_API_URL}/api/admin/files/download/${fileId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

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

  const handleDelete = async (fileId: number) => deleteFile({ fileId });

  useEffect(() => {
    const { isSuccess, isError } = deleteFileResult;
    if (isSuccess) {
      toast({
        variant: "default",
        title: "File deleted",
        description: "The file has been deleted successfully.",
      });
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
    <div className="w-full">
      {isLoading ? (
        <div className="flex justify-center items-center">
          <Loader />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Filename</TableHead>
              <TableHead>Uploaded Date</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell>{file.filename}</TableCell>
                <TableCell>
                  {dayjs(file.created_at).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell>{file.owner.username}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="w-9 h-9 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleDownload(file.id, file.filename)}
                      >
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(file.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AdminFilesTable;
