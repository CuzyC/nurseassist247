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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

function OwnerDashboard() {
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
          {/* <Button 
                        variant="secondary" 
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                    >
                        View Reports
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button> */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm text-gray-600">
              Total Properties
            </CardTitle>
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl mb-2 text-gray-900">12</div>

            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 text-xs"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                +2 this month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm text-gray-600">
              Vacant Rooms
            </CardTitle>
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              <Home className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl mb-2 text-gray-900">8</div>

            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 text-xs"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Available now
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm text-gray-600">
              Occupied Rooms
            </CardTitle>
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Users className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl mb-2 text-gray-900">4</div>

            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-700 text-xs"
              >
                <Clock className="h-3 w-3 mr-1" />
                Currently occupied
              </Badge>
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
            <div className="text-4xl mb-2 text-gray-900">33%</div>
            <Progress
              value={33}
              className="h-2 mt-2"
              indicatorColor="bg-gradient-to-br from-[#D2138C] to-[#B01076]"
            />
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto py-6 flex-col items-start gap-2 hover:bg-[#D2138C]/5 hover:border-[#D2138C] transition-all group"
            >
              <Building2 className="h-6 w-6 text-[#D2138C]" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">Add Property</div>
                <div className="text-xs text-gray-500 mt-1">
                  Create new accommodation
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-6 flex-col items-start gap-2 hover:bg-blue-50 hover:border-blue-500 transition-all group"
            >
              <Calendar className="h-6 w-6 text-blue-500" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">
                  Update Availability
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Manage room status
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-6 flex-col items-start gap-2 hover:bg-purple-50 hover:border-purple-500 transition-all group"
            >
              <MapPin className="h-6 w-6 text-purple-500" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">
                  View Locations
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  See all properties
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Property Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#D2138C]" />
              Recent Activity
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Latest updates from your properties
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-transparent border border-green-100 hover:shadow-md transition-all">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    New accommodation added
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Green Point Apartment - 2 Bedroom
                  </p>
                  <p className="text-xs text-gray-400 mt-1">2 days ago</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-transparent border border-blue-100 hover:shadow-md transition-all">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    Property details updated
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Sea Point Studio - Updated photos
                  </p>
                  <p className="text-xs text-gray-400 mt-1">5 days ago</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-transparent border border-purple-100 hover:shadow-md transition-all">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    Room marked as occupied
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Observatory House - Room 3B
                  </p>
                  <p className="text-xs text-gray-400 mt-1">1 week ago</p>
                </div>
              </div>
            </div>
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
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#D2138C] to-[#B01076] flex items-center justify-center shadow-lg shadow-pink-500/30">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Apartments</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg text-gray-900">7</p>
                    <Badge
                      variant="secondary"
                      className="bg-pink-100 text-pink-700 text-xs"
                    >
                      58%
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={58}
                  className="h-2.5"
                  indicatorColor="bg-gradient-to-br from-[#D2138C] to-[#B01076]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <Home className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Houses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg text-gray-900">3</p>
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-purple-700 text-xs"
                    >
                      25%
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={25}
                  className="h-2.5"
                  indicatorColor="bg-gradient-to-br from-purple-500 to-purple-600"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Villa</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg text-gray-900">2</p>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 text-xs"
                    >
                      17%
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={17}
                  className="h-2.5"
                  indicatorColor="bg-gradient-to-br from-blue-500 to-blue-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OwnerDashboard;
