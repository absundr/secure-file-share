import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFetchUsersQuery, User } from "@/store/slices/userSlice";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: number;
  onShare: (fileId: number, username: string) => void;
}

const ShareModal = ({ isOpen, onClose, fileId, onShare }: ShareModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { data: users = [] } = useFetchUsersQuery(
    { searchQuery },
    {
      skip: !searchQuery,
    }
  );
  const handleShare = () => {
    if (selectedUser) {
      onShare(fileId, selectedUser.username);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
          <DialogDescription>
            Search for a user and select them to share the file.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="mt-4">
          {users.map((user) => (
            <div
              key={user.id}
              className={`p-2 border rounded my-1 cursor-pointer hover:bg-gray-100 ${
                selectedUser?.id === user.id ? "bg-gray-200" : ""
              }`}
              onClick={() => setSelectedUser(user)}
            >
              {user.username}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={handleShare} disabled={!selectedUser}>
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
