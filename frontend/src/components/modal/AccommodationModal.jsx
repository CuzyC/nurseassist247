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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Upload, Image as ImageIcon } from "lucide-react";

const PREDEFINED_FEATURES = [
  "Wheelchair Access",
  "Emergency Call System",
  "Wide Doorways",
  "Support Rails",
  "Ramps",
  "Ground Floor Bedroom",
  "Modified Bathroom",
  "Lift Access",
  "Multiple Access Points",
  "Wide Corridors",
  "Therapy Room",
  "Private Entrance",
  "Open Plan",
];

const PREDEFINED_AMENITIES = [
  "Wi-Fi",
  "Air Conditioning",
  "Kitchen",
  "Laundry",
  "Garden",
  "Parking",
  "Living Room",
  "Sea View",
  "Security",
  "Dining Area",
  "Patio",
  "Storage",
  "Kitchenette",
  "Heating",
];

function AccommodationModal({ open, onClose, accommodation, onSuccess }) {
  const isEdit = Boolean(accommodation);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    capacity: "",
    description: "",
    accommodationType: "",
    gender: "",
    bedrooms: "",
    bathrooms: "",
    supportLevel: "",
    features: [],
    amenities: [],
    images: [],
    status: "Vacant", // "Vacant" | "Occupied"
  });

  // preload data
  useEffect(() => {
    if (accommodation) {
      setFormData({
        title: accommodation.title || "",
        location: accommodation.location || "",
        capacity: accommodation.capacity ?? "",
        description: accommodation.description || "",
        accommodationType: accommodation.accommodationType || "",
        gender: accommodation.gender || "",
        bedrooms: accommodation.bedrooms ?? "",
        bathrooms: accommodation.bathrooms ?? "",
        supportLevel: accommodation.supportLevel || "",
        features: accommodation.features || [],
        amenities: accommodation.amenities || [],
        images: accommodation.images || [],
        status: accommodation.status || "Vacant",
      });
    } else {
      setFormData({
        title: "",
        location: "",
        capacity: "",
        description: "",
        accommodationType: "",
        gender: "",
        bedrooms: "",
        bathrooms: "",
        supportLevel: "",
        features: [],
        amenities: [],
        images: [],
        status: "Vacant",
      });
    }
  }, [accommodation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setErrorMsg("Not authenticated. Please log in again.");
      setLoading(false);
      return;
    }

    const url = isEdit
      ? `http://localhost:5000/api/sdaowner/update_accommodation/${accommodation.id}`
      : "http://localhost:5000/api/sdaowner/add_accommodation";

    const method = isEdit ? "PUT" : "POST";

    // make sure numeric fields are numbers
    const payload = {
      ...formData,
      capacity: Number(formData.capacity),
      bedrooms: Number(formData.bedrooms) || 0,
      bathrooms: Number(formData.bathrooms) || 0,
    };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isEdit
              ? "Failed to update accommodation"
              : "Failed to add accommodation")
        );
      }

      console.log(
        isEdit ? "Accommodation updated:" : "Accommodation added:",
        data
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = (feature) => {
    setFormData((prev) => {
      const updated = prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature];
      return { ...prev, features: updated };
    });
  };

  const toggleAmenity = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageFilesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setErrorMsg("Not authenticated. Please log in again.");
      return;
    }

    setUploadingImages(true);
    setErrorMsg("");

    try {
      const uploadedIds = [];

      for (const file of files) {
        const formDataFile = new FormData();
        formDataFile.append("file", file);

        const res = await fetch(
          "http://localhost:5000/api/sdaowner/upload_image",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              // IMPORTANT: do NOT set Content-Type manually for FormData
            },
            body: formDataFile,
          }
        );

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to upload image");
        }

        // store the ID (or path, depending on your decision)
        uploadedIds.push(data.id);
      }

      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedIds],
      }));
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (image) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((img) => img !== image),
    }));
  };

  const isVacant = formData.status === "Vacant";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Accommodation" : "Add New Accommodation"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the accommodation details below."
                : "Fill out the details to add a new accommodation."}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[60vh] pr-4 mt-2">
            <div className="space-y-6 pb-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g. Modern Green Point Apartment"
                    required
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g. Green Point, Cape Town"
                    required
                  />
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    min="1"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe the accommodation..."
                    required
                  />
                </div>
              </div>

              {/* Accommodation Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={formData.accommodationType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, accommodationType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Group House">Group House</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="1"
                    value={formData.bedrooms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bedrooms: parseInt(e.target.value) || 1,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="1"
                    value={formData.bathrooms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bathrooms: parseInt(e.target.value) || 1,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Support Level</Label>
                  <Select
                    value={formData.supportLevel}
                    onValueChange={(value) =>
                      setFormData({ ...formData, supportLevel: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select support level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low support">Low support</SelectItem>
                      <SelectItem value="Moderate support">
                        Moderate support
                      </SelectItem>
                      <SelectItem value="High support">High support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Features */}
              <div>
                <Label>Features</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PREDEFINED_FEATURES.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <Checkbox
                        id={`feature-${feature}`}
                        checked={formData.features.includes(feature)}
                        onCheckedChange={() => toggleFeature(feature)}
                      />
                      <label
                        htmlFor={`feature-${feature}`}
                        className="text-sm text-gray-700 cursor-pointer flex-1"
                      >
                        {feature}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <Label>Amenities</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PREDEFINED_AMENITIES.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                      />
                      <label
                        htmlFor={`amenity-${amenity}`}
                        className="text-sm text-gray-700 cursor-pointer flex-1"
                      >
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image URLs */}
              <div>
                <Label>Images</Label>
                <div className="flex gap-2 mt-2 items-center">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageFilesChange}
                  />
                  {uploadingImages && (
                    <span className="text-xs text-gray-500">Uploading...</span>
                  )}
                </div>

                {formData.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                    {formData.images.map((imgId, i) => (
                      <div
                        key={i}
                        className="relative border rounded p-2 bg-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm truncate">
                            Image ID: {imgId}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              images: prev.images.filter((id) => id !== imgId),
                            }))
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center mt-3 text-gray-400">
                    No images added yet
                  </div>
                )}
              </div>

              {/* Availability */}
              <div>
                <Label>Availability Status</Label>
                <div className="flex items-center justify-between mt-3 border border-gray-200 rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isVacant ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <p>{isVacant ? "Vacant" : "Occupied"}</p>
                  </div>
                  <Switch
                    checked={isVacant}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: checked ? "Vacant" : "Occupied",
                      }))
                    }
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-sm text-red-500 mt-2">{errorMsg}</p>
              )}
            </div>
          </ScrollArea>

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
                  ? "Updating..."
                  : "Adding..."
                : isEdit
                ? "Update"
                : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AccommodationModal;
