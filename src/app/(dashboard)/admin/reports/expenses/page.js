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
import { 
  Download, 
  FileSpreadsheet, 
  TrendingDown,
  ShoppingCart,
  Wrench,
  Receipt,
  Building2
} from "lucide-react";
import { getReportData } from '@/app/lib/api__structure';
import { toast } from "sonner";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export default function ExpensesReport() {
  const [date, setDate] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const expenseCategories = [
    { name: 'Inventory', icon: ShoppingCart },
    { name: 'Maintenance', icon: Wrench },
    { name: 'Utilities', icon: Building2 },
    { name: 'Others', icon: Receipt }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const reportData = await getReportData(
          date.from.toISOString(),
          date.to.toISOString()
        );
        setData(reportData);
        toast.success('Expenses report updated', {
          description: `Showing data from ${date.from.toLocaleDateString()} to ${date.to.toLocaleDateString()}`,
        });
      } catch (error) {
        console.error('Failed to fetch expenses:', error);
        toast.error('Failed to load expenses', {
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

  // Process expenses data for charts
  const expensesByCategory = {
    Inventory: 25000,
    Maintenance: 15000,
    Utilities: 10000,
    Others: 5000
  };

  const expenseData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    category,
    amount,
    color: `hsl(var(--chart-${Object.keys(expensesByCategory).indexOf(category) + 1}))`
  }));

  const monthlyExpenses = [
    { month: 'Jan', amount: 45000 },
    { month: 'Feb', amount: 52000 },
    { month: 'Mar', amount: 55000 },
    // Add more months...
  ];

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

      <div className="grid grid-cols-4 gap-4">
        {expenseCategories.map(({ name, icon: Icon }) => (
          <Card key={name}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div className="text-2xl font-bold">
                  ₹{expensesByCategory[name].toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Monthly Expenses Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyExpenses}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Month
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[0].payload.month}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Expenses
                              </span>
                              <span className="font-bold">
                                ₹{payload[0].value}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="amount"
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
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="amount"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Category
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {data.category}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Amount
                              </span>
                              <span className="font-bold">
                                ₹{data.amount}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {expenseData.map((category) => (
                <div key={category.category} className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="flex-1 text-sm">{category.category}</span>
                  <span className="text-sm text-muted-foreground">
                    ₹{category.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Mode</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Sample expense entries - replace with real data */}
            <TableRow>
              <TableCell>{new Date().toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant="outline">Inventory</Badge>
              </TableCell>
              <TableCell>PlayStation 5 Controllers Restock</TableCell>
              <TableCell>₹15,000</TableCell>
              <TableCell>Bank Transfer</TableCell>
              <TableCell>
                <Badge>Paid</Badge>
              </TableCell>
            </TableRow>
            {/* Add more rows */}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 