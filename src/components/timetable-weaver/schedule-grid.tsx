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
}

export const ScheduleGrid = React.forwardRef<HTMLDivElement, ScheduleGridProps>(
  ({ days, timeSlots, onTimeSlotsChange, schedule, onUpdateEvent }, ref) => {
    const [selectedCell, setSelectedCell] = React.useState<string | null>(null);

    const handleCellClick = (day: string, timeIndex: number) => {
      setSelectedCell(`${day}-${timeIndex}`);
    };
    
    const handleSaveEvent = (key: string, event: ScheduleEvent | null) => {
        onUpdateEvent(key, event);
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

    return (
      <>
        <div ref={ref} className="bg-card p-2 sm:p-4 rounded-lg shadow-lg overflow-x-auto">
          <div 
            className="grid" 
            style={{ 
              gridTemplateColumns: `minmax(150px, auto) repeat(${days.length}, minmax(120px, 1fr))`,
              gridTemplateRows: `auto repeat(${timeSlots.length}, minmax(80px, 1fr)) auto`
            }}
          >
            {/* Header: Days */}
            <div className="sticky top-0 left-0 z-10 bg-card"></div>
            {days.map((day) => (
              <div key={day} className="text-center font-bold font-headline text-primary p-2 border-b-2 border-primary sticky top-0 bg-card z-10 flex items-center justify-center">
                {day}
              </div>
            ))}

            {/* Time slots and Cells */}
            {timeSlots.map((time, timeIndex) => (
              <React.Fragment key={timeIndex}>
                <div className="p-2 text-right text-xs sm:text-sm font-semibold text-muted-foreground border-r sticky left-0 bg-card flex items-center justify-end gap-2 group">
                  <Input
                    type="text"
                    value={time}
                    onChange={(e) => handleTimeSlotChange(timeIndex, e.target.value)}
                    className="h-9 w-full bg-card border-none text-right focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => removeTimeSlot(timeIndex)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
                           <p className="font-bold text-sm leading-tight">{event.title}</p>
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
            <div className="p-2 border-r sticky left-0 bg-card flex items-center justify-center">
                <Button variant="outline" className="w-full h-9" onClick={addTimeSlot}>
                    <Plus className="mr-2 h-4 w-4" /> Add Slot
                </Button>
            </div>
            {/* Empty cells for the add button row */}
            {days.map(day => (
                <div key={`add-slot-filler-${day}`} className="border-r border-b"></div>
            ))}
          </div>
        </div>
        <EventDialog
          isOpen={!!selectedCell}
          onClose={() => setSelectedCell(null)}
          cellKey={selectedCell}
          eventData={selectedCell ? schedule[selectedCell] : undefined}
          onSave={handleSaveEvent}
        />
      </>
    );
  }
);

ScheduleGrid.displayName = "ScheduleGrid";
