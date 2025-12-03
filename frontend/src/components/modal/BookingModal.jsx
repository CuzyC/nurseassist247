// BookModal.jsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function BookingModal({ open, onClose, booking, onSuccess }) {
  const isEdit = Boolean(booking);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [accommodations, setAccommodations] = useState([]);
  const API_URL = import.meta.env.VITE_API_BASE_URL;


  const [formData, setFormData] = useState({
    accommodationId: "", 
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    location: "",
    checkIn: "",
    checkOut: "",
    status: "Pending",
  });

  // Populate when editing
  useEffect(() => {
    if (booking) {
      const accId = booking.accommodationId ?? booking.accommodation_id ?? "";
      const clientName = booking.client_name ?? booking.clientName ?? "";
      const clientEmail = booking.client_email ?? booking.clientEmail ?? "";
      const clientPhone = booking.client_phone ?? booking.clientPhone ?? "";
      const location = booking.location ?? "";

      const rawCheckIn = booking.checkIn ?? booking.check_in ?? null;
      const rawCheckOut = booking.checkOut ?? booking.check_out ?? null;

      const toDateInput = (v) => {
        if (!v) return "";
        if (v instanceof Date && !isNaN(v)) {
          return v.toISOString().substring(0, 10);
        }
        try {
          const s = String(v);
          if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
          const d = new Date(s);
          if (!isNaN(d)) return d.toISOString().substring(0, 10);
          return s.substring(0, 10);
        } catch {
          return "";
        }
      };

      setFormData({
        accommodationId: String(accId ?? ""),
        clientName: clientName ?? "",
        clientEmail: clientEmail ?? "",
        clientPhone: clientPhone ?? "",
        location: location ?? "",
        checkIn: toDateInput(rawCheckIn),
        checkOut: toDateInput(rawCheckOut),
        status: booking.status ? capitalizeFirst(booking.status) : "Pending",
      });
    } else {
      setFormData({
        accommodationId: "",
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        location: "",
        checkIn: "",
        checkOut: "",
        status: "Pending",
      });
      setErrorMsg("");
    }
  }, [booking, open]);



  // Utility
  function capitalizeFirst(s) {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Fetch owner's accommodations for property select
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    fetch(`${API_URL}/api/sdaowner/get_accommodations`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.accommodations) {
          setAccommodations(data.accommodations);
        }
      })
      .catch((err) => {
        console.error("Failed to load accommodations", err);
      });
  }, []);

  const handleChange = (field) => (e) => {
    const val = e?.target ? e.target.value : e; // for select onValueChange we may pass value directly
    setFormData((p) => ({ ...p, [field]: val }));
  };

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

    // Basic validation
    if (
      !formData.accommodationId ||
      !formData.clientName ||
      !formData.clientEmail ||
      !formData.clientPhone ||
      !formData.checkIn ||
      !formData.checkOut
    ) {
      setErrorMsg("Please fill required fields: property, client name, check in and check out.");
      setLoading(false);
      return;
    }

    const url = isEdit
      ? `${API_URL}/api/sdaowner/update_booking/${booking.id}`
      : `${API_URL}/api/sdaowner/add_booking`;

    const method = isEdit ? "PUT" : "POST";

    // Prepare payload keys backend accepts (add_booking accepts accommodationId, clientName, checkIn, checkOut, status, location)
    const payload = {
      accommodationId: Number(formData.accommodationId),
      location: formData.location,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      status: formData.status ? formData.status.toLowerCase() : undefined,
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

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // prefer server message
        throw new Error(data.message || (isEdit ? "Failed to update booking" : "Failed to add booking"));
      }

      if (onSuccess) onSuccess(data);
      onClose();
    } catch (error) {
      console.error("Error:", error);
      setErrorMsg(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Booking" : "New Booking"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Edit the details of the booking." : "Enter the details of the new booking."}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[60vh] pr-4 mt-2">
            <div className="space-y-6 pb-4">
              {/* Property select */}
              <div>
                <Label htmlFor="property">Property</Label>
                <Select
                  id="property"
                  name="property"
                  value={String(formData.accommodationId ?? "")}
                  onValueChange={(val) => handleChange("accommodationId")(val)}
                  required
                  className="w-full mt-1"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Property" />
                  </SelectTrigger>
                  <SelectContent>
                    {accommodations.length === 0 && <SelectItem value="">No properties</SelectItem>}
                    {accommodations.map((acc) => (
                      <SelectItem key={acc.id} value={String(acc.id)}>
                        {(acc.title || acc.title) ?? acc.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="resident">Resident / Client name</Label>
                <Input
                  id="resident"
                  name="resident"
                  className="mt-1"
                  required
                  value={formData.clientName}
                  onChange={handleChange("clientName")}
                />
              </div>

              <div>
                <Label htmlFor="email">Resident / Client email</Label>
                <Input
                  id="email"
                  name="email"
                  className="mt-1"
                  required
                  value={formData.clientEmail}
                  onChange={handleChange("clientEmail")}
                />
              </div>

              <div>
                <Label htmlFor="phone">Resident / Client phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  className="mt-1"
                  required
                  value={formData.clientPhone}
                  onChange={handleChange("clientPhone")}
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  className="mt-1"
                  value={formData.location}
                  onChange={handleChange("location")}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkIn">Check In</Label>
                  <Input
                    id="checkIn"
                    name="checkIn"
                    type="date"
                    required
                    value={formData.checkIn}
                    onChange={handleChange("checkIn")}
                  />
                </div>
                <div>
                  <Label htmlFor="checkOut">Check Out</Label>
                  <Input
                    id="checkOut"
                    name="checkOut"
                    type="date"
                    required
                    value={formData.checkOut}
                    onChange={handleChange("checkOut")}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  name="status"
                  value={formData.status}
                  onValueChange={(val) => handleChange("status")(capitalizeFirst(val))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {errorMsg && <p className="text-sm text-red-500 mt-2">{errorMsg}</p>}
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
              {loading ? (isEdit ? "Updating..." : "Adding...") : isEdit ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BookingModal;