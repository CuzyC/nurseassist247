import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Eye,
  HousePlus,
  Edit,
  Trash2,
  RefreshCcw,
  BookmarkX,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="w-36 md:w-40 lg:w-44">
          <svg
            viewBox="0 0 160 160"
            width="100%"
            height="100%"
            aria-label="Property distribution"
          >
            <circle cx="80" cy="80" r="60" fill="#f3f3f3" />
            <text
              x="80"
              y="86"
              textAnchor="middle"
              style={{ fontSize: 12, fontWeight: 600 }}
              fill="#111"
            >
              0
            </text>
          </svg>
        </div>

        <ul className="flex flex-col gap-2">
          {data.map((d) => (
            <li key={d.label} className="flex items-center gap-3 text-sm">
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: d.color }}
              />
              <span className="text-sm">{d.label}</span>
              <span className="text-xs text-muted-foreground">{d.value}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  let angle = -90;
  const cx = 80;
  const cy = 80;
  const r = 60;

  const arcs = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const portion = d.value / total;
      const sweep = portion === 1 ? 359.999 : portion * 360;
      const start = angle;
      const end = angle + sweep;
      angle += sweep;

      const startRad = (Math.PI / 180) * start;
      const endRad = (Math.PI / 180) * end;

      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);

      const largeArc = sweep > 180 ? 1 : 0;

      const dPath = [
        `M ${cx} ${cy}`,
        `L ${x1} ${y1}`,
        `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
        "Z",
      ].join(" ");

      return { dPath, color: d.color, label: d.label, value: d.value };
    });

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="w-36 md:w-40 lg:w-44 flex-shrink-0">
        <svg
          viewBox="0 0 160 160"
          width="100%"
          height="100%"
          aria-label="Property distribution"
        >
          {arcs.map((a, i) => (
            <path
              key={a.label + i}
              d={a.dPath}
              fill={a.color}
              strokeWidth={0}
            />
          ))}

          <circle cx={cx} cy={cy} r={28} fill="#fff" />
          <text
            x={cx}
            y={cy + 6}
            textAnchor="middle"
            style={{ fontSize: 12, fontWeight: 600 }}
            fill="#111"
          >
            {total}
          </text>
        </svg>
      </div>

      <ul className="flex flex-col gap-2">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-3 text-sm">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: d.color }}
            />
            <span className="text-sm">{d.label}</span>
            <span className="text-xs text-muted-foreground">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Helper to pull username-ish value from JWT access token
function getUsernameFromToken(token) {
  if (!token) return "";
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return "";

    // Handle base64url
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = atob(base64);
    const payload = JSON.parse(jsonPayload);

    const raw =
      payload.username ||
      payload.userName ||
      payload.name ||
      payload.email ||
      payload.sub ||
      "";

    if (!raw) return "";

    // If it's an email, use the part before @ for a nicer greeting
    if (typeof raw === "string" && raw.includes("@")) {
      return raw.split("@")[0];
    }

    return String(raw);
  } catch (e) {
    console.error("Failed to decode token for username:", e);
    return "";
  }
}

// helper to get "2 days ago" style text
function formatTimeAgo(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now - date;
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }

  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

// ⬇⬇⬇ accept onGoToAccommodations from Portal.jsx
export default function Dashboard({ onGoToAccommodations, onGoToBookings }) {
  
  
  const [dashboardData, setDashboardData] = useState(null);
  const [username, setUsername] = useState("");

  // helper for "View all" buttons
  const handleViewAllAccommodations = () => {
    if (typeof onGoToAccommodations === "function") {
      onGoToAccommodations();
    }
  };

  const handleViewAllBookings = () => {
    if (typeof onGoToBookings === "function") {
      onGoToBookings();
    }
  }

  // 1) On mount: seed username from storage or JWT
  useEffect(() => {
    const storedUsername = (
      localStorage.getItem("username") ||
      sessionStorage.getItem("username") ||
      ""
    ).trim();

    if (storedUsername) {
      setUsername(storedUsername);
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (token) {
      const tokenUsername = getUsernameFromToken(token);
      if (tokenUsername) {
        setUsername(tokenUsername);
      }
    }
  }, []);

  // 2) Fetch dashboard summary from backend
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.error("No access token found");
          return;
        }

        const API_URL = import.meta.env.VITE_API_BASE_URL;

        const res = await fetch(
          `${API_URL}/api/sdaowner/dashboard_summary`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        if (!res.ok) {
          console.error("Failed to load dashboard:", data.message);
          return;
        }

        setDashboardData(data);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
    };

    fetchDashboard();
  }, []);

  // 3) Whenever dashboardData changes, prefer username from API
  useEffect(() => {
    if (!dashboardData) return;

    const apiUsername = (
      dashboardData.username ||
      dashboardData.ownerName ||
      dashboardData.ownerUsername ||
      ""
    ).trim();

    if (apiUsername && apiUsername !== username) {
      setUsername(apiUsername);
      localStorage.setItem("username", apiUsername);
      sessionStorage.setItem("username", apiUsername);
    }
  }, [dashboardData, username]);

  // KPIs
  const kpis = [
    { label: "Total Properties", value: dashboardData?.totalProperties ?? 0 },
    { label: "Vacant Units", value: dashboardData?.vacantUnits ?? 0 },
    { label: "Occupied Units", value: dashboardData?.occupiedUnits ?? 0 },
    {
      label: "Occupancy Rate",
      value:
        dashboardData?.occupancyRate != null
          ? `${Math.round(dashboardData.occupancyRate)}%`
          : "0%",
    },
  ];

  // Property distribution (add colors on the frontend)
  const distributionColors = {
    Apartment: "#FDB3CE",
    House: "#D2138C",
    Villa: "#6D2B3E",
    "Group House": "#3B0F1E",
  };

  const distribution =
    (dashboardData?.propertyDistribution || [])
    .filter((d) => d.value > 0)
    .map((d) => ({
      ...d,
      color: distributionColors[d.label] || "#999999",
    })) || [];

  // Accommodations list
  const accommodations = dashboardData?.accommodations || [];
  const limitedAccommodations = accommodations.slice(0, 4);

  // ---------- NEW: Recent activity formatting ----------
  const rawRecent = dashboardData?.recentActivity || [];

  const recentActivities =
    rawRecent
      .slice(0, 4)
      .map((act, idx) => {
        const actionRaw = (act.action || "").toLowerCase();

        let verb = "";
        switch (actionRaw) {
          case "add":
            verb = "Add";
            break;
          case "update":
          case "edit":
            verb = "Update";
            break;
          case "delete":
            verb = "Delete";
            break;
          default:
            verb = act.action
              ? act.action.charAt(0).toUpperCase() + act.action.slice(1)
              : "";
            break;
        }

        // Try to get something like "House / Villa / Apartment" from the payload
        const type =
          act.accommodationType ||
          act.accommodation_type ||
          act.type ||
          act.accommodationTitle ||
          act.title ||
          "";

        const label = [verb, type].filter(Boolean).join(" ");

        return {
          id: idx,
          action: actionRaw,
          label,
          propertyTitle: act.accommodationTitle || act.title || "",
          timeAgo: formatTimeAgo(act.timestamp),
        };
      }) || [];

  // Recent move-ins
  const placements =
    (dashboardData?.recentMoveIns || []).map((m, idx) => ({
      id: m.id ?? idx,
      name: m.name || "",
      property: m.property || "",
      moveIn: m.moveInDate
        ? new Date(m.moveInDate).toLocaleDateString()
        : "",
      phone: m.phone || "",
      email: m.email || "",
    })) || [];

  const mostRecent = placements[0];

  const getActivityIcon = (activity) => {
    switch ((activity || "").toLowerCase()) {
      case "add":
        return <HousePlus className="mt-1 w-5 h-5 text-black" />;
      case "update":
      case "edit":
        return <RefreshCcw className="mt-1 w-5 h-5 text-black" />;
      case "delete":
        return <Trash2 className="mt-1 w-5 h-5 text-black" />;
      default:
        return <Bookmark className="mt-1 w-5 h-5 text-black" />;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4">
      {/* Header: stacks on small screens */}
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 pb-4">
        {/* Left title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-black">
          {username ? `Hello there, ${username}!` : "Hello there!"}
        </h1>

        {/* KPIs */}
        <div className="flex items-center md:items-center gap-4 md:gap-6 w-full md:w-auto overflow-x-auto md:overflow-visible py-1">
          <div className="flex gap-4 md:gap-6 px-1">
            {kpis.map((k) => (
              <Card
                key={k.label}
                className="min-w-[120px] sm:min-w-[140px] md:min-w-[110px] max-w-[160px] bg-transparent shadow-none border-0"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col items-center justify-center px-4 py-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      {k.label}
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-semibold">
                      {k.value}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column (distribution + recent activity) */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Property Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart data={distribution} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Activity</CardTitle>
              <p className="text-xs text-gray-600">
                Latest updates from your properties
              </p>
            </CardHeader>
            <CardContent>
              {recentActivities.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground">
                  no recent activity
                </div>
              ) : (
                <div className="space-y-2">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 py-2 border-b last:border-b-0"
                    >
                      {getActivityIcon(activity.action)}
                      <div className="flex-1">
                        <div className="text-sm font-semibold">
                          {activity.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {activity.propertyTitle}
                          {activity.propertyTitle && activity.timeAgo
                            ? " · "
                            : ""}
                          {activity.timeAgo}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column (accommodations + placements) */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Accommodations</CardTitle>

              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={handleViewAllAccommodations} // ⬅ View all → Manage Accommodations
              >
                <ArrowRight className="mr-2" /> View all
              </Button>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-center text-black">
                        Title
                      </TableHead>
                      <TableHead className="text-center text-black">
                        Type
                      </TableHead>
                      <TableHead className="text-center text-black">
                        Location
                      </TableHead>
                      <TableHead className="text-center text-black">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accommodations.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground"
                        >
                          no accommodations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      limitedAccommodations.map((accommodation) => (
                        <TableRow
                          key={accommodation.id}
                          className="text-gray-700"
                        >
                          <TableCell className="text-center font-medium">
                            {accommodation.title}
                          </TableCell>
                          <TableCell className="text-center">
                            {accommodation.type}
                          </TableCell>
                          <TableCell className="text-center">
                            {accommodation.location}
                          </TableCell>
                          <TableCell className="text-center">
                            {accommodation.status}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Recent Move-ins</CardTitle>

              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={handleViewAllBookings} 
              >
                <ArrowRight className="mr-2" /> View all
              </Button>
            </CardHeader>

            <CardContent>
              {placements.length === 0 || !mostRecent ? (
                <div className="p-4 text-sm text-muted-foreground">
                  No recent move-ins yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-1">
                    <div className="p-4">
                      <div className="text-lg font-medium">
                        {mostRecent.name}
                      </div>
                      <div className="text-sm">{mostRecent.property}</div>

                      <div className="mt-3 text-sm">
                        <div className="text-sm">
                          Move-in: {mostRecent.moveIn}
                        </div>
                      </div>

                      <div className="mt-3 text-sm">
                        <div className="text-sm">
                          Phone no.: {mostRecent.phone}
                        </div>
                        <div className="text-sm">
                          Email: {mostRecent.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="space-y-2">
                      {placements.slice(1).map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between py-3 border-b last:border-b-0"
                        >
                          <div>
                            <div className="font-medium">{p.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {p.property}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {p.moveIn}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}