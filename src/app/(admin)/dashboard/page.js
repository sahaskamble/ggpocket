"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/db_data_helper";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { API_URL } from "@/lib/constants";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Pie, PieChart, Cell } from "recharts";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalRevenue: "0.00",
    todayBookings: 0,
    activeUsers: 0,
    activeSessionsCount: 0,
    activeSessionsDetails: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    async function fetchDashboardData() {
      try {
        const branchId = localStorage.getItem('branchid');
        console.log('Using branch ID:', branchId); // Add this line
        if (!branchId) {
          console.error('No branch ID found in localStorage');
          return;
        }
        const dashboardStats = await getDashboardStats(branchId, dateRange);
        setStats(dashboardStats);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user, router, dateRange]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (!user || loading) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="flex h-16 items-center px-4 justify-between">
          <div className="w-full h-full flex items-center gap-4">
            <SidebarTrigger className="ml-1" />
            <h2 className="text-lg font-semibold">GameGround Dashboard</h2>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <Select
            value={dateRange}
            onValueChange={setDateRange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="1week">Last Week</SelectItem>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue}</div>
              <p className="text-xs text-muted-foreground">
                All time revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayBookings}</div>
              <p className="text-xs text-muted-foreground">
                Sessions today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                Currently online
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSessionsCount}</div>
              <p className="text-xs text-muted-foreground">
                Running sessions
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 mt-8">
          <div className="grid grid-cols-3 gap-4">
            {/* Game Categories Small Pie Chart - Now takes 1/3 of the space */}
            <Card className="col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Popular Games</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center pt-2">
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.gameCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.gameCategoryData?.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Sessions - Now takes 2/3 of the space */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
              </CardHeader>
              <ScrollArea className="h-[250px]">
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentSessions?.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={`${API_URL}api/files/users/${session.user_id}/${session.user_image}`} alt={session.customerName} />
                            <AvatarFallback>{session.customerName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{session.customerName}</p>
                            <p className="text-sm text-muted-foreground">{session.station}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{session.amount}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.endTime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </ScrollArea>
            </Card>
          </div>

          {/* Popular Games List - Full width below */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Games List</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[300px]">
              <CardContent>
                <div className="space-y-4">
                  {stats.popularGames?.map((game) => (
                    <div key={game.id} className="flex items-center space-x-4 p-2 border rounded">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`${API_URL}api/files/inventory/${game.id}/${game.game_image}`} alt={game.name} />
                        <AvatarFallback>{game.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{game.name}</p>
                        <p className="text-sm text-muted-foreground">{game.category}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Score: {game.popularity}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      </main>
    </div>
  );
}