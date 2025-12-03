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
import { Calendar } from "@/components/ui/calendar";
import {
  ArrowRight,
  Users,
  Activity,
  TrendingUp,
  Database,
} from "lucide-react";

function BentoCard({
  title,
  value,
  icon: Icon,
  trend,
  className = "",
  iconClassName = "",
}) {
  return (
    <div
      className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm mb-2">{title}</p>
          <p className="text-3xl mb-1">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp size={14} />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconClassName}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ user, action, time, type }) {
  const colors = {
    success: "bg-green-100 text-green-600",
    warning: "bg-yellow-100 text-yellow-600",
    info: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className={`p-2 rounded-full ${colors[type]}`}>
        <Activity size={14} />
      </div>
      <div className="flex-1">
        <p className="text-sm">{user}</p>
        <p className="text-xs text-gray-500">{action}</p>
      </div>
      <p className="text-xs text-gray-400">{time}</p>
    </div>
  );
}

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [date, setDate] = useState(new Date())

  const username = "Joe";

  // KPIs in the header
  const kpis = [
    { label: "Total Users", value: 0 },
    { label: "Total SDA Owners", value: 0 },
    { label: "Total Properties", value: 0 },
  ];

  const activities = [
    {
      user: "John Smith",
      action: "Created new SDA admin account",
      time: "5 min ago",
      type: "success",
    },
    {
      user: "Sarah Johnson",
      action: "Modified user permissions",
      time: "12 min ago",
      type: "info",
    },
    {
      user: "Mike Wilson",
      action: "Failed login attempt",
      time: "23 min ago",
      type: "warning",
    },
    {
      user: "Emily Davis",
      action: "Deleted accommodation record",
      time: "1 hour ago",
      type: "info",
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4">
      {/* Header: same pattern as SDA owner dashboard */}
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 pb-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-black">
          {username ? `Hello there, ${username}!` : "Hello there!"}
        </h1>

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

      {/* Main  */}
      <div className="flex flex-row gap-6">
        {/* LEFT COLUMN */}
        <div className="flex-1 space-y-6">

          {/* RECENT ACTIVITIES: 4 only activities */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Recent Activity</CardTitle>
              <Button variant="outline" size="sm" className="rounded-full">
                <ArrowRight className="mr-2" /> View all
              </Button>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground">
                  no recent activity
                </div>
              ) : (
                <div className="space-y-1">
                  {activities.map((activity, index) => (
                    <ActivityItem key={index} {...activity} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* USERS: 4 users only will be show */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Users</CardTitle>

              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <ArrowRight className="mr-2" /> View all
              </Button>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="overflow-x-auto">
                <Table>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground"
                        >
                          no users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      limitedUsers.map((user) => (
                        <TableRow
                          key={user.id}
                          className="text-gray-700"
                        >
                          <TableCell className="text-center font-medium">
                            {accommodation.name}
                          </TableCell>
                          <TableCell className="text-center">
                            {accommodation.role}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: System overview cards */}
        <div className="flex-1 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: stack of system cards */}
            <div className="space-y-6">
              <BentoCard
                title="System Uptime"
                value="99.9%"
                icon={Activity}
                iconClassName="bg-purple-500"
              />

              <BentoCard
                title="New User Registered"
                value="12"
                icon={Users}
                iconClassName="bg-orange-500"
              />

              <BentoCard
                title="Database Size"
                value="2.3 GB"
                icon={Database}
                iconClassName="bg-indigo-500"
              />
            </div>

            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full rounded-lg border"
            />

          </div>

          {/* sda owner: 4 users only will be show */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">SDA Owner</CardTitle>

              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <ArrowRight className="mr-2" /> View all
              </Button>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="overflow-x-auto">
                <Table>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground"
                        >
                          no sda owners found
                        </TableCell>
                      </TableRow>
                    ) : (
                      limitedUsers.map((sdaOwner) => (
                        <TableRow
                          key={sdaOwner.id}
                          className="text-gray-700"
                        >
                          <TableCell className="text-center font-medium">
                            {sdaOwner.name}
                          </TableCell>
                          <TableCell className="text-center">
                            {sdaOwner.email}
                          </TableCell>
                          <TableCell className="text-center">
                            {sdaOwner.phone}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* ADD MORE IF STATS IF EVER... */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
