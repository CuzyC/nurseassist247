import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Plus,
  Edit,
  Trash2,
  Clock,
  User,
  Building2,
  AlertCircle,
} from "lucide-react";

function SDA_Log() {
  // initialize as empty array to avoid crashes before fetch completes
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("http://127.0.0.1:5000/api/sdaowner/activities");

        // helpful debugging: if unauthorized, throw with message
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Fetch failed (${res.status}): ${text || res.statusText}`);
        }

        const data = await res.json();

        // the backend returns an array payload — ensure we set an array
        setActivities(Array.isArray(data) ? data : data.activities || []);
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // --- NEW: sort activities newest-first before grouping ---
  const sortedActivities = (activities || []).slice().sort((a, b) => {
    const ta = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tb = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
    return tb - ta; // newest first
  });

  // We'll group by ISO date (yyyy-mm-dd) so sorting remains reliable,
  // and also store a display label for each date.
  const groupedObj = sortedActivities.reduce((acc, activity) => {
    const ts = activity.timestamp ? new Date(activity.timestamp) : new Date();
    // ISO date key for reliable sorting: "YYYY-MM-DD"
    const isoKey = ts.toISOString().slice(0, 10);
    // Human-readable label (same as original)
    const displayLabel = ts.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!acc.groups[isoKey]) {
      acc.groups[isoKey] = [];
      acc.labels[isoKey] = displayLabel;
    }
    acc.groups[isoKey].push(activity);
    return acc;
  }, { groups: {}, labels: {} });

  // Prepare an ordered array of [displayLabel, activitiesArray] in newest-date-first order
  const groupedEntries = Object.keys(groupedObj.groups)
    .sort((a, b) => new Date(b) - new Date(a)) // iso date keys sort correctly
    .map((isoKey) => [groupedObj.labels[isoKey], groupedObj.groups[isoKey]]);

  function formatTimestamp(iso) {
    const dt = new Date(iso);
    const diff = Date.now() - dt.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days <= 7) return `${days}d ago`;

    return dt.toLocaleString(undefined, { month: "short", day: "numeric" });
  }

  function formatFullTimestamp(iso) {
    const dt = new Date(iso);
    return dt.toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

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
    <div>
      <Card>
        <CardHeader className="bg-gray-50/50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">Activity History</CardTitle>
            <Badge variant="outline" className="text-xs">
              {(activities || []).length} {(activities || []).length === 1 ? "activity" : "activities"}
            </Badge>
          </div>
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
                When SDA Owners add, edit, or delete accommodations, their activities will appear here.
              </p>
            </div>
          ) : (
            <ScrollArea className="">
              <div className="p-6 space-y-8">
                {groupedEntries.map(([dateLabel, dateActivities]) => (
                  <div key={dateLabel} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-gray-200" />
                      <p className="text-xs text-gray-500 uppercase tracking-wider px-2">{dateLabel}</p>
                      <div className="h-px flex-1 bg-gray-200" />
                    </div>

                    <div className="space-y-3">
                      {dateActivities.map((activity) => (
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
                                      <span className="font-medium">{activity.ownerName}</span>{" "}
                                      <span className="text-gray-600">{getActionText(activity.action).toLowerCase()}</span>{" "}
                                      {activity.action !== "delete" && <span className="text-gray-600">accommodation</span>}{" "}
                                      <span className="font-medium text-[#D2138C]">
                                        {activity.accommodationTitle}
                                      </span>
                                    </p>
                                  </div>
                                  <Badge variant="outline" className={`${getActionColor(activity.action)} text-xs whitespace-nowrap`}>
                                    {getActionText(activity.action)}
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span title={formatFullTimestamp(activity.timestamp)}>{formatTimestamp(activity.timestamp)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    <span>ID: #{activity.accommodationId ?? "—"}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span>{activity.ownerName}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SDA_Log;