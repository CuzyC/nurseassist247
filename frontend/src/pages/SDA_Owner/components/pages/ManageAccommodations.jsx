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
import { Plus, Edit, Trash2, Eye, Search, ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import AccommodationModal from "@/components/modal/AccommodationModal";
import DeleteConfirmDialog from "@/components/modal/DeleteConfirmDialog";
import ViewAccommodationModal from "@/components/modal/ViewAccommodationModal";

function ManageAccommodations({ openAddFromDashboard, onAddHandled }) {
  const [accommodations, setAccommodations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [viewAccommodation, setViewAccommodation] = useState(null);

  // Fetch accommodations
  const fetchAccommodations = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const res = await fetch(
        "http://localhost:5000/api/sdaowner/get_accommodations",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      console.log("GET /get_accommodations:", res.status, data);

      if (res.ok) {
        setAccommodations(data.accommodations || []);
      } else {
        console.error(
          "Error fetching accommodations:",
          data.message || data.msg || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Failed to fetch accommodations:", error);
    }
  };

  useEffect(() => {
    fetchAccommodations();
  }, []);

  // open the Add Accommodation modal when navigated from dashboard
  useEffect(() => {
    if (openAddFromDashboard) {
      // ensure it's in "add" mode
      setSelectedAccommodation(null);
      setOpenModal(true);

      // tell the portal we've handled it so it doesn't reopen on every render
      if (onAddHandled) {
        onAddHandled();
      }
    }
  }, [openAddFromDashboard, onAddHandled]);

  // Filter accommodations
  const filteredAccommodations = accommodations.filter((acc) => {
    const search = searchTerm.toLowerCase();
    return (
      acc.title?.toLowerCase().includes(search) ||
      acc.location?.toLowerCase().includes(search) ||
      acc.accommodationType?.toLowerCase().includes(search) ||
      acc.status?.toLowerCase().includes(search)
    );
  });

  // Handlers
  const handleAddNew = () => {
    setSelectedAccommodation(null);
    setOpenModal(true);
  };

  const handleEdit = (accommodation) => {
    setSelectedAccommodation(accommodation);
    setOpenModal(true);
  };

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setOpenDeleteDialog(true);
  };

  const handleView = (accommodation) => {
    setViewAccommodation(accommodation);
    setOpenViewModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found for delete");
        return;
      }

      const res = await fetch(
        `http://localhost:5000/api/sdaowner/delete_accommodation/${selectedId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setAccommodations((prev) =>
          prev.filter((acc) => acc.id !== selectedId)
        );
      } else {
        console.error(
          "Delete failed:",
          data.message || data.msg || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error deleting accommodation:", error);
    } finally {
      setOpenDeleteDialog(false);
      setSelectedId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Add */}
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search accommodations..."
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
              Add Accommodation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>All Accommodations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-center text-black">#</TableHead>
                  <TableHead className="text-center text-black">
                    Title
                  </TableHead>
                  <TableHead className="text-center text-black">
                    Location
                  </TableHead>
                  <TableHead className="text-center text-black">
                    Capacity
                  </TableHead>
                  <TableHead className="text-center text-black">
                    Description
                  </TableHead>
                  <TableHead className="text-center text-black">Type</TableHead>
                  <TableHead className="text-center text-black">
                    Bedrooms
                  </TableHead>
                  <TableHead className="text-center text-black">
                    Bathrooms
                  </TableHead>
                  <TableHead className="text-center text-black">
                    Gender
                  </TableHead>
                  <TableHead className="text-center text-black">
                    Features
                  </TableHead>
                  <TableHead className="text-center text-black">
                    Amenities
                  </TableHead>
                  <TableHead className="text-center text-black">
                    Images
                  </TableHead>
                  <TableHead className="text-center text-black">
                    Status
                  </TableHead>
                  <TableHead className="text-center text-black">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredAccommodations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={15}
                      className="text-center text-gray-500 py-8"
                    >
                      No accommodations found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAccommodations.map((acc, index) => {
                    const isVacant = acc.status === "Vacant";
                    return (
                      <TableRow key={acc.id} className="text-gray-600">
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="min-w-[200px]">
                          {acc.title}
                        </TableCell>
                        <TableCell className="min-w-[180px]">
                          {acc.location}
                        </TableCell>
                        <TableCell>{acc.capacity}</TableCell>
                        <TableCell className="min-w-[250px] max-w-[300px]">
                          <div className="line-clamp-2">{acc.description}</div>
                        </TableCell>
                        <TableCell>{acc.accommodationType}</TableCell>
                        <TableCell>{acc.bedrooms}</TableCell>
                        <TableCell>{acc.bathrooms}</TableCell>
                        <TableCell>{acc.gender}</TableCell>

                        {/* Features */}
                        <TableCell className="min-w-[200px]">
                          <div className="flex flex-wrap gap-1">
                            {(acc.features || [])
                              .slice(0, 2)
                              .map((feature, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {feature}
                                </Badge>
                              ))}
                            {(acc.features?.length || 0) > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{acc.features.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Amenities */}
                        <TableCell className="min-w-[200px]">
                          <div className="flex flex-wrap gap-1">
                            {(acc.amenities || [])
                              .slice(0, 2)
                              .map((amenity, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {amenity}
                                </Badge>
                              ))}
                            {(acc.amenities?.length || 0) > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{acc.amenities.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Images */}
                        <TableCell>
                          <div className="flex items-center gap-1 text-gray-600">
                            <ImageIcon className="h-4 w-4" />
                            <span>{acc.images?.length || 0}</span>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge
                            variant={isVacant ? "default" : "secondary"}
                            className={
                              isVacant
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-red-100 text-red-700 hover:bg-red-200"
                            }
                          >
                            {isVacant ? "Vacant" : "Occupied"}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleView(acc)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(acc)}
                              className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteClick(acc.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AccommodationModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        accommodation={selectedAccommodation}
        onSuccess={fetchAccommodations}
      />

      <ViewAccommodationModal
        open={openViewModal}
        onOpenChange={setOpenViewModal}
        accommodation={viewAccommodation || {}}
      />

      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Accommodation"
        description="Are you sure you want to delete this accommodation? This action cannot be undone."
      />
    </div>
  );
}

export default ManageAccommodations;
