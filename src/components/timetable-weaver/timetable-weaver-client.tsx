
'use client';

import { useState, useEffect, useRef } from 'react';
import { ActionButtons } from '@/components/timetable-weaver/action-buttons';
import { DimensionControls } from '@/components/timetable-weaver/dimension-controls';
import { ScheduleGrid } from '@/components/timetable-weaver/schedule-grid';
import { initialScheduleData, initialDays, initialTimeSlots } from '@/components/timetable-weaver/data';
import type { ScheduleData, ScheduleEvent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Separator } from '../ui/separator';
import { AdsenseAd } from '../adsense-ad';
import { AdsteraAd } from '../adstera-ad';

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
  const [cellWidth, setCellWidth] = useState(110);
  const [cellHeight, setCellHeight] = useState(70);
  
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const data = urlParams.get('data');
      if (data) {
        const decoded = JSON.parse(atob(data));
        if (decoded.schedule) {
          setSchedule(decoded.schedule);
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
        if(decoded.schedule || decoded.days || decoded.timeSlots || decoded.headingText) {
            toast({
                title: "Shared Settings Loaded",
                description: "A shared schedule has been loaded from the URL.",
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
  }, [toast]);

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

  const handleMoveEvent = (sourceKey: string, destinationKey: string) => {
    setSchedule(prev => {
      const newSchedule = { ...prev };
      const eventToMove = newSchedule[sourceKey];
      
      if (!eventToMove) return prev;
      
      const sourceColSpan = eventToMove.colSpan || 1;
      const [destDayIndexStr, destTimeIndexStr] = destinationKey.split('-');
      const destDayIndex = parseInt(destDayIndexStr, 10);
      const destTimeIndex = parseInt(destTimeIndexStr, 10);

      // Check if the destination cells are available
      for (let i = 0; i < sourceColSpan; i++) {
        const key = `${destDayIndex}-${destTimeIndex + i}`;
        if (newSchedule[key]) {
          toast({
            variant: "destructive",
            title: "Cannot move event",
            description: "The destination cells are not empty.",
          });
          return prev;
        }
      }
      
      delete newSchedule[sourceKey];
      newSchedule[destinationKey] = eventToMove;

      return newSchedule;
    });
  };

  const handleShare = () => {
    try {
      const data = { schedule, days, timeSlots, headingText };
      const base64 = btoa(JSON.stringify(data));
      const url = `${window.location.origin}/?data=${encodeURIComponent(base64)}`;
      navigator.clipboard.writeText(url);
      toast({ title: "Link Copied!", description: "Schedule link copied to clipboard." });
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
        const rows = text.split('\n');
        const header = rows[0].split(',').map(h => h.trim());
        const dayIndex = header.indexOf('Day');
        const timeIndex = header.indexOf('Time');

        if (dayIndex === -1 || timeIndex === -1) {
            toast({ variant: "destructive", title: "Import Failed", description: "CSV must contain 'Day' and 'Time' columns." });
            return;
        }

        const importedDays = Array.from(new Set(rows.slice(1).map(row => row.split(',')[dayIndex].trim()).filter(Boolean)));
        const importedTimeSlots = Array.from(new Set(rows.slice(1).map(row => row.split(',')[timeIndex].trim()).filter(Boolean)));

        const newSchedule: ScheduleData = {};
        rows.slice(1).forEach(row => {
          const cols = row.split(',').map(c => c.trim());
          const day = cols[dayIndex];
          const time = cols[timeIndex];
          const dayIdx = importedDays.indexOf(day);
          const timeIdx = importedTimeSlots.indexOf(time);

          if (dayIdx !== -1 && timeIdx !== -1) {
              const key = `${dayIdx}-${timeIdx}`;
              const title = cols[header.indexOf('Title')] || '';
              const subtitle = cols[header.indexOf('Subtitle')] || '';
              const colSpan = parseInt(cols[header.indexOf('ColSpan')] || '1');
              
              newSchedule[key] = { title, subtitle, colSpan };
          }
        });
        
        setDays(importedDays);
        setTimeSlots(importedTimeSlots);
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
  
  const handleExport = async (format: 'PNG' | 'JPG' | 'PDF' | 'CSV') => {
    if (format === 'CSV') {
      try {
        const header = ['Day', 'Time', 'Title', 'Subtitle', 'ColSpan'];
        const rows = Object.entries(schedule).map(([key, event]) => {
          const [dayIndex, timeIndex] = key.split('-').map(Number);
          return [
            days[dayIndex],
            timeSlots[timeIndex],
            event.title,
            event.subtitle,
            event.colSpan || 1
          ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [header.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "schedule.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
          title: "Export Successful!",
          description: `Your schedule has been downloaded as a CSV file.`,
        });
      } catch (error) {
         console.error("CSV Export failed", error);
         toast({
          variant: "destructive",
          title: "Export Failed",
          description: "Could not generate CSV file.",
        });
      }
      return;
    }

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

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(printableRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (document) => {
            const body = document.body;
            body.style.backgroundColor = 'white';
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
    <div className={"min-h-svh bg-background"}>
        <div className="p-2 sm:p-4 md:p-8">
            <header className="flex flex-col sm:flex-row items-center justify-between mb-6 md:mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-headline text-primary">Routine Organizer by DesignPublic</h1>
                    <p className="text-sm text-muted-foreground">Craft your perfect schedule with ease.</p>
                </div>
                <DimensionControls
                    cellWidth={cellWidth}
                    onCellWidthChange={(value) => setCellWidth(value[0])}
                    cellHeight={cellHeight}
                    onCellHeightChange={(value) => setCellHeight(value[0])}
                />
            </header>
            <div className={'font-body'}>
              <ScheduleGrid 
              ref={printableRef}
              days={days}
              onDaysChange={setDays}
              timeSlots={timeSlots}
              onTimeSlotsChange={setTimeSlots}
              schedule={schedule}
              onUpdateEvent={handleUpdateEvent}
              onMoveEvent={handleMoveEvent}
              headingText={headingText}
              onHeadingTextChange={setHeadingText}
              isExporting={isExporting}
              cellWidth={cellWidth}
              cellHeight={cellHeight}
              />
            </div>

            <Separator className="my-8" />
            
            <div className="my-8">
              <AdsteraAd
                adKey="f987ffec7b67481c3b397f3fe2863149"
                width={468}
                height={60}
              />
              <AdsenseAd
                adClient="ca-pub-YOUR_PUBLISHER_ID"
                adSlot="YOUR_AD_SLOT_ID"
                style={{ display: 'block' }}
                adFormat="auto"
                fullWidthResponsive="true"
              />
            </div>
            
            <footer className="flex justify-center">
              <ActionButtons
                onShare={handleShare}
                onImport={handleImport}
                onExport={handleExport}
              />
            </footer>
        </div>
    </div>
  );
}
