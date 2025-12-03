// booking.jsx
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Search, CircleStar, Pencil, Trash2, } from "lucide-react";

import BookingModal from "@/components/modal/BookingModal";
import DeleteConfirmDialog from "@/components/modal/DeleteConfirmDialog";

function Booking() {
  const [bookings, setBookings] = useState([]);
  const [rawBookings, setRawBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch bookings and normalize shape to what the UI expects
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No access token found. Please login.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/sdaowner/get_bookings`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      console.log("GET /get_bookings:", res.status, data);

      if (!res.ok) {
        // try to handle different error message fields from backend
        const msg = data?.message || data?.msg || JSON.stringify(data) || "Unknown error";
        setError(msg);
        setBookings([]);
        setLoading(false);
        return;
      }

      // data.bookings is expected (from your backend)
      const raw = data?.bookings || [];
      setRawBookings(raw); 

      // Normalize each booking to fields your UI uses:
      // { id, name, accommodationTitle, location, checkIn, checkOut, status }
      const normalized = raw.map((b) => {
        // backend uses clientName, checkIn/checkOut ISO strings with "Z"
        const rawStatus = (b?.status || "").toString();
        const status = normalizeStatus(rawStatus);

        // parse ISO date strings into readable strings (fallback to original if parse fails)
        const fmt = (iso) => {
          try {
            if (!iso) return "";
            const d = new Date(iso);
            if (isNaN(d)) return iso;
            // You can tweak locale/options as needed; leaving default locale so it respects user's locale
            return d.toLocaleDateString();
          } catch {
            return iso;
          }
        };

        return {
          id: b?.id ?? b?.Id ?? Math.random().toString(36).slice(2, 9),
          name: b?.clientName ?? b?.name ?? "Unknown",
          email: b?.clientEmail ?? b?.email ?? "Unknown",
          phone: b?.clientPhone ?? b?.phone ?? "Unknown",
          accommodationTitle: b?.accommodationTitle ?? b?.accommodation_title ?? b?.accommodationTitle ?? "—",
          location: b?.location ?? "—",
          checkIn: fmt(b?.checkIn ?? b?.check_in),
          checkOut: fmt(b?.checkOut ?? b?.check_out),
          // keep the normalized status label for display (Approved/Pending/Cancelled/Completed/Other)
          status,
          // keep raw status as well if you need it
          _rawStatus: rawStatus,
        };
      });

      setBookings(normalized);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError(String(err));
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // small helper: convert backend status to friendly label used in UI
  // backend examples: "pending", "confirmed", "cancelled", "completed"
  function normalizeStatus(statusRaw) {
    if (!statusRaw) return "Pending";
    const s = statusRaw.toString().toLowerCase();
    if (s.includes("confirm")) return "Approved"; 
    if (s.includes("pending")) return "Pending";
    if (s.includes("cancel")) return "Cancelled";
    if (s.includes("complete")) return "Completed";
    return capitalize(statusRaw);
  }

  function capitalize(str) {
    if (!str) return str;
    return String(str).charAt(0).toUpperCase() + String(str).slice(1);
  }

  // KPI values (computed from normalized bookings)
  const kpis = useMemo(() => {
    const total = bookings.length;
    const approved = bookings.filter((b) => (b.status || "").toLowerCase() === "approved").length;
    const pending = bookings.filter((b) => (b.status || "").toLowerCase() === "pending").length;
    const cancelled = bookings.filter((b) => (b.status || "").toLowerCase() === "cancelled").length;
    return [
      { label: "Total Booking", value: total },
      { label: "Approved", value: approved },
      { label: "Pending", value: pending },
      { label: "Cancelled", value: cancelled },
    ];
  }, [bookings]);

  // UI state
  const [query, setQuery] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // useEffect(() => {
  //   if (openAddFromDashboard) {
  //     // ensure it's in "add" mode
  //     setSelectedBook(null);
  //     setOpenModal(true);

  //   }
  // }, [openAddFromDashboard, onAddHandled]);

  const handleSearch = () => {
    console.log("Search clicked, query:", query);
    // local simple client-side filter example
    // you could call a server search endpoint instead
    if (!query) {
      fetchBookings();
      return;
    }
    const q = query.toLowerCase();
    setBookings((prev) => prev.filter((b) => {
      return (
        (b.name || "").toLowerCase().includes(q) ||
        (b.accommodationTitle || "").toLowerCase().includes(q) ||
        (b.location || "").toLowerCase().includes(q)
      );
    }));
  };

  const handleExport = () => {
    console.log("Export PDF clicked");
    // implement export logic
  };

  const handleAddNew = () => {
    setSelectedBook(null);
    setOpenModal(true);
  };

  const handleEdit = (displayBooking) => {
    const raw = rawBookings.find((r) => String(r.id) === String(displayBooking.id));
    setSelectedBook(raw || null);
    setOpenModal(true);
  };

  const handleDelete = (booking) => {
    setSelectedId(booking.id);
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
        `${API_URL}/api/sdaowner/delete_booking/${selectedId}`,
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
        setBookings((prev) =>
          prev.filter((acc) => acc.id !== selectedId)
        );
      } else {
        console.error(
          "Delete failed:",
          data.message || data.msg || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error deleting book:", error);
    } finally {
      setOpenDeleteDialog(false);
      setSelectedId(null);
    }
  }

  // status badge helper (uses normalized statuses)
  const statusDisplay = (status) => {
    const normalized = (status || "").toString().toLowerCase();
    const colors = {
      approved: "bg-green-500",
      pending: "bg-yellow-400",
      cancelled: "bg-red-500",
      completed: "bg-blue-400",
    };
    const colorClass = colors[normalized] || "bg-gray-300";
    return (
      <div className="flex items-center gap-2 justify-center">
        <span className={`h-3 w-3 rounded-full ${colorClass}`} />
        <span className="text-gray-700">{status}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header: KPIs on the LEFT, Title + Create button on the RIGHT */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 ml-0 md:ml-6">
          <Button
            onClick={handleAddNew}
            className="bg-[#D2138C] hover:bg-pink-700 rounded-full text-white px-4 py-2"
          >
            Create Booking
          </Button>
        </div>

        <div className="flex items-center w-full md:w-auto overflow-x-auto py-1">
          <div className="flex">
            {kpis.map((k) => (
              <Card
                key={k.label}
                className="min-w-[120px] sm:min-w-[140px] md:min-w-[150px] max-w-[180px] bg-transparent shadow-none border-0"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col items-center justify-center px-4 py-2">
                    <div className="text-xs font-medium text-muted-foreground">{k.label}</div>
                    <div className="text-2xl font-semibold">{k.value}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex w-full md:w-128 max-w-3xl items-center gap-3 px-3 py-1">
          <Input
            type="text"
            placeholder="Search"
            className="border-none bg-white focus-visible:ring-0 text-gray-700"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={handleSearch} className="bg-[#D2138C] hover:bg-pink-700 rounded-full text-white px-3">
            <Search className="h-4 w-4 mr-2" /> Search
          </Button>
        </div>

        <div className="flex justify-end w-full md:w-auto">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setOpenFilter((s) => !s)}
              className="rounded-full border-[#D2138C] text-[#D2138C] hover:bg-pink-50 hover:text-[#D2138C] px-3"
            >
              <Filter className="h-4 w-4 mr-2" /> Filters
            </Button>

            <Button
              onClick={handleExport}
              className="rounded-full text-white bg-[#D2138C] hover:bg-pink-700 px-3"
            >
              <CircleStar className="h-4 w-4 mr-2" /> Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* error / loading */}
      {error && (
        <div className="text-red-600 bg-red-50 p-2 rounded">{error}</div>
      )}
      {loading && (
        <div className="text-sm text-gray-600">Loading bookings…</div>
      )}

      {/* Booking table */}
      <div className="rounded-lg border overflow-x-auto shadow-md">
        <Table className="">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-black text-center">Resident</TableHead>
              <TableHead className="text-black text-center">Email</TableHead>
              <TableHead className="text-black text-center">Phone</TableHead>
              <TableHead className="text-black text-center">Property</TableHead>
              <TableHead className="text-black text-center">Location</TableHead>
              <TableHead className="text-black text-center">Check in</TableHead>
              <TableHead className="text-black text-center">Check out</TableHead>
              <TableHead className="text-black text-center">Status</TableHead>
              <TableHead className="text-black text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {!loading && bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  no bookings found
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((b) => (
                <TableRow key={b.id} className="text-gray-700">
                  <TableCell className="text-center font-medium">{b.name}</TableCell>
                  <TableCell className="text-center">{b.email}</TableCell>
                  <TableCell className="text-center">{b.phone}</TableCell>
                  <TableCell className="text-center">{b.accommodationTitle}</TableCell>
                  <TableCell className="text-center">{b.location}</TableCell>
                  <TableCell className="text-center">{b.checkIn}</TableCell>
                  <TableCell className="text-center">{b.checkOut}</TableCell>
                  <TableCell className="text-center">
                    {statusDisplay(b.status)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button onClick={() => handleEdit(b)} size="sm" variant="ghost" className="text-gray-600 hover:bg-gray-100">
                        <Pencil className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button onClick={() => handleDelete(b)} size="sm" variant="ghost" className="text-[#D2138C] hover:bg-[#ffedf4]">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      <BookingModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        booking={selectedBook}
        onSuccess={fetchBookings}
      />

      <DeleteConfirmDialog 
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Book"
        description="Are you sure you want to delete this book? This action cannot be undone."
      />

    </div>
  );
}

export default Booking;
