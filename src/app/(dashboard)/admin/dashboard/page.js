'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  readDashboardCurrent,
  fetchSessions,
  getGamePlayStats,
  getPeakHours,
  fetchStaffLogins,
  getPaymentStats,
} from '@/app/lib/api__structure';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ChartContainer, ChartTooltip, ChartTooltipContent, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/theme/mode-toggle";
import {
  Users,
  MonitorPlay,
  DollarSign,
  Clock,
  TrendingUp,
  CreditCard,
  Wallet,
  Smartphone,
} from "lucide-react";
import { useTheme } from 'next-themes';
import { Separator } from '@/components/ui/separator';

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="hsl(var(--foreground))"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const formatHour = (hour) => {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}${ampm}`;
};

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [gameStats, setGameStats] = useState([]);
  const [staffLogins, setStaffLogins] = useState([]);
  const [paymentStats, setPaymentStats] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const chartColors = {
    primary: `hsl(var(--chart-1))`,
    secondary: `hsl(var(--chart-2))`,
    tertiary: `hsl(var(--chart-3))`,
    grid: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    text: `hsl(var(--foreground))`
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboard, sessionsData, gamesData, staffData, payments, hoursData] = await Promise.all([
          readDashboardCurrent(),
          fetchSessions(1, 5),
          getGamePlayStats(),
          fetchStaffLogins(1, 5),
          getPaymentStats(),
          getPeakHours()
        ]);

        setDashboardData(dashboard);
        setSessions(sessionsData.items);
        setGameStats(gamesData);
        setStaffLogins(staffData.items);
        setPaymentStats(payments);
        setPeakHours(hoursData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getPaymentIcon = (mode) => {
    switch (mode.toUpperCase()) {
      case 'UPI':
        return <Smartphone className="mr-2 h-4 w-4 text-muted-foreground" />;
      case 'CASH':
      default:
        return <Wallet className="mr-2 h-4 w-4 text-muted-foreground" />;
    }
  };

  console.log(paymentStats)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <div></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <MonitorPlay className="h-8 w-8 text-white p-2 bg-blue-500 rounded-md" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.activeSessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardData?.sessionGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-8 w-8 text-white p-2 bg-blue-500 rounded-md" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{dashboardData?.todayRevenue || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardData?.revenueGrowth || 0}% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Users className="h-8 w-8 text-white p-2 bg-blue-500 rounded-md" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffLogins.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all branches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Session Time</CardTitle>
            <Clock className="h-8 w-8 text-white p-2 bg-blue-500 rounded-md" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.avgSessionTime || '1.5'}h</div>
            <p className="text-xs text-muted-foreground">
              Per customer session
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col justify-between gap-4">
          <Card className="col-span-1 row-span-2">
            <CardHeader>
              <CardTitle>Popular Games</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4 flex-col items-center">
              <div className="relative h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gameStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      innerRadius={60}
                      outerRadius={120}
                      fill={chartColors.primary}
                      dataKey="plays"
                      nameKey="name"
                    >
                      {gameStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? 'hsl(var(--card))' : '#fff',
                        borderColor: 'hsl(var(--border))',
                        color: chartColors.text
                      }}
                      formatter={(value, name) => [`${value} plays`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Plays</p>
                    <p className="text-3xl font-bold">
                      {gameStats.reduce((sum, game) => sum + game.plays, 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 w-full space-y-2">
                {gameStats.map((game, index) => (
                  <div key={game.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))` }}
                    />
                    <span className="flex-1 text-sm">{game.name}</span>
                    <span className="text-sm text-muted-foreground">{game.plays} plays</span>
                  </div>
                ))}
              </div>

              {/*<Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  {paymentStats.map((mode, index) => (
                    <div

                      key={index}
                    >{mode.mode}</div>
                  ))}
                </CardContent>
              </Card>*/}
              <Separator />

              <div className='w-full'>
                <div className="font-bold lg:text-xl">Payment mode used</div>
                <div>
                  {paymentStats.map((mode, index) => (
                    <div key={index}>
                      <div className="flex items-center">
                        {getPaymentIcon(mode.mode)}
                        <div className="inline-flex items-center gap-4">
                          <p>{mode.mode}</p>
                          <p>{mode.count} | transactions {mode.precentage}%</p>
                        </div>
                      </div>
                      <div class="div"></div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="col-span-3 row-span-2 col-start-2">
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
            <p className="text-sm text-muted-foreground">
              Busiest hours throughout the day
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={peakHours}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartColors.grid}
                  vertical={false}
                />
                <XAxis
                  dataKey="hour"
                  tickFormatter={formatHour}
                  stroke={chartColors.text}
                  tick={{ fill: chartColors.text }}
                  interval={2}
                />
                <YAxis
                  stroke={chartColors.text}
                  tick={{ fill: chartColors.text }}
                  label={{
                    value: 'Number of Sessions',
                    angle: -90,
                    position: 'insideLeft',
                    fill: chartColors.text
                  }}
                />
                <Tooltip
                  labelFormatter={formatHour}
                  formatter={(value) => [`${value} sessions`, 'Active Sessions']}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? 'hsl(var(--card))' : '#fff',
                    borderColor: 'hsl(var(--border))',
                    color: chartColors.text
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke={`hsl(var(--chart-2))`}
                  strokeWidth={2}
                  dot={{
                    fill: `hsl(var(--chart-2))`,
                    stroke: `hsl(var(--chart-2))`,
                    r: 4
                  }}
                  activeDot={{
                    fill: `hsl(var(--chart-2))`,
                    stroke: `hsl(var(--background))`,
                    strokeWidth: 2,
                    r: 6
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {session.expand?.customer_id?.customer_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">
                          {session.expand?.customer_id?.customer_name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{session.expand?.game_id?.name}</TableCell>
                    <TableCell>₹{session.total_amount}</TableCell>
                    <TableCell>
                      <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                        {session.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Login Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffLogins.map((login) => (
                  <TableRow key={login.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {login.expand?.user_id?.username?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">
                          {login.expand?.user_id?.username}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{login.expand?.branch_id?.name}</TableCell>
                    <TableCell>
                      {new Date(login.login_time).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
