import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useFetchUsersAdminQuery,
  useUpdateUserRoleMutation,
} from "@/store/slices/adminSlice";
import { useEffect } from "react";

const AdminUsersTable = () => {
  const { toast } = useToast();
  const { data: users = [] } = useFetchUsersAdminQuery();
  const [updateUser, updateUserResult] = useUpdateUserRoleMutation();
  const handleRoleChange = async (
    userId: number,
    newRole: "guest" | "user" | "admin"
  ) =>
    updateUser({
      userId,
      body: {
        role: newRole,
      },
    });

  useEffect(() => {
    const { isSuccess, isError } = updateUserResult;
    if (isSuccess) {
      toast({
        variant: "default",
        title: "User role updated.",
        description: "The user's role has been updated successfully.",
      });
    } else if (isError) {
      toast({
        variant: "destructive",
        title: "Error updating role.",
        description: "There was an error updating the user's role.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateUserResult]);

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role.name}</TableCell>
              <TableCell>
                <Select
                  value={user.role.name}
                  onValueChange={(value: "guest" | "user" | "admin") =>
                    handleRoleChange(user.id, value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminUsersTable;
