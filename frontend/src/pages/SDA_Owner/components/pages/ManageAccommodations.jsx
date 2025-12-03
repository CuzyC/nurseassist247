import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

import {
  MapPin,
  Bed,
  Bath,
  Home,
  Users,
  User,
  Pencil,
  Trash2,
  Check,
  Plus,
} from "lucide-react";

import AccommodationModal from "@/components/modal/AccommodationModal";
import DeleteConfirmDialog from "@/components/modal/DeleteConfirmDialog";
import ViewAccommodationModal from "@/components/modal/ViewAccommodationModal";


function ManageAccommodations({ openAddFromDashboard, onAddHandled }) {
  const [accommodations, setAccommodations] = useState([]);
  const [filterStatus, setFilterStatus] = useState("Available");
  const [active, setActive] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // UX / modal state
  const [openModal, setOpenModal] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");

  // Fetch accommodations
  const fetchAccommodations = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const res = await fetch(
        `${API_URL}/api/sdaowner/get_accommodations`,
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
    setActive(accommodations[0])
  }, []);


  const kpis = useMemo(() => {
    const totalProperties = accommodations.length;

    // Define what counts as vacant vs occupied in your domain:
    const vacantUnits = accommodations.filter((a) => a.status === "Available").length;
    const occupiedUnits = accommodations.filter((a) => a.status === "Occupied").length;
    // occupancyRate computed as occupied / total (0..100)
    const occupancyRate =
      totalProperties === 0 ? 0 : Math.round((occupiedUnits / totalProperties) * 100);

    return {
      totalProperties,
      vacantUnits,
      occupiedUnits,
      occupancyRate,
    };
  }, [accommodations]);

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

  // status colors
  const statusColors = {
    Vacant: "bg-green-100 text-green-700",
    Occupied: "bg-red-100 text-red-700",
    Maintenance: "bg-yellow-100 text-yellow-700",
  };

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

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found for delete");
        return;
      }

      const res = await fetch(
        `${API_URL}/api/sdaowner/delete_accommodation/${selectedId}`,
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
    <div className="flex h-screen bg-gray-50 gap-8">
      {/* Sidebar */}
      <Card className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl text-gray-900">Property</h2>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-[#D2138C] text-white rounded-lg hover:bg-[#B01076] transition-colors"
              type="button"
              onClick={handleAddNew}
            >
              <Plus size={20} />
              Add property
            </button>
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white cursor-pointer"
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-0">
              {accommodations.map((p) => {
                const isSelected = active?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActive(p)}
                    aria-selected={isSelected}
                    className={`w-full text-left p-4 border-b border-gray-200 transition-colors flex items-start gap-3 ${
                      isSelected
                        ? "bg-pink-50 border-l-4 border-l-[#D2138C]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Home size={20} className="text-[#D2138C]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-gray-900 truncate">{p.title}</h3>
                        <span
                          className={`ml-2 text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                            statusColors[p.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{p.location}</p>
                      <p className="text-sm text-gray-600 truncate">{p.type}</p>
                      <p className="text-sm text-gray-900 mt-1">Capacity: {p.capacity}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </Card>

      {/* Right Column - MAIN (no outer padding to make it flush) */}
      <div className="flex-1">
        {/* Stats Bar — reduced padding to avoid large horizontal margin */}
        <div className="px-4 py-4 max-w-full">
          <div className="flex items-center gap-10">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Properties</p>
              <p className="text-3xl text-gray-900">{kpis.totalProperties}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Vacant Units</p>
              <p className="text-3xl text-gray-900">{kpis.vacantUnits}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Occupied Units</p>
              <p className="text-3xl text-gray-900">{kpis.occupiedUnits}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Occupancy Rate</p>
              <p className="text-3xl text-gray-900">{kpis.occupancyRate}%</p>
            </div>
          </div>
        </div>

        <Card className="flex flex-col">
          <CardHeader className="pb-4 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {!active ? (
                <div className="text-gray-500">No accommodation selected</div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl text-gray-900 truncate">{active.title}</h1>
                    <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                      {active.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin size={16} />
                    <span>{active.location}</span>
                  </div>

                  <div className="flex items-center gap-6 text-gray-700 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Bed size={18} />
                      <span>{active.bedrooms} beds</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath size={18} />
                      <span>{active.bathrooms} baths</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home size={18} />
                      <span>{active.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={18} />
                      <span>{active.gender}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={18} />
                      <span>Capacity: {active.capacity}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-start gap-2">
              <button
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Edit"
                type="button"
                onClick={() => handleEdit(active)}
                disabled={!active}
              >
                <Pencil size={20} className="text-gray-700" />
              </button>
              <button
                className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete"
                type="button"
                onClick={() => handleDeleteClick(active?.id)}
                disabled={!active}
              >
                <Trash2 size={20} className="text-gray-700" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="flex-1">
            {!active ? (
              <div className="text-center text-gray-500 py-20">
                Select an accommodation to view details
              </div>
            ) : (
              <div key={active.id}>
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-3">Property Description</h2>
                  <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {active.description}
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-3">Property Features</h2>
                  <div className="space-y-3">
                    {active.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check size={20} className="text-[#D2138C] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-3">Property Amenities</h2>
                  <div className="space-y-3">
                    {active.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check size={20} className="text-[#D2138C] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-3">Property Images</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {active.images.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-video rounded-xl overflow-hidden bg-gray-100"
                      >
                        <img
                          src={image}
                          alt={`${active.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AccommodationModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        accommodation={selectedAccommodation}
        onSuccess={fetchAccommodations}
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
