import { useState, useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageCircle, ChevronLeft, Copy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const formatMessage = (enquiry) => {
  if (!enquiry) {
    return (
      <div className="text-sm text-gray-700">
        <div className="mb-4">
          <div className="font-medium">No enquiry selected</div>
          <div className="text-gray-500">Select an enquiry from the list.</div>
        </div>
      </div>
    );
  }

  // Use optional chaining and sane defaults
  const title = enquiry.accommodationTitle ?? "—";
  const location = enquiry.location ?? "—";
  const type = enquiry.type ?? "—";
  const status = enquiry.status ?? "—";
  const message = enquiry.message ?? "";

  return (
    <div className="text-sm text-gray-700">
      <div className="mb-4">
        <div>Property Enquired:</div>
        <div>
          <span>Property name: </span>
          <strong className="font-semibold">{title}</strong>
        </div>

        <div>
          <span>Location: </span>
          <strong className="font-semibold">{location}</strong>
        </div>

        <div>
          <span>Type: </span>
          <strong className="font-semibold">{type}</strong>
        </div>

        <div>
          <span>Status: </span>
          <strong className="font-semibold">{status}</strong>
        </div>
      </div>

      <div className="mb-6 whitespace-pre-wrap">{message}</div>
    </div>
  );
};

function Enquiry() {
  const [inquiries, setEnquiries] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Not authenticated. Please sign in.");
        setLoading(false);
        return;
      }

      // Use a relative path if backend is same origin, otherwise keep full origin and enable CORS
      const res = await fetch(`${API_URL}/api/sdaowner/get_inquiries`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));
      console.log("GET /get_inquiries:", res.status, data);

      if (!res.ok) {
        setError(data.message || data.msg || "Failed to fetch enquiries");
        setEnquiries([]);
      } else {
        // backend should return { enquiries: [...] }
        const list = data.enquiries || [];
        setEnquiries(list);
        // set first item as active (if any)
        if (list.length > 0) {
          setActiveId(list[0].id ?? null);
        } else {
          setActiveId(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch inquiries:", err);
      setError("Failed to fetch enquiries. See console for details.");
      setEnquiries([]);
      setActiveId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  useEffect(() => {
    if (!activeId && inquiries.length > 0) {
      setActiveId(inquiries[0].id ?? null);
    }
  }, [inquiries, activeId]);

  const active = inquiries.find((e) => e.id === activeId) || (inquiries.length > 0 ? inquiries[0] : null);

  // Delete selected enquiry
  const handleDeleteInquiry = async (id) => {
    if (!id) return;
    const ok = window.confirm("Delete this enquiry? This action cannot be undone.");
    if (!ok) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Not authenticated. Please sign in.");
        return;
      }

      const res = await fetch(`${API_URL}/api/sdaowner/delete_inquiry/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Try to parse response JSON (guard if no body)
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data.message || "Failed to delete enquiry";
        setError(msg);
        console.error("Delete enquiry failed:", msg);
        return;
      }

      // Remove from local state
      setEnquiries((prev) => prev.filter((e) => e.id !== id));

      // If the deleted item was active, pick the first remaining or null
      setActiveId((prev) => {
        if (prev === id) {
          const remaining = inquiries.filter((e) => e.id !== id);
          return remaining.length > 0 ? remaining[0].id : null;
        }
        return prev;
      });
    } catch (err) {
      console.error("Error deleting enquiry:", err);
      setError("Failed to delete enquiry. See console for details.");
    } finally {
      setLoading(false);
    }
  };


  // defensive render values
  const activeName = active?.name ?? "No enquiry selected";
  const activeEmail = active?.email ?? "";
  const activePhone = active?.phone ?? "—";
  const activeDate = active?.date ? new Date(active.date).toLocaleString() : "";

  return (
    <div className="min-h-screen">
      {/* optional: show loading / error */}
      {loading && (
        <div className="mb-4 text-sm text-gray-600">Loading inquiries…</div>
      )}
      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

      {/* Main content: two columns */}
      <div className="grid grid-cols-[360px_1fr] gap-8 h-[calc(100vh-10rem)]">
        {/* LEFT COLUMN */}
        <Card className="rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex flex-col h-full">
            {/* Pills or Filter */}
            <div className="flex gap-3 mb-6">
              <Button className="flex-1 px-6 py-2 rounded-full bg-[#D2138C] hover:bg-[#D2138C]/90 hover:text-white">
                All
              </Button>
              <Button className="flex-1 px-6 py-2 rounded-full bg-pink-100 text-[#6e5358] hover:bg-[#D2138C] hover:text-white">
                Unread
              </Button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <Input placeholder="Search inquiries..." />
            </div>

            {/* Scrollable list */}
            <ScrollArea className="flex-1 overflow-auto pr-2">
              <ul className="space-y-4">
                {inquiries.map((enq) => {
                  // be defensive for each item too
                  const id = enq?.id ?? null;
                  const name = enq?.name ?? "Guest";
                  const message = enq?.message ?? "";
                  const isActive = id === activeId;

                  const preview =
                    (message ?? "").length > 80
                      ? (message ?? "").slice(0, 80) + "..."
                      : message;

                  return (
                    <li
                      key={id}
                      onClick={() => id !== null && setActiveId(id)}
                      className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-shadow ${
                        isActive ? "bg-pink-50 shadow-inner" : "hover:bg-pink-50/60"
                      }`}
                    >
                      <div>
                        <Avatar className="h-12 w-12 bg-pink-100">
                          <AvatarFallback>
                            <MessageCircle className="w-5 h-5 text-pink-600" />
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className="font-medium">{name}</div>
                          <div className="text-xs text-gray-500">4m ago</div>
                        </div>

                        <p className="text-sm text-gray-600 mt-1">{preview}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* RIGHT COLUMN */}
        <Card className="p-8 h-full flex flex-col min-h-0">
          {/* header row with avatar, name/email and date */}
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <Avatar className="h-12 w-12 bg-pink-100">
                <AvatarFallback>
                  <MessageCircle className="w-5 h-5 text-pink-600" />
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="font-semibold text-lg">{activeName}</div>
                  <div className="text-sm text-gray-500">{activeEmail}</div>
                  <div className="text-xs text-gray-400">Guest</div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">{activeDate}</div>
                  <button
                    type="button"
                    onClick={() => handleDeleteInquiry(active?.id)}
                    disabled={!active}
                    className="px-3 py-1 border border-red-300 text-red-700 rounded hover:bg-red-50 transition"
                    title="Delete enquiry"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 my-6" />

          {/* main detail body */}
          <ScrollArea className="flex-1 overflow-auto pr-4 min-w-0">
            {formatMessage(active)}

            {/* CTA area */}
            <div className="mt-6 border-t border-gray-200 pt-6 text-sm text-gray-600">
              <div className="mb-4">
                <div className="mb-1 text-gray-500">Guest’s Details:</div>
                <div>
                  <span>Name: </span>
                  <strong>{activeName}</strong>
                </div>
                <div>
                  <span>Email: </span>
                  <strong>{activeEmail}</strong>
                </div>
                <div className="mb-4">
                  <span>Phone: </span>
                  <strong>{activePhone}</strong>
                </div>

                <div className="flex gap-4 mt-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Reply via email
                  </Button>

                  <Button variant="outline" className="flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    Copy {activePhone}
                  </Button>
                </div>
              </div>
            </div>

            <div className="h-12" />
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}

export default Enquiry;
