// frontend/src/pages/Admin/dashboard_components/pages/ManageAccommodations.jsx
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
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

const API_BASE = "http://localhost:5000";

// ensure image URLs are absolute
const fullImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url}`;
};

const typeOptions = ["House", "Villa", "Group Home", "Apartment"];

const configOptions = {
  House: ["2 Rooms, 2 Toilets", "3 Rooms, 3 Toilets"],
  Villa: ["1 Room, 1 Toilet", "2 Rooms, 2 Toilets", "3 Rooms, 3 Toilets"],
  "Group Home": ["4 Rooms, 4 Toilets", "5 Rooms, 5 Toilets"],
  Apartment: [
    "1 Bedroom, 1 Toilet",
    "2 Bedrooms, 2 Toilets",
    "3 Bedrooms, 3 Toilets",
  ],
};

const genderOptions = ["Any", "Men", "Women", "Men & Women"];

const sdaCategories = [
  "High Physical Support",
  "Robust",
  "Fully Accessible",
  "Improved Liveability",
];

const emptyForm = {
  acc_type: "House",
  configuration: "",
  suburb: "",
  status: "Vacant",
  description: "",
  title: "",
  address: "",
  beds: "",
  baths: "",
  max_participants: "",
  gender: "Any",
  sda_category: "",
};

function ManageAccommodations() {
  const [accommodations, setAccommodations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [activeImages, setActiveImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [toDelete, setToDelete] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState({ ...emptyForm, id: null });

  const [addImages, setAddImages] = useState([]);
  const [editImages, setEditImages] = useState([]);

  // ----------------- FETCH -----------------
  useEffect(() => {
    fetchAccommodations();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(
      accommodations.filter((a) => {
        const details = `${a.acc_type || ""} ${a.configuration || ""} ${
          a.suburb || ""
        } ${a.status || ""} ${a.title || ""} ${a.address || ""} ${
          a.sda_category || ""
        }`;
        return details.toLowerCase().includes(term);
      })
    );
  }, [search, accommodations]);

  const fetchAccommodations = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/accommodations`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        const normalised = data.map((a) => ({
          ...a,
          image_urls: Array.isArray(a.image_urls) ? a.image_urls : [],
        }));
        setAccommodations(normalised);
        setFiltered(normalised);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------- HELPERS -----------------
  const buildFormData = (state, images) => {
    const fd = new FormData();
    fd.append("acc_type", state.acc_type);
    fd.append("configuration", state.configuration);
    fd.append("suburb", state.suburb);
    fd.append("status", state.status);
    fd.append("description", state.description);

    fd.append("title", state.title);
    fd.append("address", state.address);
    fd.append("beds", state.beds);
    fd.append("baths", state.baths);
    fd.append("max_participants", state.max_participants);
    fd.append("gender", state.gender);
    fd.append("sda_category", state.sda_category);

    images.forEach((file) => {
      fd.append("images", file);
    });

    return fd;
  };

  // ----------------- ADD -----------------
  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      let res;
      if (addImages.length > 0) {
        const fd = buildFormData(form, addImages);
        res = await fetch(`${API_BASE}/api/accommodations`, {
          method: "POST",
          credentials: "include",
          body: fd,
        });
      } else {
        res = await fetch(`${API_BASE}/api/accommodations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...form,
            beds: form.beds || null,
            baths: form.baths || null,
            max_participants: form.max_participants || null,
            image_urls: [],
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to add accommodation");
        return;
      }

      setShowAdd(false);
      setForm(emptyForm);
      setAddImages([]);
      fetchAccommodations();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  // ----------------- EDIT -----------------
  const openEdit = (acc) => {
    setEditForm({
      id: acc.id,
      acc_type: acc.acc_type || "House",
      configuration: acc.configuration || "",
      suburb: acc.suburb || "",
      status: acc.status || "Vacant",
      description: acc.description || "",
      title: acc.title || "",
      address: acc.address || "",
      beds: acc.beds ?? "",
      baths: acc.baths ?? "",
      max_participants: acc.max_participants ?? "",
      gender: acc.gender || "Any",
      sda_category: acc.sda_category || "",
    });
    setEditImages([]);
    setShowEdit(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editForm.id) return;

    try {
      let res;
      if (editImages.length > 0) {
        const fd = buildFormData(editForm, editImages);
        res = await fetch(`${API_BASE}/api/accommodations/${editForm.id}`, {
          method: "PUT",
          credentials: "include",
          body: fd,
        });
      } else {
        res = await fetch(`${API_BASE}/api/accommodations/${editForm.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...editForm,
            beds: editForm.beds || null,
            baths: editForm.baths || null,
            max_participants: editForm.max_participants || null,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to update accommodation");
        return;
      }

      setShowEdit(false);
      setEditImages([]);
      fetchAccommodations();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  // ----------------- DELETE -----------------
  const confirmDelete = (acc) => {
    setToDelete(acc);
    setShowDelete(true);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      const res = await fetch(`${API_BASE}/api/accommodations/${toDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to delete");
        return;
      }
      setShowDelete(false);
      setToDelete(null);
      fetchAccommodations();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  // ----------------- IMAGE MODAL -----------------
  const openImagesModal = (acc) => {
    const imgs = Array.isArray(acc.image_urls) ? acc.image_urls : [];
    if (!imgs.length) return;
    setActiveImages(imgs);
    setActiveImageIndex(0);
    setShowImagesModal(true);
  };

  const prevImage = () => {
    setActiveImageIndex((idx) =>
      idx === 0 ? activeImages.length - 1 : idx - 1
    );
  };

  const nextImage = () => {
    setActiveImageIndex((idx) =>
      idx === activeImages.length - 1 ? 0 : idx + 1
    );
  };

  // ----------------- RENDER -----------------
  return (
    <div className="space-y-6">
      {/* Search + Add */}
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search accommodations..."
                className="px-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              onClick={() => {
                setForm(emptyForm);
                setAddImages([]);
                setShowAdd(true);
              }}
              className="bg-[#D2138C] hover:bg-[#B01076] rounded text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Accommodation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>All Accommodations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 text-center text-sm">
                  <TableHead className="px-6 py-3 w-10">#</TableHead>
                  <TableHead className="px-6 py-3 w-24">Type</TableHead>
                  <TableHead className="px-6 py-3 w-40">Title</TableHead>
                  <TableHead className="px-6 py-3 w-40">
                    Configuration
                  </TableHead>
                  <TableHead className="px-6 py-3 w-40">Suburb</TableHead>
                  <TableHead className="px-6 py-3 max-w-[220px]">
                    Description
                  </TableHead>
                  <TableHead className="px-6 py-3 max-w-[220px]">
                    Details
                  </TableHead>
                  <TableHead className="px-6 py-3 w-40">Category</TableHead>
                  <TableHead className="px-6 py-3 w-32">Image</TableHead>
                  <TableHead className="px-6 py-3 w-32">
                    Vacant Status
                  </TableHead>
                  <TableHead className="px-6 py-3 w-40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-6">
                      No accommodations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((acc, index) => {
                    const imgArr = acc.image_urls || [];
                    const hasImage = imgArr.length > 0;
                    const detailParts = [];
                    if (acc.beds) detailParts.push(`${acc.beds} Bed`);
                    if (acc.baths) detailParts.push(`${acc.baths} Bath`);
                    if (acc.max_participants)
                      detailParts.push(`${acc.max_participants} people`);
                    if (acc.gender && acc.gender !== "Any")
                      detailParts.push(acc.gender);
                    const detailText =
                      detailParts.length > 0 ? detailParts.join(", ") : "-";

                    const thumbUrl = hasImage ? fullImageUrl(imgArr[0]) : "";

                    return (
                      <TableRow
                        key={acc.id}
                        className="text-gray-600 text-sm h-16"
                      >
                        <TableCell className="px-6 py-4 text-center font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {acc.acc_type}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          {acc.title || "-"}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          {acc.configuration}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          {acc.suburb}
                        </TableCell>
                        <TableCell className="px-6 py-4 max-w-[220px] truncate">
                          {acc.description || "-"}
                        </TableCell>
                        <TableCell className="px-6 py-4 max-w-[220px] truncate">
                          {detailText}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {acc.sda_category ? (
                            <span className="inline-flex px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-medium whitespace-nowrap">
                              {acc.sda_category}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {hasImage ? (
                            <button
                              type="button"
                              onClick={() => openImagesModal(acc)}
                              className="block"
                            >
                              <img
                                src={thumbUrl}
                                alt="Accommodation thumbnail"
                                className="h-12 w-20 object-cover rounded border"
                              />
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">
                              No image
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              acc.status === "Vacant"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {acc.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEdit(acc)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => confirmDelete(acc)}
                              className="bg-[#D2138C] hover:bg-[#B01076] text-white"
                            >
                              Delete
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

      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b">
              <h3 className="text-lg font-semibold">Add Accommodation</h3>
            </div>
            <form onSubmit={handleAdd} className="px-6 py-5 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={form.acc_type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      acc_type: e.target.value,
                      configuration: "",
                    }))
                  }
                  className="w-full rounded border border-gray-200 px-3 py-2"
                >
                  {typeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Configuration */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Configuration
                </label>
                <select
                  value={form.configuration}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      configuration: e.target.value,
                    }))
                  }
                  className="w-full rounded border border-gray-200 px-3 py-2"
                >
                  <option value="">Select configuration...</option>
                  {(configOptions[form.acc_type] || []).map((conf) => (
                    <option key={conf} value={conf}>
                      {conf}
                    </option>
                  ))}
                </select>
              </div>

              {/* Suburb */}
              <div>
                <label className="block text-sm font-medium mb-1">Suburb</label>
                <Input
                  value={form.suburb}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, suburb: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Property Title
                </label>
                <Input
                  placeholder="e.g. Tranquil Loop Baldivis"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Address
                </label>
                <Input
                  placeholder="e.g. 38 Tranquil Loop, Baldivis"
                  value={form.address}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Short description of the accommodation..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full rounded border border-gray-200 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
              </div>

              {/* Beds / Baths / People */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Beds</label>
                  <Input
                    type="number"
                    min="0"
                    value={form.beds}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, beds: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Baths
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={form.baths}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, baths: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    People
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={form.max_participants}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        max_participants: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Gender + SDA Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, gender: e.target.value }))
                    }
                    className="w-full rounded border border-gray-200 px-3 py-2"
                  >
                    {genderOptions.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    SDA Category
                  </label>
                  <select
                    value={form.sda_category}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        sda_category: e.target.value,
                      }))
                    }
                    className="w-full rounded border border-gray-200 px-3 py-2"
                  >
                    <option value="">Select category...</option>
                    {sdaCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Accommodation Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    setAddImages(Array.from(e.target.files || []))
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can select multiple images.
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Vacant Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full rounded border border-gray-200 px-3 py-2"
                >
                  <option value="Vacant">Vacant</option>
                  <option value="Occupied">Occupied</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2 pb-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAdd(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#D2138C] hover:bg-[#B01076]"
                >
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b">
              <h3 className="text-lg font-semibold">Edit Accommodation</h3>
            </div>
            <form onSubmit={handleEdit} className="px-6 py-5 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={editForm.acc_type}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      acc_type: e.target.value,
                      configuration: "",
                    }))
                  }
                  className="w-full rounded border border-gray-200 px-3 py-2"
                >
                  {typeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Configuration */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Configuration
                </label>
                <select
                  value={editForm.configuration}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      configuration: e.target.value,
                    }))
                  }
                  className="w-full rounded border border-gray-200 px-3 py-2"
                >
                  <option value="">Select configuration...</option>
                  {(configOptions[editForm.acc_type] || []).map((conf) => (
                    <option key={conf} value={conf}>
                      {conf}
                    </option>
                  ))}
                </select>
              </div>

              {/* Suburb */}
              <div>
                <label className="block text-sm font-medium mb-1">Suburb</label>
                <Input
                  value={editForm.suburb}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      suburb: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Property Title
                </label>
                <Input
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Address
                </label>
                <Input
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full rounded border border-gray-200 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
              </div>

              {/* Beds / Baths / People */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Beds</label>
                  <Input
                    type="number"
                    min="0"
                    value={editForm.beds}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        beds: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Baths
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={editForm.baths}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        baths: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    People
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={editForm.max_participants}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        max_participants: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Gender + SDA Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Gender
                  </label>
                  <select
                    value={editForm.gender}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    className="w-full rounded border border-gray-200 px-3 py-2"
                  >
                    {genderOptions.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    SDA Category
                  </label>
                  <select
                    value={editForm.sda_category}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        sda_category: e.target.value,
                      }))
                    }
                    className="w-full rounded border border-gray-200 px-3 py-2"
                  >
                    <option value="">Select category...</option>
                    {sdaCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Accommodation Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    setEditImages(Array.from(e.target.files || []))
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to keep current images. Selecting files will add
                  them on top of existing images.
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Vacant Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full rounded border border-gray-200 px-3 py-2"
                >
                  <option value="Vacant">Vacant</option>
                  <option value="Occupied">Occupied</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2 pb-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEdit(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#D2138C] hover:bg-[#B01076]"
                >
                  Save changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="px-6 py-5 border-b">
              <h3 className="text-lg font-semibold text-red-600">
                Delete Accommodation
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Are you sure you want to delete “{toDelete?.acc_type} –{" "}
                {toDelete?.configuration}”?
              </p>
            </div>
            <div className="px-6 py-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDelete(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-[#D2138C] hover:bg-[#B01076]"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE VIEWER MODAL */}
      {showImagesModal && activeImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setShowImagesModal(false)}
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4">Accommodation Images</h3>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={prevImage}
                className="h-10 w-10 rounded-full border flex items-center justify-center hover:bg-gray-100"
              >
                ‹
              </button>
              <img
                src={fullImageUrl(activeImages[activeImageIndex])}
                alt="Accommodation"
                className="max-h-[420px] w-auto object-contain rounded shadow-md"
              />
              <button
                type="button"
                onClick={nextImage}
                className="h-10 w-10 rounded-full border flex items-center justify-center hover:bg-gray-100"
              >
                ›
              </button>
            </div>
            <p className="text-center text-sm text-gray-500 mt-3">
              {activeImageIndex + 1} / {activeImages.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageAccommodations;
