import AdminFilesTable from "@/components/admin/admin-files-table";
import AdminUsersTable from "@/components/admin/admin-users-table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const AdminPage = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="users">
          <AccordionTrigger>
            <span className="text-lg font-medium">Users</span>
          </AccordionTrigger>
          <AccordionContent>
            <AdminUsersTable />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="files">
          <AccordionTrigger>
            <span className="text-lg font-medium">Files</span>
          </AccordionTrigger>
          <AccordionContent>
            <AdminFilesTable />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default AdminPage;
