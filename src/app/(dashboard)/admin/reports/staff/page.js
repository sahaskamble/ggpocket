'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, FileSpreadsheet, Clock, Users, Wallet, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getReportData } from '@/app/lib/api__structure';
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function StaffReport() {
  const [date, setDate] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const reportData = await getReportData(
          date.from.toISOString(),
          date.to.toISOString()
        );
        setData(reportData);
        toast.success('Staff report updated', {
          description: `Showing data from ${date.from.toLocaleDateString()} to ${date.to.toLocaleDateString()}`,
        });
      } catch (error) {
        console.error('Failed to fetch staff report:', error);
        toast.error('Failed to load staff data', {
          description: 'Please try again or contact support if the problem persists.',
          action: {
            label: 'Retry',
            onClick: () => fetchData()
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Process staff performance data for the chart
  const performanceData = data.staff.map(member => ({
    name: member.username || 'Unknown',
    sessions: data.metrics.staffPerformance[member.id]?.totalSessions || 0,
    revenue: data.metrics.staffPerformance[member.id]?.revenue || 0,
  })).sort((a, b) => b.revenue - a.revenue);

  console.log(data)
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <DatePickerWithRange date={date} setDate={setDate} />
        <div className="flex gap-2">
          <Button onClick={() => {}}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{data.metrics.totalStaff}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <div className="text-2xl font-bold">{data.metrics.activeStaff}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">₹{data.metrics.totalRevenue}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Staff Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <XAxis 
                    dataKey="name"
                    tickFormatter={(value) => value.split(' ')[0]}
                  />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Staff Member
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[0].payload.name}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <div>
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Sessions
                                </span>
                                <span className="block font-bold">
                                  {payload[0].payload.sessions}
                                </span>
                              </div>
                              <div>
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Revenue
                                </span>
                                <span className="block font-bold">
                                  ₹{payload[0].payload.revenue}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                    className="fill-primary"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.staff?.map((member) => {
                const performance = data.metrics.staffPerformance[member.id];
                return (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {member.username || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member?.username}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.role}
                        </div>
                      </div>
                    </div>
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff</TableHead>
              <TableHead>Sessions Handled</TableHead>
              <TableHead>Revenue Generated</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.staff.map((member) => {
              const performance = data.metrics.staffPerformance[member.id];
              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {member.username || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member?.username || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.role}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{performance?.totalSessions || 0}</TableCell>
                  <TableCell>₹{performance?.revenue || 0}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {performance?.avgRating || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 