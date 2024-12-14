import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  useFetchRevokeFileListQuery,
  useRevokeFileMutation,
} from "@/store/slices/fileSlice";
import dayjs from "dayjs";
import { useEffect } from "react";

const RevokePage = () => {
  const { toast } = useToast();
  const { data: sharedFiles = [] } = useFetchRevokeFileListQuery();
  const [revokeAccess, revokeAccessResult] = useRevokeFileMutation();

  const handleRevoke = async (fileId: number, username: string) => {
    revokeAccess({
      file_id: fileId,
      shared_with_username: username,
    });
  };

  useEffect(() => {
    const { isSuccess, isError } = revokeAccessResult;
    if (isSuccess) {
      toast({
        variant: "default",
        title: "Access revoked.",
        description: "Access to the file has been revoked.",
      });
    } else if (isError) {
      toast({
        variant: "destructive",
        title: "Error revoking access.",
        description: "There was an error revoking access to the file.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revokeAccessResult]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Revoke Shared File Access</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Filename</TableHead>
            <TableHead>Shared With</TableHead>
            <TableHead>Shared On</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sharedFiles.map((share) => (
            <TableRow key={share.id}>
              <TableCell>{share.filename}</TableCell>
              <TableCell>{share.shared_with}</TableCell>
              <TableCell>
                {dayjs(share.shared_at).format("DD/MM/YYYY")}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRevoke(share.id, share.shared_with)}
                >
                  Revoke
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RevokePage;
