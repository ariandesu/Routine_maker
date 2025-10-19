
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
  onDaysChange: (newDays: string[]) => void;
  timeSlots: string[];
  onTimeSlotsChange: (newTimeSlots: string[]) => void;
  schedule: ScheduleData;
  onUpdateEvent: (key: string, event: ScheduleEvent | null, keysToRemove?: string[]) => void;
  onMoveEvent: (sourceKey: string, destinationKey: string) => void;
  headingText: string;
  onHeadingTextChange: (text: string) => void;
  isExporting?: boolean;
  cellWidth: number;
  cellHeight: number;
}

type Selection = {
  start: { dayIndex: number; timeIndex: number; key: string };
  end: { dayIndex: number; timeIndex: number; key: string };
  dayIndex: number;
} | null;

export const ScheduleGrid = React.forwardRef<HTMLDivElement, ScheduleGridProps>(
  ({ days, onDaysChange, timeSlots, onTimeSlotsChange, schedule, onUpdateEvent, onMoveEvent, headingText, onHeadingTextChange, isExporting, cellWidth, cellHeight }, ref) => {
    const [selectedCell, setSelectedCell] = React.useState<string | null>(null);
    const [isEventDialogOpen, setIsEventDialogOpen] = React.useState(false);
    const [selection, setSelection] = React.useState<Selection>(null);
    const [isSelecting, setIsSelecting] = React.useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const gridRef = React.useRef<HTMLDivElement>(null);
    const [dragOverKey, setDragOverKey] = React.useState<string | null>(null);

    const handleMouseDown = (dayIndex: number, timeIndex: number) => {
      // Prevent starting selection if dragging an event
      const key = `${dayIndex}-${timeIndex}`;
      if (schedule[key]) return;

      setIsSelecting(true);
      setSelection({
        start: { dayIndex, timeIndex, key },
        end: { dayIndex, timeIndex, key },
        dayIndex,
      });
      setIsPopoverOpen(false);
    };

    const handleMouseEnter = (dayIndex: number, timeIndex: number) => {
      if (isSelecting && selection && dayIndex === selection.dayIndex) {
        const key = `${dayIndex}-${timeIndex}`;
        const newEnd = { dayIndex, timeIndex, key };
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
             const key = `${selection.dayIndex}-${start.timeIndex}`;
             const event = schedule[key];
             if(event?.colSpan && event.colSpan > 1) {
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
        const handleGlobalMouseUp = (e: MouseEvent) => {
            // Check if the mouse up is outside of the grid, then reset selection
            if (isSelecting && gridRef.current && !gridRef.current.contains(e.target as Node)) {
              setIsSelecting(false);
              setSelection(null);
            } else if (isSelecting && selection?.start.key === selection?.end.key) {
               handleSingleCellClick(selection.start.key);
            }
        };
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => {
          window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isSelecting, selection, schedule]);


    const isCellSelected = (dayIndex: number, timeIndex: number) => {
      if (!selection) return false;
      if (dayIndex !== selection.dayIndex) return false;
      const start = Math.min(selection.start.timeIndex, selection.end.timeIndex);
      const end = Math.max(selection.start.timeIndex, selection.end.timeIndex);
      return timeIndex >= start && timeIndex <= end;
    };

    const handleSingleCellClick = (key: string, isMergedClick = false) => {
       if (isSelecting && selection?.start.key !== selection?.end.key && !isMergedClick) return;
        const event = schedule[key];
        const isActuallyMerged = event?.colSpan && event.colSpan > 1;

        if (isActuallyMerged) {
            const [dayIndexStr, timeIndexStr] = key.split('-');
            const dayIndex = parseInt(dayIndexStr);
            const timeIndex = parseInt(timeIndexStr);
            setSelection({
                start: { dayIndex: dayIndex, timeIndex: timeIndex, key: key },
                end: {  dayIndex: dayIndex, timeIndex: timeIndex + event.colSpan! - 1, key: `${dayIndex}-${timeIndex + event.colSpan! - 1}` },
                dayIndex: dayIndex
            })
            setIsPopoverOpen(true);
        } else {
           setSelectedCell(key);
           setIsEventDialogOpen(true);
        }
    }

    const handleMerge = () => {
      if (!selection) return;
      const { start, end } = selection;
      const startIdx = Math.min(start.timeIndex, end.timeIndex);
      
      const firstCellKey = `${start.dayIndex}-${startIdx}`;
      setSelectedCell(firstCellKey);
      setIsEventDialogOpen(true);
      setIsPopoverOpen(false);
    };

    const handleUnmerge = () => {
      if(!selection) return;
      const { start } = selection;
      const event = schedule[`${start.dayIndex}-${start.timeIndex}`];
      
      if (event && event.colSpan && event.colSpan > 1) {
        const keysToRemove = [];
        for (let i = 1; i < event.colSpan; i++) {
          keysToRemove.push(`${start.dayIndex}-${start.timeIndex + i}`);
        }
        const updatedEvent = { ...event, colSpan: 1 };
        onUpdateEvent(`${start.dayIndex}-${start.timeIndex}`, updatedEvent, keysToRemove);
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
          event.colSpan = endIdx - startIdx + 1;
          
          const keysToRemove = [];
          for (let i = startIdx + 1; i <= endIdx; i++) {
            keysToRemove.push(`${selection.dayIndex}-${i}`);
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

    const handleDayChange = (index: number, value: string) => {
        const newDays = [...days];
        newDays[index] = value;
        onDaysChange(newDays);
    }
  
    const addTimeSlot = () => {
      onTimeSlotsChange([...timeSlots, `New Slot ${timeSlots.length + 1}`]);
    };
  
    const removeTimeSlot = (index: number) => {
      const newTimeSlots = timeSlots.filter((_, i) => i !== index);
      onTimeSlotsChange(newTimeSlots);
    };

    const addDay = () => {
      onDaysChange([...days, `New Day ${days.length + 1}`]);
    };

    const removeDay = (index: number) => {
      const newDays = days.filter((_, i) => i !== index);
      onDaysChange(newDays);
    };

    // Drag and Drop handlers
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, key: string) => {
      e.dataTransfer.setData("text/plain", key);
      // Optional: Add a dragging class for visual feedback
      e.currentTarget.classList.add('opacity-50');
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, key: string) => {
      e.preventDefault();
      if (dragOverKey !== key) {
        setDragOverKey(key);
      }
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, destinationKey: string) => {
      e.preventDefault();
      const sourceKey = e.dataTransfer.getData("text/plain");
      setDragOverKey(null);

      // Prevent dropping on its own cell or a cell that's part of a merged event
      if (sourceKey !== destinationKey && !schedule[destinationKey]) {
        onMoveEvent(sourceKey, destinationKey);
      }
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
      e.currentTarget.classList.remove('opacity-50');
      setDragOverKey(null);
    };
    
    const eventForDialog = selectedCell ? schedule[selectedCell] : undefined;
    
    const selectionSize = selection ? Math.abs(selection.end.timeIndex - selection.start.timeIndex) + 1 : 1;

    let spannedCells: string[] = [];
    Object.keys(schedule).forEach(key => {
        const event = schedule[key];
        if (event && event.colSpan && event.colSpan > 1) {
            const [dayIndexStr, timeIndexStr] = key.split('-');
            const dayIndex = parseInt(dayIndexStr);
            const timeIndex = parseInt(timeIndexStr);
            if (dayIndex !== -1) {
              for (let i = 1; i < event.colSpan; i++) {
                  if (timeIndex + i < timeSlots.length) {
                    spannedCells.push(`${dayIndex}-${timeIndex + i}`);
                  }
              }
            }
        }
    });

    const isUnmergeable = selection && schedule[selection.start.key]?.colSpan > 1;

    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
            <div className="relative" style={{
                cursor: isSelecting ? 'cell' : 'default'
            }}>
            </div>
        </PopoverTrigger>
        <div ref={ref} className="bg-card p-1 sm:p-2 md:p-4 rounded-lg shadow-lg overflow-x-auto">
          <div 
            ref={gridRef}
            className="grid" 
            style={{ 
              gridTemplateColumns: `minmax(120px, 0.5fr) repeat(${timeSlots.length}, minmax(${cellWidth}px, 1fr)) auto`,
              gridTemplateRows: `auto auto repeat(${days.length}, minmax(${cellHeight}px, 1fr)) auto`,
            }}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setDragOverKey(null)}
          >
             {/* Heading Text */}
            <div 
              className={cn(
                "text-center font-bold font-headline p-2 border-b-2 border-primary bg-card z-10 flex items-center justify-center",
                !isExporting && "sticky top-0"
              )}
              style={{ gridColumn: `1 / span ${timeSlots.length + 2}`}}
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

            {/* Time Slot headers */}
            <div className={cn("bg-card z-10", !isExporting && "sticky top-0 left-0")}></div>
            {timeSlots.map((time, timeIndex) => (
                <div key={`header-${timeIndex}`} className={cn("p-1 border-r border-b text-center text-xs sm:text-sm font-semibold text-muted-foreground flex items-center justify-center gap-1 sm:gap-2 group", !isExporting && "sticky top-12")}>
                   {isExporting ? (
                     <div className="h-9 w-full flex items-center justify-center">{time}</div>
                   ) : (
                    <>
                      <Input
                        type="text"
                        value={time}
                        onChange={(e) => handleTimeSlotChange(timeIndex, e.target.value)}
                        className="h-9 w-full bg-card border-none text-center text-xs sm:text-sm focus-visible:ring-1 focus-visible:ring-ring"
                      />
                      <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 opacity-0 group-hover:opacity-100 lg:opacity-0" onClick={() => removeTimeSlot(timeIndex)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                   )}
                </div>
            ))}
            <div className={cn("border-b bg-card", !isExporting && "sticky top-12")}></div>

            {/* Days and Cells */}
            {days.map((day, dayIndex) => (
              <React.Fragment key={dayIndex}>
                <div className={cn(
                    "p-1 text-left text-xs sm:text-sm font-semibold text-muted-foreground border-r border-b bg-card flex items-center justify-start gap-1 sm:gap-2 group",
                    !isExporting && "sticky left-0"
                  )}>
                  {isExporting ? (
                     <div className="h-9 w-full text-left text-xs sm:text-sm pl-3 flex items-center justify-start">{day}</div>
                  ) : (
                    <Input
                      type="text"
                      value={day}
                      onChange={(e) => handleDayChange(dayIndex, e.target.value)}
                      className="h-9 w-full bg-card border-none text-left text-xs sm:text-sm focus-visible:ring-1 focus-visible:ring-ring pl-3"
                    />
                  )}
                  {!isExporting && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 opacity-0 group-hover:opacity-100" onClick={() => removeDay(dayIndex)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {timeSlots.map((time, timeIndex) => {
                  const key = `${dayIndex}-${timeIndex}`;
                  if (spannedCells.includes(key)) return null;

                  const event = schedule[key];
                  const isDragOver = dragOverKey === key && !event;

                  return (
                    <div
                      key={key}
                      className={cn(
                          "border-r border-b p-1 relative group",
                          isCellSelected(dayIndex, timeIndex) && !event ? "bg-neutral-200" : "bg-card",
                          !event && "hover:bg-neutral-100 transition-colors",
                          isDragOver && "bg-accent",
                          event ? "cursor-grab" : "cursor-pointer"
                      )}
                      style={{
                        gridColumn: event?.colSpan ? `span ${event.colSpan}` : 'span 1'
                      }}
                      onMouseDown={() => handleMouseDown(dayIndex, timeIndex)}
                      onMouseEnter={() => handleMouseEnter(dayIndex, timeIndex)}
                      onClick={() => !event && handleSingleCellClick(key)}
                      onDragOver={(e) => handleDragOver(e, key)}
                      onDrop={(e) => handleDrop(e, key)}
                    >
                      {event ? (
                        <div 
                           className={cn("h-full w-full rounded p-2 text-black flex flex-col justify-center", 'bg-white border border-neutral-300')}
                           draggable
                           onDragStart={(e) => handleDragStart(e, key)}
                           onDragEnd={handleDragEnd}
                           onClick={() => handleSingleCellClick(key)}
                        >
                           {event.time && <p className="text-xs opacity-60 font-semibold pointer-events-none">{event.time}</p>}
                           <p className="font-bold text-xs sm:text-sm leading-tight pointer-events-none">{event.title}</p>
                           <p className="text-xs opacity-80 mt-1 pointer-events-none">{event.subtitle}</p>
                        </div>
                      ) : (
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-neutral-400 font-bold text-2xl">+</span>
                        </div>
                      )}
                      {!event && (
                        <span className="absolute top-1 left-2 text-neutral-400 text-[10px] font-medium pointer-events-none">{time}</span>
                      )}
                    </div>
                  );
                })}
                 <div className="border-b"></div>
              </React.Fragment>
            ))}
             {/* Add Day Button */}
            <div className={cn(
                "p-2 border-r bg-card flex items-center justify-center",
                !isExporting && "sticky left-0"
              )}>
                {!isExporting && (
                  <Button variant="outline" className="w-full h-9" onClick={addDay}>
                      <Plus className="mr-2 h-4 w-4" /> 
                      <span className="sm:hidden">Add</span>
                      <span className="hidden sm:inline">Add Day</span>
                  </Button>
                )}
            </div>
             {/* Add Time Slot Buttons */}
            {timeSlots.map((_, timeIndex) => (
                <div key={`add-time-filler-${timeIndex}`} className="border-r p-2 flex items-center justify-center">
                </div>
            ))}
            <div className="flex items-center justify-center p-2">
                {!isExporting && (
                    <Button variant="outline" className="w-full h-9" onClick={addTimeSlot}>
                        <Plus className="h-4 w-4" /> 
                    </Button>
                )}
            </div>
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
