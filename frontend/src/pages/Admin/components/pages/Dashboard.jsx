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
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit, Trash2, Building2, Home } from "lucide-react";

// same endpoint you used in ManageAccommodations.jsx
const API_URL = "http://localhost:5000/api/accommodations";

function Dashboard() {
  const [accommodations, setAccommodations] = useState([]);
  const [total, setTotal] = useState(0);
  const [vacantCount, setVacantCount] = useState(0);

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    try {
      const res = await fetch(API_URL, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        // normalize once here
        const normalized = Array.isArray(data)
          ? data.map((a) => ({
              ...a,
              // turn undefined / null / "   Vacant  " into clean lowercase
              _status: (a.vacant_status || a.status || "").trim().toLowerCase(),
            }))
          : [];

        setAccommodations(normalized);
        setTotal(normalized.length);
        setVacantCount(normalized.filter((a) => a._status === "vacant").length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Accommodations</CardTitle>
            <Building2 className="h-4 w-4 text-[#D2138C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-900">{total}</div>
            <p className="text-xs text-gray-500 mt-1">Active listings</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Vacant Accomodations</CardTitle>
            <Home className="h-4 w-4 text-[#D2138C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-900">{vacantCount}</div>
            <p className="text-xs text-gray-500 mt-1">Available now</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent accommodations */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Accommodations</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 ">
                  <TableHead className="text-black text-center">
                    Accommodation Type
                  </TableHead>
                  <TableHead className="text-black text-center">
                    Room Configuration
                  </TableHead>
                  <TableHead className="text-black text-center">
                    Suburb
                  </TableHead>
                  <TableHead className="text-black text-center">
                    Vacant Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accommodations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-gray-400"
                    >
                      No accommodations yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  [...accommodations]
                    .reverse()
                    .slice(0, 5)
                    .map((item) => {
                      const isVacant = item._status === "vacant";
                      return (
                        <TableRow key={item.id} className="text-center">
                          <TableCell className="text-gray-600">
                            {item.acc_type}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {item.configuration}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {item.suburb}
                          </TableCell>
                          <TableCell>
                            {isVacant ? (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                                Vacant
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
                                Occupied
                              </Badge>
                            )}
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

export default Dashboard;
