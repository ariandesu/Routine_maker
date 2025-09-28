'use client';

import { useState, useEffect, useRef } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { ControlPanel } from '@/components/timetable-weaver/control-panel';
import { ScheduleGrid } from '@/components/timetable-weaver/schedule-grid';
import { initialScheduleData, days, initialTimeSlots } from '@/components/timetable-weaver/data';
import type { ScheduleData, ScheduleEvent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/context/theme-provider';
import { cn } from '@/lib/utils';

export default function TimetableWeaverClient() {
  const [schedule, setSchedule] = useState<ScheduleData>(initialScheduleData);
  const [timeSlots, setTimeSlots] = useState<string[]>(initialTimeSlots);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  const printableRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { font, setFont, theme, setTheme } = useTheme();

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const data = urlParams.get('data');
      if (data) {
        const decoded = JSON.parse(atob(data));
        if (decoded.schedule) {
          setSchedule(decoded.schedule);
        }
        if (decoded.font) {
            setFont(decoded.font as any);
        }
        if (decoded.theme) {
            setTheme(decoded.theme as any);
        }
        if (decoded.timeSlots) {
            setTimeSlots(decoded.timeSlots);
        }
        if(decoded.schedule || decoded.font || decoded.theme || decoded.timeSlots) {
            toast({
                title: "Shared Settings Loaded",
                description: "A shared schedule and/or appearance settings have been loaded from the URL.",
            });
        }
      }
    } catch (error) {
      console.error("Failed to parse data from URL", error);
       toast({
        variant: "destructive",
        title: "Error loading settings",
        description: "Could not load the shared settings from the URL.",
      });
    } finally {
      setIsMounted(true);
    }
  }, [toast, setFont, setTheme]);

  const handleUpdateEvent = (key: string, event: ScheduleEvent | null) => {
    setSchedule(prev => {
      const newSchedule = { ...prev };
      if (event) {
        newSchedule[key] = event;
      } else {
        delete newSchedule[key];
      }
      return newSchedule;
    });
  };

  const handleShare = () => {
    try {
      const themeData = {
          font: localStorage.getItem('timetable-font') || 'font-body',
          theme: localStorage.getItem('timetable-theme') || 'theme-indigo',
      }
      const data = { schedule, timeSlots, ...themeData };
      const base64 = btoa(JSON.stringify(data));
      const url = `${window.location.origin}/?data=${encodeURIComponent(base64)}`;
      navigator.clipboard.writeText(url);
      toast({ title: "Link Copied!", description: "Schedule and appearance settings link copied to clipboard." });
    } catch (error) {
      console.error("Failed to create share link", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create shareable link.",
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const rows = text.split('\n').slice(1); // Skip header row
        const newSchedule: ScheduleData = {};
        rows.forEach(row => {
          const [key, title, subtitle, color] = row.split(',');
          if (key && title && subtitle && color) {
            newSchedule[key.trim()] = { title: title.trim(), subtitle: subtitle.trim(), color: color.trim() };
          }
        });
        setSchedule(newSchedule);
        toast({ title: "Import Successful", description: "Schedule has been imported from CSV." });
      } catch (error) {
        console.error("Failed to import CSV", error);
        toast({ variant: "destructive", title: "Import Failed", description: "The CSV file could not be parsed." });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };
  
  const handleExport = (format: 'PNG' | 'JPG' | 'PDF') => {
    toast({
      title: "Export not implemented",
      description: `This is a demo. ${format} export functionality would be added here.`,
    });
  };

  if (!isMounted) {
    return (
       <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className={cn(theme)}>
        <SidebarProvider>
        <Sidebar collapsible={isMobile ? "offcanvas" : "icon"}>
            <ControlPanel 
              onShare={handleShare}
              onImport={handleImport}
              onExport={handleExport}
              timeSlots={timeSlots}
              onTimeSlotsChange={setTimeSlots}
            />
        </Sidebar>
        <SidebarInset>
            <div className={cn("p-4 md:p-8", font)}>
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                    <SidebarTrigger className="hidden md:flex" />
                    <div>
                        <h1 className="text-4xl font-bold font-headline text-primary">Timetable Weaver</h1>
                        <p className="text-muted-foreground">Craft your perfect schedule with ease.</p>
                    </div>
                    </div>
                    <SidebarTrigger className="flex md:hidden" />
                </header>
                <ScheduleGrid 
                ref={printableRef}
                days={days}
                timeSlots={timeSlots}
                schedule={schedule}
                onUpdateEvent={handleUpdateEvent}
                />
            </div>
        </SidebarInset>
        </SidebarProvider>
    </div>
  );
}
