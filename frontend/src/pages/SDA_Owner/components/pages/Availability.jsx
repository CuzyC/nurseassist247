import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Home,
  DoorOpen,
  DoorClosed,
} from "lucide-react";

function Availability() {
  const [accommodations, setAccommodations] = useState([]);

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

  // Aggregate accommodations by suburb/location
  const availabilityData = useMemo(() => {
    const map = {}; // { [suburb]: { suburb, totalProperties, vacant, occupied } }

    accommodations.forEach((acc) => {
      // determine suburb/location
      const suburb =
        acc.suburb ||
        acc.location ||
        (acc.address && (acc.address.suburb || acc.address.city)) ||
        "Unknown";

      if (!map[suburb]) {
        map[suburb] = { suburb, totalProperties: 0, vacant: 0, occupied: 0 };
      }

      map[suburb].totalProperties += 1;

      // heuristics to decide if this accommodation is vacant or occupied
      const status = (acc.status || "").toString().toLowerCase();
      const hasCurrentTenant =
        acc.currentTenant || acc.tenant || acc.occupiedBy || acc.renter;
      const hasBookings =
        Array.isArray(acc.bookings) && acc.bookings.length > 0;

      const isAvailableFlag =
        // explicit boolean flags
        (typeof acc.isAvailable === "boolean" && acc.isAvailable) ||
        (typeof acc.isVacant === "boolean" && acc.isVacant) ||
        // common field names
        acc.available === true ||
        // textual status
        /vacant|available|free|unoccupied/i.test(status);

      const isOccupiedFlag =
        (typeof acc.isOccupied === "boolean" && acc.isOccupied) ||
        acc.occupied === true ||
        /occupied|rented|booked|taken|leased|tenanted/i.test(status) ||
        !!hasCurrentTenant ||
        !!hasBookings;

      // If both flags detected, prefer occupied (bookings/tenant presence is stronger)
      if (isOccupiedFlag) {
        map[suburb].occupied += 1;
      } else if (isAvailableFlag) {
        map[suburb].vacant += 1;
      } else {
        // fallback: if nothing clear, assume occupied if there's a current tenant or booking,
        // otherwise treat as vacant (you can change this behavior if your API has definitive flags)
        if (hasCurrentTenant || hasBookings) {
          map[suburb].occupied += 1;
        } else {
          map[suburb].vacant += 1;
        }
      }
    });

    // convert map to array and compute occupancy rate if needed later
    return Object.values(map);
  }, [accommodations]);

  // Totals
  const totalProperties = availabilityData.reduce(
    (sum, item) => sum + item.totalProperties,
    0
  );
  const totalVacant = availabilityData.reduce((sum, item) => sum + item.vacant, 0);
  const totalOccupied = availabilityData.reduce(
    (sum, item) => sum + item.occupied,
    0
  );

  // Protect against division by 0
  const occupancyPercent =
    totalProperties > 0 ? Math.round((totalOccupied / totalProperties) * 100) : 0;
  const occupancyProgressValue = totalProperties > 0 ? (totalOccupied / totalProperties) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Properties */}
        <Card className="shadow=md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-[#D2138C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-900">{totalProperties}</div>
            <p className="text-xs text-gray-500 mt-1">Across all locations</p>
          </CardContent>
        </Card>

        {/* Vacant Properties */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Vacant Properties</CardTitle>
            <DoorOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{totalVacant}</div>
            <p className="text-xs text-gray-500 mt-1">Available for booking</p>
          </CardContent>
        </Card>

        {/* Occupied Properties */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Occupied Properties</CardTitle>
            <DoorClosed className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{totalOccupied}</div>
            <p className="text-xs text-gray-500 mt-1">Currently rented</p>
          </CardContent>
        </Card>

        {/* Occupancy Rate */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row item-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Occupancy Rate</CardTitle>
            <Home className="h-4 w-4 text-[#D2138C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-900">{occupancyPercent}%</div>
            <Progress
              value={occupancyProgressValue}
              className="mt-2 h-2"
              indicatorColor="bg-[#D2138C]"
            />
          </CardContent>
        </Card>
      </div>

      {/* Availability by suburb */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Availability by location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-black">Location</TableHead>
                  <TableHead className="text-black">Total</TableHead>
                  <TableHead className="text-black">Vacant</TableHead>
                  <TableHead className="text-black">Occupied</TableHead>
                  <TableHead className="text-black">Occupancy Rate</TableHead>
                  <TableHead className="text-black">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availabilityData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      No accommodations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  availabilityData.map((item, index) => {
                    const occupancyRate =
                      item.totalProperties > 0
                        ? (item.occupied / item.totalProperties) * 100
                        : 0;

                    return (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="text-gray-900">{item.suburb}</TableCell>
                        <TableCell className="text-gray-900">{item.totalProperties}</TableCell>

                        {/* Vacant */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">{item.vacant}</span>
                          </div>
                        </TableCell>

                        {/* Occupied */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-red-600">{item.occupied}</span>
                          </div>
                        </TableCell>

                        {/* Occupancy */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900">{Math.round(occupancyRate)}%</div>
                            <Progress
                              value={occupancyRate}
                              className="h-2 w-24"
                              indicatorColor="bg-[#D2138C]"
                            />
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge
                            variants="Secondary"
                            className={
                              occupancyRate >= 80
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : occupancyRate >= 50
                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }
                          >
                            {occupancyRate >= 80 ? "High" : occupancyRate >= 50 ? "Medium" : "Low"}
                          </Badge>
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
    </div>
  );
}

export default Availability;
