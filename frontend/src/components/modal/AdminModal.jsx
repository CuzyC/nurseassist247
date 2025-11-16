import { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function AdminModal({ open, onClose, admin, onSuccess }) {
  const isEdit = Boolean(admin);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "",
    status: "",
  });

  useEffect(() => {
    if (isEdit && admin) {
      setFormData({
        name: admin.name || "",
        username: admin.username || "",
        email: admin.email || "",
        password: "",
        role: admin.role || "",
        status: admin.status || "",
      });
    } else {
      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        role: "",
        status: "",
      });
    }
  }, [admin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const url = isEdit
      ? `http://127.0.0.1:5000/api/admin/update_user/${admin.id}`
      : "http://127.0.0.1:5000/api/admin/add_user";

    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isEdit ? "Failed to update admin" : "Failed to add admin")
        );
      }

      console.log(isEdit ? "Admin updated:" : "Admin added:", data);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the user details below."
                : "Fill in the details to add a new user."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Juan Dela Cruz"
                className="col-span-3"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Username */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="e.g., juandelacruz"
                className="col-span-3"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="e.g., juan@gmail.com"
                className="col-span-3"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password (only on add) */}
            {!isEdit && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  className="col-span-3"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {/* Role */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Owner">Owner</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="SDA Owner">SDA Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#D2138C] hover:bg-[#B01076] text-white"
              disabled={loading}
            >
              {loading
                ? isEdit
                  ? "Saving..."
                  : "Adding..."
                : isEdit
                ? "Save Changes"
                : "Add Admin"}
            </Button>
          </DialogFooter>

          {errorMsg && (
            <p className="text-red-500 text-sm mt-2 text-center">{errorMsg}</p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AdminModal;
