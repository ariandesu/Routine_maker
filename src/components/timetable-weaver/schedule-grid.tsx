
'use client';
import * as React from 'react';
import type { ScheduleData, ScheduleEvent } from '@/lib/types';
import { EventDialog } from './event-dialog';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface ScheduleGridProps {
  days: string[];
  timeSlots: string[];
  onTimeSlotsChange: (newTimeSlots: string[]) => void;
  schedule: ScheduleData;
  onUpdateEvent: (key: string, event: ScheduleEvent | null) => void;
  headingText: string;
  onHeadingTextChange: (text: string) => void;
  isExporting?: boolean;
}

export const ScheduleGrid = React.forwardRef<HTMLDivElement, ScheduleGridProps>(
  ({ days, timeSlots, onTimeSlotsChange, schedule, onUpdateEvent, headingText, onHeadingTextChange, isExporting }, ref) => {
    const [selectedCell, setSelectedCell] = React.useState<string | null>(null);
    const [isEventDialogOpen, setIsEventDialogOpen] = React.useState(false);

    const handleCellClick = (day: string, timeIndex: number) => {
      setSelectedCell(`${day}-${timeIndex}`);
      setIsEventDialogOpen(true);
    };

    const handleSaveEvent = (key: string, event: ScheduleEvent | null) => {
        onUpdateEvent(key, event);
        setIsEventDialogOpen(false);
        setSelectedCell(null);
    }
    
    const handleCloseDialog = () => {
        setIsEventDialogOpen(false);
        setSelectedCell(null);
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

    return (
      <>
        <div ref={ref} className="bg-card p-1 sm:p-2 md:p-4 rounded-lg shadow-lg overflow-x-auto">
          <div 
            className="grid" 
            style={{ 
              gridTemplateColumns: `minmax(120px, 0.5fr) repeat(${days.length}, minmax(110px, 1fr))`,
              gridTemplateRows: `auto auto repeat(${timeSlots.length}, minmax(70px, 1fr)) auto`
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
              <Input
                type="text"
                value={headingText}
                onChange={(e) => onHeadingTextChange(e.target.value)}
                placeholder="Schedule Title"
                className="w-full h-10 bg-card border-none text-center text-xl sm:text-2xl font-bold font-headline text-primary focus-visible:ring-1 focus-visible:ring-ring p-0"
              />
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
                  const event = schedule[key];
                  return (
                    <div
                      key={key}
                      className="border-r border-b p-1 cursor-pointer hover:bg-accent/20 transition-colors relative group"
                      onClick={() => handleCellClick(day, timeIndex)}
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
        </div>
        <EventDialog
          isOpen={isEventDialogOpen}
          onClose={handleCloseDialog}
          cellKey={selectedCell}
          eventData={eventForDialog}
          onSave={handleSaveEvent}
        />
      </>
    );
  }
);

ScheduleGrid.displayName = "ScheduleGrid";
