
'use client';
import * as React from 'react';
import type { ScheduleData, ScheduleEvent } from '@/lib/types';
import { EventDialog } from './event-dialog';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface ScheduleGridProps {
  days: string[];
  timeSlots: string[];
  onTimeSlotsChange: (newTimeSlots: string[]) => void;
  schedule: ScheduleData;
  onUpdateEvent: (key: string, event: ScheduleEvent | null, keysToRemove?: string[]) => void;
  headingText: string;
  onHeadingTextChange: (text: string) => void;
  isExporting?: boolean;
}

type Selection = {
  start: { day: string; timeIndex: number; key: string };
  end: { day: string; timeIndex: number; key: string };
  day: string;
} | null;

export const ScheduleGrid = React.forwardRef<HTMLDivElement, ScheduleGridProps>(
  ({ days, timeSlots, onTimeSlotsChange, schedule, onUpdateEvent, headingText, onHeadingTextChange, isExporting }, ref) => {
    const [selectedCell, setSelectedCell] = React.useState<string | null>(null);
    const [isEventDialogOpen, setIsEventDialogOpen] = React.useState(false);
    const [selection, setSelection] = React.useState<Selection>(null);
    const [isSelecting, setIsSelecting] = React.useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const gridRef = React.useRef<HTMLDivElement>(null);

    const handleMouseDown = (day: string, timeIndex: number) => {
      setIsSelecting(true);
      const key = `${day}-${timeIndex}`;
      setSelection({
        start: { day, timeIndex, key },
        end: { day, timeIndex, key },
        day,
      });
      setIsPopoverOpen(false);
    };

    const handleMouseEnter = (day: string, timeIndex: number) => {
      if (isSelecting && selection && day === selection.day) {
        const key = `${day}-${timeIndex}`;
        const newEnd = { day, timeIndex, key };
        setSelection({
          ...selection,
          end: newEnd,
        });
      }
    };

    const handleMouseUp = () => {
      if (isSelecting) {
        setIsSelecting(false);
        if (selection) {
          const { start, end } = selection;
          const startIdx = Math.min(start.timeIndex, end.timeIndex);
          const endIdx = Math.max(start.timeIndex, end.timeIndex);
          
          if (startIdx !== endIdx) {
            setIsPopoverOpen(true);
          } else {
            // This is a single cell click
             const key = `${start.day}-${start.timeIndex}`;
             const event = schedule[key];
             if(event?.rowSpan && event.rowSpan > 1) {
                const isMerged = true;
                handleSingleCellClick(key, isMerged);
             } else {
                handleSingleCellClick(key);
             }
          }
        }
      }
    };
    
    React.useEffect(() => {
        const handleGlobalMouseUp = () => {
          if (isSelecting) {
            setIsSelecting(false);
             if (selection && selection.start.key === selection.end.key) {
                handleSingleCellClick(selection.start.key);
            }
          }
        };
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => {
          window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isSelecting, selection]);


    const isCellSelected = (day: string, timeIndex: number) => {
      if (!selection) return false;
      if (day !== selection.day) return false;
      const start = Math.min(selection.start.timeIndex, selection.end.timeIndex);
      const end = Math.max(selection.start.timeIndex, selection.end.timeIndex);
      return timeIndex >= start && timeIndex <= end;
    };

    const handleSingleCellClick = (key: string, isMergedClick = false) => {
       if (isSelecting && selection?.start.key !== selection?.end.key && !isMergedClick) return;
        const event = schedule[key];
        const isActuallyMerged = event?.rowSpan && event.rowSpan > 1;

        if (isActuallyMerged) {
            setSelection({
                start: { day: key.split('-')[0], timeIndex: parseInt(key.split('-')[1]), key: key },
                end: {  day: key.split('-')[0], timeIndex: parseInt(key.split('-')[1]) + event.rowSpan! - 1, key: `${key.split('-')[0]}-${parseInt(key.split('-')[1]) + event.rowSpan! - 1}` },
                day: key.split('-')[0]
            })
            setIsPopoverOpen(true);
        } else {
           setSelectedCell(key);
           setIsEventDialogOpen(true);
        }
    }

    const handleMerge = () => {
      if (!selection) return;
      const { start, end, day } = selection;
      const startIdx = Math.min(start.timeIndex, end.timeIndex);
      const endIdx = Math.max(start.timeIndex, end.timeIndex);
      
      const firstCellKey = `${day}-${startIdx}`;
      setSelectedCell(firstCellKey);
      setIsEventDialogOpen(true);
      setIsPopoverOpen(false);
    };

    const handleUnmerge = () => {
      if(!selection) return;
      const { start, day } = selection;
      const startIdx = start.timeIndex;
      const event = schedule[`${day}-${startIdx}`];
      
      if (event && event.rowSpan && event.rowSpan > 1) {
        const keysToRemove = [];
        for (let i = 1; i < event.rowSpan; i++) {
          keysToRemove.push(`${day}-${startIdx + i}`);
        }
        const updatedEvent = { ...event, rowSpan: 1 };
        onUpdateEvent(`${day}-${startIdx}`, updatedEvent, keysToRemove);
      }
      setIsPopoverOpen(false);
      setSelection(null);
    };
    
    const handleEditMerged = () => {
        if (!selection) return;
        const { start } = selection;
        setSelectedCell(start.key);
        setIsEventDialogOpen(true);
        setIsPopoverOpen(false);
    }

    const handleSaveEvent = (key: string, event: ScheduleEvent | null) => {
        if (event && selection && selection.start.key !== selection.end.key) {
          const startIdx = Math.min(selection.start.timeIndex, selection.end.timeIndex);
          const endIdx = Math.max(selection.start.timeIndex, selection.end.timeIndex);
          event.rowSpan = endIdx - startIdx + 1;
          
          const keysToRemove = [];
          for (let i = startIdx + 1; i <= endIdx; i++) {
            keysToRemove.push(`${selection.day}-${i}`);
          }
          onUpdateEvent(key, event, keysToRemove);
        } else {
            onUpdateEvent(key, event);
        }
        setIsEventDialogOpen(false);
        setSelectedCell(null);
        setSelection(null);
    }
    
    const handleCloseDialog = () => {
        setIsEventDialogOpen(false);
        setSelectedCell(null);
        setSelection(null);
    }

    const handleTimeSlotChange = (index: number, value: string) => {
      const newTimeSlots = [...timeSlots];
      newTimeSlots[index] = value;
      onTimeSlotsChange(newTimeSlots);
    };
  
    const addTimeSlot = () => {
      onTimeSlotsChange([...timeSlots, `New Slot ${timeSlots.length + 1}`]);
    };
  
    const removeTimeSlot = (index: number) => {
      const newTimeSlots = timeSlots.filter((_, i) => i !== index);
      onTimeSlotsChange(newTimeSlots);
    };
    
    const eventForDialog = selectedCell ? schedule[selectedCell] : undefined;
    
    const selectionSize = selection ? Math.abs(selection.end.timeIndex - selection.start.timeIndex) + 1 : 1;

    let spannedCells: string[] = [];
    Object.keys(schedule).forEach(key => {
        const event = schedule[key];
        if (event && event.rowSpan && event.rowSpan > 1) {
            const [day, timeIndexStr] = key.split('-');
            const timeIndex = parseInt(timeIndexStr);
            for (let i = 1; i < event.rowSpan; i++) {
                spannedCells.push(`${day}-${timeIndex + i}`);
            }
        }
    });

    const isUnmergeable = selection && schedule[selection.start.key]?.rowSpan > 1;

    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
            <div className="relative" style={{
                cursor: isSelecting ? 'cell' : 'default'
            }}>
            </div>
        </PopoverTrigger>
        <div ref={ref} className="bg-card p-1 sm:p-2 md:p-4 rounded-lg shadow-lg overflow-x-auto" onMouseUp={handleMouseUp}>
          <div 
            ref={gridRef}
            className="grid" 
            style={{ 
              gridTemplateColumns: `minmax(120px, 0.5fr) repeat(${days.length}, minmax(110px, 1fr))`,
              gridTemplateRows: `auto auto repeat(${timeSlots.length}, minmax(70px, 1fr)) auto`,
              userSelect: isSelecting ? 'none' : 'auto'
            }}
          >
             {/* Heading Text */}
            <div className={cn("bg-card z-10", !isExporting && "sticky top-0 left-0")}></div>
            <div 
              className={cn(
                "text-center font-bold font-headline p-2 border-b-2 border-primary bg-card z-10 flex items-center justify-center",
                !isExporting && "sticky top-0"
              )}
              style={{ gridColumn: `2 / span ${days.length}`}}
            >
              {isExporting ? (
                 <div className="w-full h-10 text-center text-xl sm:text-2xl font-bold font-headline text-primary flex items-center justify-center p-0">{headingText}</div>
              ) : (
                <Input
                  type="text"
                  value={headingText}
                  onChange={(e) => onHeadingTextChange(e.target.value)}
                  placeholder="Schedule Title"
                  className="w-full h-10 bg-card border-none text-center text-xl sm:text-2xl font-bold font-headline text-primary focus-visible:ring-1 focus-visible:ring-ring p-0"
                />
              )}
            </div>
            {/* Header: Days */}
            <div className={cn("z-10 bg-card", !isExporting && "sticky top-0 left-0")} style={{ top: '60px' }}></div>
            {days.map((day) => (
              <div key={day} className={cn(
                  "text-center text-sm sm:text-base font-bold font-headline text-primary p-2 border-b-2 border-primary bg-card z-10 flex items-center justify-center",
                  !isExporting && "sticky"
                )} style={{ top: '60px' }}>
                <div className="w-full h-9 bg-card border-none text-center text-sm sm:text-base font-bold font-headline text-primary p-0 flex items-center justify-center">{day}</div>
              </div>
            ))}

            {/* Time slots and Cells */}
            {timeSlots.map((time, timeIndex) => (
              <React.Fragment key={timeIndex}>
                <div className={cn(
                    "p-1 text-right text-xs sm:text-sm font-semibold text-muted-foreground border-r bg-card flex items-center justify-end gap-1 sm:gap-2 group",
                    !isExporting && "sticky left-0"
                  )}>
                  {isExporting ? (
                     <div className="h-9 w-full text-right text-xs sm:text-sm pr-3 flex items-center justify-end">{time}</div>
                  ) : (
                    <Input
                      type="text"
                      value={time}
                      onChange={(e) => handleTimeSlotChange(timeIndex, e.target.value)}
                      className="h-9 w-full bg-card border-none text-right text-xs sm:text-sm focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  )}
                  {!isExporting && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 opacity-0 group-hover:opacity-100 lg:opacity-0" onClick={() => removeTimeSlot(timeIndex)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {days.map(day => {
                  const key = `${day}-${timeIndex}`;
                  if (spannedCells.includes(key)) return null;

                  const event = schedule[key];
                  return (
                    <div
                      key={key}
                      className={cn(
                          "border-r border-b p-1 cursor-pointer hover:bg-accent/20 transition-colors relative group",
                          isCellSelected(day, timeIndex) && "bg-accent/40"
                      )}
                      style={{
                        gridRow: event?.rowSpan ? `span ${event.rowSpan}` : 'span 1'
                      }}
                      onMouseDown={() => handleMouseDown(day, timeIndex)}
                      onMouseEnter={() => handleMouseEnter(day, timeIndex)}
                    >
                      {event ? (
                        <div className={cn("h-full w-full rounded p-2 text-primary-foreground flex flex-col justify-center", event.color)}>
                           <p className="font-bold text-xs sm:text-sm leading-tight">{event.title}</p>
                           <p className="text-xs opacity-80 mt-1">{event.subtitle}</p>
                        </div>
                      ) : (
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-accent font-bold text-2xl">+</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
             {/* Add Time Slot Button */}
            <div className={cn(
                "p-2 border-r bg-card flex items-center justify-center",
                !isExporting && "sticky left-0"
              )}>
                {!isExporting && (
                  <Button variant="outline" className="w-full h-9" onClick={addTimeSlot}>
                      <Plus className="mr-2 h-4 w-4" /> 
                      <span className="sm:hidden">Add</span>
                      <span className="hidden sm:inline">Add Slot</span>
                  </Button>
                )}
            </div>
            {/* Empty cells for the add button row */}
            {days.map(day => (
                <div key={`add-slot-filler-${day}`} className="border-r border-b"></div>
            ))}
          </div>
          <PopoverContent>
            <div className="flex gap-2">
                {isUnmergeable ? (
                    <>
                        <Button onClick={handleEditMerged}>Edit Event</Button>
                        <Button variant="outline" onClick={handleUnmerge}>Unmerge</Button>
                    </>
                ) : (
                    <Button onClick={handleMerge}>Merge {selectionSize} cells</Button>
                )}
            </div>
          </PopoverContent>
        </div>
        <EventDialog
          isOpen={isEventDialogOpen}
          onClose={handleCloseDialog}
          cellKey={selectedCell}
          eventData={eventForDialog}
          onSave={handleSaveEvent}
          selectionSize={selectionSize}
        />
      </Popover>
    );
  }
);

ScheduleGrid.displayName = "ScheduleGrid";
