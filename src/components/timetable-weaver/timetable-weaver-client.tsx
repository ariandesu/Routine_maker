
'use client';

import { useState, useEffect, useRef } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { ControlPanel } from '@/components/timetable-weaver/control-panel';
import { ScheduleGrid } from '@/components/timetable-weaver/schedule-grid';
import { initialScheduleData, initialDays, initialTimeSlots } from '@/components/timetable-weaver/data';
import type { ScheduleData, ScheduleEvent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/context/theme-provider';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function TimetableWeaverClient() {
  const [schedule, setSchedule] = useState<ScheduleData>(initialScheduleData);
  const [days, setDays] = useState<string[]>(initialDays);
  const [timeSlots, setTimeSlots] = useState<string[]>(initialTimeSlots);
  const [headingText, setHeadingText] = useState<string>('My Weekly Schedule');
  const [isMounted, setIsMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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
        if (decoded.days) {
            setDays(decoded.days);
        }
        if (decoded.timeSlots) {
            setTimeSlots(decoded.timeSlots);
        }
        if (decoded.headingText) {
          setHeadingText(decoded.headingText);
        }
        if(decoded.schedule || decoded.font || decoded.theme || decoded.days || decoded.timeSlots || decoded.headingText) {
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

  const handleUpdateEvent = (key: string, event: ScheduleEvent | null, keysToRemove: string[] = []) => {
    setSchedule(prev => {
      const newSchedule = { ...prev };
      if (event) {
        newSchedule[key] = event;
      } else {
        delete newSchedule[key];
      }
      keysToRemove.forEach(k => delete newSchedule[k]);
      return newSchedule;
    });
  };

  const handleShare = () => {
    try {
      const themeData = {
          font: localStorage.getItem('timetable-font') || 'font-body',
          theme: localStorage.getItem('timetable-theme') || 'theme-indigo',
      }
      const data = { schedule, days, timeSlots, headingText, ...themeData };
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
  
  const handleExport = async (format: 'PNG' | 'JPG' | 'PDF') => {
    if (!printableRef.current) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not find the schedule element to export.",
      });
      return;
    }

    setIsExporting(true);

    toast({
      title: "Exporting...",
      description: `Your schedule is being prepared as a ${format} file.`,
    });

    // Use a short timeout to allow the UI to update with isExporting=true
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(printableRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (document) => {
            const body = document.body;
            const root = document.documentElement;
            const themeClassName = theme || 'theme-indigo';
            
            body.classList.add(themeClassName);
            root.classList.add(themeClassName);
            
            const style = window.getComputedStyle(document.body);
            const bgColor = style.getPropertyValue('--card').trim();
            if (bgColor) {
                body.style.backgroundColor = `hsl(${bgColor})`;
            }
        },
      });
      setIsExporting(false);

      const cleanFileName = headingText.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `${cleanFileName || 'schedule'}.${format.toLowerCase()}`;
      
      if (format === 'PDF') {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(fileName);
      } else {
        const image = canvas.toDataURL(`image/${format.toLowerCase()}`, 0.9);
        const link = document.createElement('a');
        link.href = image;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      toast({
        title: "Export Successful!",
        description: `Your schedule has been downloaded as a ${format} file.`,
      });
    } catch (error) {
      setIsExporting(false);
      console.error("Export failed", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "An unexpected error occurred during the export process.",
      });
    }
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
    <div className={cn(theme, "min-h-svh")}>
        <SidebarProvider>
        <Sidebar collapsible="offcanvas">
            <ControlPanel 
              onShare={handleShare}
              onImport={handleImport}
              onExport={handleExport}
            />
        </Sidebar>
        <SidebarInset>
            <div className="p-2 sm:p-4 md:p-8">
                <header className="flex items-center justify-between mb-6 md:mb-8">
                    <div className="flex items-center gap-2 sm:gap-4">
                    <SidebarTrigger />
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-headline text-primary">Routine Organizer by MHR3D</h1>
                        <p className="text-sm text-muted-foreground">Craft your perfect schedule with ease.</p>
                    </div>
                    </div>
                </header>
                <div className={cn(font)}>
                  <ScheduleGrid 
                  ref={printableRef}
                  days={days}
                  onDaysChange={setDays}
                  timeSlots={timeSlots}
                  onTimeSlotsChange={setTimeSlots}
                  schedule={schedule}
                  onUpdateEvent={handleUpdateEvent}
                  headingText={headingText}
                  onHeadingTextChange={setHeadingText}
                  isExporting={isExporting}
                  />
                </div>
            </div>
        </SidebarInset>
        </SidebarProvider>
    </div>
  );
}
