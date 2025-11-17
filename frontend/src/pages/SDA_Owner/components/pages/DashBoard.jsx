import { useEffect, useState, useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Home,
  Users,
  TrendingUp,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

function OwnerDashboard({ onAddAccommodation, onGoToAccommodations }) {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);

  // Fetch owner activities
  const fetchActivities = async () => {
    try {
      setLoading(true); // optional: you may want a separate loading state for activities
      setError(null);

      const accessToken =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!accessToken) {
        setActivities([]);
        return;
      }

      const res = await fetch("http://127.0.0.1:5000/api/sdaowner/activities?limit=4", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(`Failed to fetch activities: ${res.status} ${text || ""}`);
      }

      const json = await res.json();
      // Expect json.activities to be an array of activity objects
      setActivities(Array.isArray(json.activities) ? json.activities : []);
    } catch (err) {
      console.error("fetchActivities error:", err);
      setError(err.message || "Failed to load activities");
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // ------- Fetch accommodations (for stats + distribution) -------
  const fetchAccommodations = async () => {
    try {
      setLoading(true);
      setError(null);

      const accessToken =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      if (!accessToken) {
        console.error("No access token found");
        setAccommodations([]);
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:5000/api/sdaowner/get_accommodations",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const text = await response.text().catch(() => null);
        throw new Error(
          `Failed to fetch accommodations: ${response.status} ${response.statusText} ${text || ""}`
        );
      }

      const data = await response.json();
      setAccommodations(Array.isArray(data.accommodations) ? data.accommodations : []);
    } catch (err) {
      console.error("Error fetching accommodations:", err);
      setError(err.message || "Failed to fetch accommodations");
      setAccommodations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccommodations();
    fetchActivities();
    
    // poll for new activities every 10 seconds (adjust to taste)
    const interval = setInterval(() => {
      fetchActivities();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // helper to parse date fallback
  const parseDateOrNull = (obj) => {
    if (!obj) return null;
    const d = obj.created_at || obj.updated_at || obj.createdAt || obj.updatedAt || null;
    if (!d) return null;
    const parsed = Date.parse(d);
    return isNaN(parsed) ? null : new Date(parsed);
  };

  const timeAgo = (date) => {
    if (!date) return "Unknown";
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(); // fallback to date string
  };

  // Derived stats via useMemo for efficiency
  const stats = useMemo(() => {
    const total = accommodations.length;

    // Count vacancy/occupancy based on 'status' field. Adjust per your API exact values.
    const vacant = accommodations.filter((a) => {
      const s = (a.status || "").toString().toLowerCase();
      return s === "available" || s === "vacant" || s === "open";
    }).length;

    const occupied = accommodations.filter((a) => {
      const s = (a.status || "").toString().toLowerCase();
      return s === "occupied" || s === "booked" || s === "taken";
    }).length;

    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

    // Distribution by accommodation_type (fallback to 'Unknown' if missing)
    const distributionMap = {};
    accommodations.forEach((a) => {
      const type = a.accommodation_type || a.accommodationType || "Unknown";
      distributionMap[type] = (distributionMap[type] || 0) + 1;
    });

    // Convert to array and compute percentages
    const distribution = Object.entries(distributionMap).map(([type, count]) => {
      const percent = total > 0 ? Math.round((count / total) * 100) : 0;
      return { type, count, percent };
    });

    // Get recent accommodations: sort by created_at / updated_at / id (desc) and take top 5
    const recent = accommodations
      .slice()
      .sort((a, b) => {
        const da = parseDateOrNull(a);
        const db = parseDateOrNull(b);
        if (da && db) return db - da;
        if (da && !db) return -1;
        if (!da && db) return 1;
        // fallback to id if both missing dates
        const ia = Number(a.id || a._id || 0);
        const ib = Number(b.id || b._id || 0);
        return ib - ia;
      })
      .slice(0, 5)
      .map((a) => {
        const date = parseDateOrNull(a);
        return {
          id: a.id,
          title: a.title || a.name || "Untitled",
          subtitle: a.location || a.address || a.accommodation_type || "",
          status: a.status || "Unknown",
          type: a.accommodation_type || a.accommodationType || "Unknown",
          time: timeAgo(date),
        };
      });

    return { total, vacant, occupied, occupancyRate, distribution, recent };
  }, [accommodations]);


  // group activities by day (descending)
  const dateActivities = useMemo(() => {
    if (!activities || activities.length === 0) return [];

    // parse timestamp helper (unchanged)
    const parseTs = (a) => {
      const t = a.timestamp || a.created_at || a.createdAt || a.time || null;
      if (!t) return null;
      const parsed = Date.parse(t);
      return isNaN(parsed) ? null : new Date(parsed);
    };

    // normalize & sort
    const norm = activities
      .map((a) => {
        const date = parseTs(a);
        return {
          id: a.id || a._id || Math.random().toString(36).slice(2, 9),
          action: (a.action || a.action_type || a.type || "").toString().toLowerCase(),
          accommodationId: a.accommodation_id ?? a.accommodationId ?? null,
          accommodationTitle: a.accommodation_title ?? a.accommodationTitle ?? a.title ?? "",
          timestamp: date,
          dayKey: date ? date.toISOString().slice(0, 10) : "unknown",
          raw: a,
        };
      })
      .sort((x, y) => {
        const tx = x.timestamp ? x.timestamp.getTime() : 0;
        const ty = y.timestamp ? y.timestamp.getTime() : 0;
        return ty - tx;
      })
      // IMPORTANT: limit to the first 4 items BEFORE grouping
      .slice(0, 4);

    // grouping code (unchanged) - it will only see up to 4 items now
    const map = norm.reduce((acc, item) => {
      const key = item.dayKey;
      if (!acc[key]) acc[key] = { dateKey: key, items: [] };
      acc[key].items.push(item);
      return acc;
    }, {});

    const groups = Object.values(map).map((g) => {
      const label =
        g.dateKey === "unknown"
          ? "Unknown"
          : new Date(g.dateKey + "T00:00:00").toLocaleDateString();
      return { dateKey: g.dateKey, dateLabel: label, items: g.items };
    });

    groups.sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));
    return groups;
  }, [activities]);



  function getActionText(action) {
    switch (action) {
      case "add":
        return "Added";
      case "edit":
        return "Edited";
      case "delete":
        return "Deleted";
      default:
        return "Updated";
    }
  }

  function getActionColor(action) {
    switch (action) {
      case "add":
        return "border-emerald-500 text-emerald-500";
      case "edit":
        return "border-sky-500 text-sky-500";
      case "delete":
        return "border-rose-500 text-rose-500";
      default:
        return "border-gray-400 text-gray-500";
    }
  }

  function getActionIcon(action) {
    const commonProps = { className: "h-4 w-4" };
    switch (action) {
      case "add":
        return <Plus {...commonProps} />;
      case "edit":
        return <Edit {...commonProps} />;
      case "delete":
        return <Trash2 {...commonProps} />;
      default:
        return <AlertCircle {...commonProps} />;
    }
  }
  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#D2138C] to-[#B01076] rounded-2xl p-8 text-white shadow-xl shadow-pink-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl mb-2">Welcome back, John!</h2>
            <p className="text-pink-100 text-lg">
              Here's what's happening with your properties today
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total properties */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm text-gray-600">
              Total Accommodation
            </CardTitle>
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl mb-2 text-gray-900">
              {loading ? "—" : stats.total}
            </div>
          </CardContent>
        </Card>

        {/* vacant properties */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm text-gray-600">
              Vacant Accommodation
            </CardTitle>
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              <Home className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl mb-2 text-gray-900">
              {loading ? "—" : stats.vacant}
            </div>
          </CardContent>
        </Card>

        {/* Occupied rooms */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm text-gray-600">
              Occupied Accommodation
            </CardTitle>
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Users className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl mb-2 text-gray-900">
              {loading ? "—" : stats.occupied}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm text-gray-600">
              Occupancy Rate
            </CardTitle>
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#D2138C] to-[#B01076] flex items-center justify-center shadow-lg shadow-pink-500/30">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl mb-2 text-gray-900">
              {loading ? "—" : `${stats.occupancyRate}%`}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Manage your properties efficiently
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto py-6 flex-col items-start gap-2 hover:bg-[#D2138C]/5 hover:border-[#D2138C] transition-all group"
              onClick={() => onAddAccommodation && onAddAccommodation()}
            >
              <Building2 className="h-6 w-6 text-[#D2138C]" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">
                  Add Accommodation
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Create new accommodation
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-6 flex-col items-start gap-2 hover:bg-blue-50 hover:border-blue-500 transition-all group"
              onClick={() => onGoToAccommodations && onGoToAccommodations()}
            >
              <Calendar className="h-6 w-6 text-blue-500" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">
                  Update Accommodation
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Manage accommodation
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Property Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gray-50/50 border-b border-gray-200">
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#D2138C]" />
              Recent Activity
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Latest updates from your properties
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
            <div className="p-6">Loading activities…</div>
            ) : error ? (
              <div className="p-6 text-sm text-rose-600">Error: {error}</div>
            ) : (activities || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-gray-900 mb-2">No Activity Yet</h3>
              <p className="text-gray-500 text-center max-w-md">
                Add, edit, or delete accommodations, your activities will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dateActivities.map((group) => (
                <div key={group.dateKey} className="space-y-3">
                  {group.items.map((activity) => (
                    <div
                      key={activity.id}
                      className="relative pl-8 pb-4 border-l-2 border-gray-200 last:border-l-0 last:pb-0"
                    >
                      <div
                        className={`absolute left-[-9px] top-0 h-4 w-4 rounded-full border-2 ${getActionColor(activity.action)} bg-white`}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className={`h-2 w-2 rounded-full ${getActionColor(activity.action)}`}></div>
                        </div>
                      </div>

                      <div className="bg-white p-4">
                        <div className="flex items-start gap-3">
                          <div className={`h-10 w-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${getActionColor(activity.action)}`}>
                            {getActionIcon(activity.action)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                <p className="text-gray-900">
                                  <span className="text-gray-600">{getActionText(activity.action).toLowerCase()}</span>{" "}
                                  {activity.action !== "delete" && <span className="text-gray-600">accommodation</span>}{" "}
                                  <span className="font-medium text-[#D2138C]">
                                    {activity.accommodationTitle || "—"}
                                  </span>
                                </p>
                              </div>
                              <Badge variant="outline" className={`${getActionColor(activity.action)} text-xs whitespace-nowrap`}>
                                {getActionText(activity.action)}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                <span>ID: #{activity.accommodationId ?? "—"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              ))}

            </div>
          )}
            
              
          </CardContent>
        </Card>

        {/* Property Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#D2138C]" />
              Property Distribution
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Breakdown by accommodation type
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {loading && <div className="text-sm text-gray-500">Loading distribution…</div>}

              {!loading && stats.distribution.length === 0 && (
                <div className="text-sm text-gray-500">No properties to display</div>
              )}

              {!loading &&
                stats.distribution.map((d) => (
                  <div key={d.type}>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl ${d.type === "Houses" ? "bg-gradient-to-br from-purple-500 to-purple-600" : d.type === "Villa" ? "bg-gradient-to-br from-blue-500 to-blue-600" : "bg-gradient-to-br from-[#D2138C] to-[#B01076]"} flex items-center justify-center shadow-lg`}>
                          <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">{d.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg text-gray-900">{d.count}</p>
                        <Badge
                          variant="secondary"
                          className="bg-pink-100 text-pink-700 text-xs"
                        >
                          {d.percent}%
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={d.percent}
                      className="h-2.5"
                      indicatorColor={
                        d.type === "Houses"
                          ? "bg-gradient-to-br from-purple-500 to-purple-600"
                          : d.type === "Villa"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600"
                          : "bg-gradient-to-br from-[#D2138C] to-[#B01076]"
                      }
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          Error loading data: {error}
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
