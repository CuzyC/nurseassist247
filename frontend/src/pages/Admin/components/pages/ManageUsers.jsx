import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import AdminModal from "@/components/modal/AdminModal";
import DeleteConfirmDialog from "@/components/modal/DeleteConfirmDialog";

function ManageUsers() {
  const [admin, setAdmin] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Filter accommodation with search bar
  const filteredAdmins = admin.filter((acc) => {
    const term = searchTerm.toLowerCase();
    return (
      acc.name.toLowerCase().includes(term) ||
      acc.username.toLowerCase().includes(term) ||
      acc.role.toLowerCase().includes(term) ||
      acc.status.toLowerCase().includes(term)
    );
  });

  // Fetch accommodation
  const fetchAdmins = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/admin/get_users",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch admins");

      const data = await response.json();
      setAdmin(data.users || []);
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Add new admin
  const handleAddNew = () => {
    setSelectedAdmin(null);
    setOpenModal(true);
  };

  // Edit admin
  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setOpenModal(true);
  };

  // Delete admin
  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setOpenDeleteDialog(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    try {
      // const response = await fetch(`http://127.0.0.1:5000/api/admin/delete_admin/${selectedId}`, {
      //     method: "DELETE",
      //     headers: { "Content-Type": "application/json" },
      // });

      // if (!response.ok) throw new Error("Failed to delete admin");

      // await fetchAdmins(); //refresh list

      console.log("test");
    } catch (error) {
      console.error("Error deleting admin:", error);
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Add section */}
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search admins..."
                className="px-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              onClick={handleAddNew}
              className="bg-[#D2138C] hover:bg-[#B01076] rounded-lg text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-center text-black">Name</TableHead>
                  <TableHead className="text-center text-black">
                    Username
                  </TableHead>
                  <TableHead className="text-center text-black">
                    Email
                  </TableHead>
                  <TableHead className="text-center text-black">Role</TableHead>
                  <TableHead className="text-center text-black">
                    Status
                  </TableHead>
                  <TableHead className="text-center text-black">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan="8"
                      className="text-center text-gray-500 py-8"
                    >
                      No admins found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmins.map((acc) => (
                    <TableRow
                      key={acc.id}
                      className="text-center text-gray-600"
                    >
                      {/* ID */}
                      <TableCell>{acc.name}</TableCell>
                      <TableCell>{acc.username}</TableCell>
                      <TableCell>{acc.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            acc.role === "Owner"
                              ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                              : acc.role === "Admin"
                              ? "bg-[#D2138C]/10 text-[#D2138C] hover:bg-[#D2138C]/20"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          }
                        >
                          {acc.role}
                        </Badge>
                      </TableCell>
                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant="default"
                          className={
                            acc.status === "Active"
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }
                        >
                          {acc.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(acc)}
                            className="text-gray-600 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteClick(acc.id)}
                            className="text-red-600 hover:text-red-800 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {/* Add or edit admin */}
      <AdminModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        admin={selectedAdmin}
        onSuccess={fetchAdmins}
      />

      {/* Delete Confirm */}
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Admin"
        description="Are you sure you want to delete this admin user? This action cannot be undone."
      />
    </div>
  );
}

export default ManageUsers;
