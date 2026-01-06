
'use client';

import { useState, useEffect, useRef } from 'react';
import { ActionButtons } from '@/components/timetable-weaver/action-buttons';
import { DimensionControls } from '@/components/timetable-weaver/dimension-controls';
import { ScheduleGrid } from '@/components/timetable-weaver/schedule-grid';
import { initialScheduleData, initialDays, initialTimeSlots } from '@/components/timetable-weaver/data';
import type { ScheduleData, ScheduleEvent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn, compressData, decompressData } from '@/lib/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Separator } from '../ui/separator';
import { AdsteraAd } from '../adstera-ad';
import Loader from '../loader';

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
        const decoded = decompressData(data);
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
      const compressed = compressData(data);
      const url = `${window.location.origin}/?data=${compressed}`;
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

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const rows = text.split('\n').slice(1);
        const newSchedule: ScheduleData = {};
        const newDays = [...days];
        const newTimeSlots = [...timeSlots];

        rows.forEach(row => {
          if (!row.trim()) return;
          const [day, time, title, subtitle, colSpan] = row.split(',');

          let dayIndex = newDays.indexOf(day);
          if (dayIndex === -1) {
            dayIndex = newDays.length;
            newDays.push(day);
          }

          let timeIndex = newTimeSlots.indexOf(time);
          if (timeIndex === -1) {
            timeIndex = newTimeSlots.length;
            newTimeSlots.push(time);
          }

          const key = `${dayIndex}-${timeIndex}`;
          newSchedule[key] = {
            title: title || '',
            subtitle: subtitle || '',
            colSpan: colSpan ? parseInt(colSpan, 10) : 1,
          };
        });

        setDays(newDays);
        setTimeSlots(newTimeSlots);
        setSchedule(newSchedule);
        toast({
          title: "Import Successful!",
          description: "Your schedule has been imported from the CSV file.",
        });
      } catch (error) {
        console.error("CSV Import failed", error);
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: "Could not parse the CSV file. Please check the format.",
        });
      }
    };
    reader.readAsText(file);
  };

  if (!isMounted) {
    return (
      <div className="w-full h-svh flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className={"min-h-svh bg-background"}>
        <div className="p-2 sm:p-4 md:p-8">
            <header className="flex flex-col sm:flex-row items-center justify-between mb-6 md:mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-headline text-primary">Routine Organizer by MHR3D</h1>
                    <p className="text-sm text-muted-foreground">Craft your perfect schedule with ease.</p>
                </div>
                <div className="flex flex-col gap-4 items-center sm:items-end">
                  <ActionButtons
                      onShare={handleShare}
                      onExport={handleExport}
                      onImport={handleImport}
                  />
                  <DimensionControls
                      cellWidth={cellWidth}
                      onCellWidthChange={(value) => setCellWidth(value[0])}
                      cellHeight={cellHeight}
                      onCellHeightChange={(value) => setCellHeight(value[0])}
                  />
                </div>
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
            
            <div className="my-8 flex justify-center">
              <AdsteraAd
                adKey="7a4e124a397cf3d963a6f15182dc5fde"
                width={468}
                height={60}
              />
            </div>
            
            <footer className="flex justify-center mt-8 text-center text-muted-foreground">
               <p>
                Spotted a bug, or just want to connect? Find me on{' '}
                <a
                  href="https://www.linkedin.com/in/mahirfaisal777"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  LinkedIn
                </a>
                , before I get lost in my own schedule.
              </p>
            </footer>
        </div>
    </div>
  );
}

    
