'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";
import { ModeToggle } from '../theme/mode-toggle';

export default function AppHeader() {
  const pathname = usePathname();
  const title = pathname.split('/').pop()?.replace(/^\w/, c => c.toUpperCase());

  return (
    <header className="sticky w-full top-0 z-40 border-b bg-background">
      <div className="flex h-12 items-center gap-4 px-6">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <div className="w-full flex justify-between items-center gap-2">
          <h1 className="text-lg font-semibold">{title}</h1>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}