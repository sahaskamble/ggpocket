'use client';

import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';

const reportTabs = [
  { value: 'expenses', label: 'Expenses', path: '/admin/reports/expenses' },
  { value: 'staff', label: 'Staff', path: '/admin/reports/staff' },
  { value: 'cashlog', label: 'Cash Log', path: '/admin/reports/cashlog' },
  { value: 'customers', label: 'Customers', path: '/admin/reports/customers' },
];

export default function ReportsLayout({ children }) {
  const pathname = usePathname();
  const currentTab = pathname.split('/').pop();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
      </div>

      <Tabs value={currentTab} className="space-y-6">
        <TabsList>
          {reportTabs.map((tab) => (
            <Link key={tab.value} href={tab.path}>
              <TabsTrigger value={tab.value}>{tab.label}</TabsTrigger>
            </Link>
          ))}
        </TabsList>
        {children}
      </Tabs>
    </div>
  );
} 