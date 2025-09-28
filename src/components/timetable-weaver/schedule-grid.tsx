'use client';
import * as React from 'react';
import type { ScheduleData, ScheduleEvent } from '@/lib/types';
import { EventDialog } from './event-dialog';
import { cn } from '@/lib/utils';

interface ScheduleGridProps {
  days: string[];
  timeSlots: string[];
  schedule: ScheduleData;
  onUpdateEvent: (key: string, event: ScheduleEvent | null) => void;
}

export const ScheduleGrid = React.forwardRef<HTMLDivElement, ScheduleGridProps>(
  ({ days, timeSlots, schedule, onUpdateEvent }, ref) => {
    const [selectedCell, setSelectedCell] = React.useState<string | null>(null);

    const handleCellClick = (day: string, timeIndex: number) => {
      setSelectedCell(`${day}-${timeIndex}`);
    };
    
    const handleSaveEvent = (key: string, event: ScheduleEvent | null) => {
        onUpdateEvent(key, event);
        setSelectedCell(null);
    }

    return (
      <>
        <div ref={ref} className="bg-card p-2 sm:p-4 rounded-lg shadow-lg overflow-x-auto">
          <div 
            className="grid" 
            style={{ 
              gridTemplateColumns: `minmax(50px, auto) repeat(${days.length}, minmax(120px, 1fr))`,
              gridTemplateRows: `auto repeat(${timeSlots.length}, minmax(80px, 1fr))`
            }}
          >
            {/* Header: Days */}
            <div className="sticky top-0 left-0 z-10 bg-card"></div>
            {days.map(day => (
              <div key={day} className="text-center font-bold font-headline text-primary p-2 border-b-2 border-primary sticky top-0 bg-card z-10">
                {day}
              </div>
            ))}

            {/* Time slots and Cells */}
            {timeSlots.map((time, timeIndex) => (
              <React.Fragment key={time}>
                <div className="p-2 text-right text-xs sm:text-sm font-semibold text-muted-foreground border-r sticky left-0 bg-card flex items-start justify-end pt-3">
                  {time}
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
