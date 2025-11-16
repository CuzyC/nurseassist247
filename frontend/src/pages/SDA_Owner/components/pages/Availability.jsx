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
import {
  Building2,
  CheckCircle2,
  XCircle,
  Home,
  DoorOpen,
  DoorClosed,
} from "lucide-react";

const availabilityData = [
  {
    suburb: "Green Point",
    totalProperties: 15,
    vacant: 8,
    occupied: 7,
  },
  {
    suburb: "Observatory",
    totalProperties: 12,
    vacant: 2,
    occupied: 10,
  },
  {
    suburb: "Woodstock",
    totalProperties: 20,
    vacant: 2,
    occupied: 8,
  },
  {
    suburb: "Sea Point",
    totalProperties: 18,
    vacant: 5,
    occupied: 13,
  },
  {
    suburb: "Rondebosch",
    totalProperties: 10,
    vacant: 6,
    occupied: 4,
  },
  {
    suburb: "Claremont",
    totalProperties: 14,
    vacant: 9,
    occupied: 5,
  },
];

function Availability() {
  const totalProperties = availabilityData.reduce(
    (sum, item) => sum + item.totalProperties,
    0
  );
  const totalVacant = availabilityData.reduce(
    (sum, item) => sum + item.vacant,
    0
  );
  const totalOccupied = availabilityData.reduce(
    (sum, item) => sum + item.occupied,
    0
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Proprties */}
        <Card className="shadow=md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-[#D2138C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2x1 text-gray-900">{totalProperties}</div>
            <p className="text-xs text-gray-500 mt-1">Across all suburbs</p>
          </CardContent>
        </Card>

        {/* Vacant Properties */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Vacant Properties</CardTitle>
            <DoorOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2x1 text-green-600">{totalVacant}</div>
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
            <div className="text-2x1 text-red-600">{totalOccupied}</div>
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
            <div className="text-2x1 text-gray-900">
              {Math.round((totalOccupied / totalProperties) * 100)}
            </div>
            <Progress
              value={(totalOccupied / totalProperties) * 100}
              className="mt-2 h-2"
              indicatorColor="bg-[#D2138C]"
            />
          </CardContent>
        </Card>
      </div>

      {/* Availability by suburb */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Availability by suburb</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-1g border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-black">Suburb</TableHead>
                  <TableHead className="text-black">Total</TableHead>
                  <TableHead className="text-black">Vacant</TableHead>
                  <TableHead className="text-black">Occupied</TableHead>
                  <TableHead className="text-black">Occupancy Rate</TableHead>
                  <TableHead className="text-black">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availabilityData.map((item, index) => {
                  const occupancyRate =
                    (item.occupied / item.totalProperties) * 100;

                  return (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="text-gray-900">
                        {item.suburb}
                      </TableCell>
                      <TableCell className="text-gray-900">
                        {item.totalProperties}
                      </TableCell>

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
                          <div className="text-sm text-gray-900">
                            {Math.round(occupancyRate)}%
                          </div>
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
                          {occupancyRate >= 80
                            ? "High"
                            : occupancyRate >= 50
                            ? "Medium"
                            : "Low"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Availability;
