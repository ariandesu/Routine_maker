
'use client';
import * as React from 'react';
import type { ScheduleData, ScheduleEvent } from '@/lib/types';
import { EventDialog } from './event-dialog';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Plus, Trash2, Combine, Split } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


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

export const ScheduleGrid = React.forwardRef<HTMLDivElement, ScheduleGridProps>(
  ({ days, timeSlots, onTimeSlotsChange, schedule, onUpdateEvent, headingText, onHeadingTextChange, isExporting }, ref) => {
    const [selectedCell, setSelectedCell] = React.useState<string | null>(null);
    const [selection, setSelection] = React.useState<Set<string>>(new Set());
    const [isSelecting, setIsSelecting] = React.useState(false);
    const [selectionAnchor, setSelectionAnchor] = React.useState<string | null>(null);

    const getCellKey = (day: string, timeIndex: number) => `${day}-${timeIndex}`;

    const handleMouseDown = (day: string, timeIndex: number) => {
      const key = getCellKey(day, timeIndex);
      setIsSelecting(true);
      setSelectionAnchor(key);
      setSelection(new Set([key]));
    };
    
    const handleMouseEnter = (day: string, timeIndex: number) => {
      if (!isSelecting || !selectionAnchor) return;
    
      const newSelection = new Set<string>();
      const [anchorDay, anchorTimeIndexStr] = selectionAnchor.split('-');
      const anchorTimeIndex = parseInt(anchorTimeIndexStr, 10);
    
      if (day !== anchorDay) {
        return; 
      }
    
      const minTime = Math.min(anchorTimeIndex, timeIndex);
      const maxTime = Math.max(anchorTimeIndex, timeIndex);
    
      for (let i = minTime; i <= maxTime; i++) {
        const key = getCellKey(day, i);
        if(!isCellCovered(day, i) || i === minTime) {
            newSelection.add(key);
        } else {
            break;
        }
      }
      setSelection(newSelection);
    };
    
    const handleMouseUp = () => {
      if (isSelecting) {
        setIsSelecting(false);
        setSelectionAnchor(null);
        if (selection.size === 1) {
            const singleCellKey = Array.from(selection)[0];
            const event = schedule[singleCellKey];
            
            if (event && !event.rowSpan) {
                const mainCellKey = findMainEventCellKeyFor(singleCellKey);
                if (mainCellKey) {
                  setSelectedCell(mainCellKey);
                  // Don't clear selection here so merge popover can appear
                  return;
                }
            }
            setSelectedCell(singleCellKey);
            // Don't clear selection here so merge popover can appear
        }
      }
    };
    
    const clearSelection = () => {
      setSelection(new Set());
    };

    const handleSaveEvent = (key: string, event: ScheduleEvent | null) => {
        onUpdateEvent(key, event);
        setSelectedCell(null);
        clearSelection();
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

    const handleMerge = () => {
        if (selection.size <= 1) return;
        const sortedSelection = Array.from(selection).sort((a, b) => {
            const [, timeA] = a.split('-');
            const [, timeB] = b.split('-');
            return parseInt(timeA) - parseInt(timeB);
        });

        const mainCellKey = sortedSelection[0];
        const existingEvent = schedule[mainCellKey] || { title: 'New Event', subtitle: '', color: 'bg-gray-300' };
        
        const mergedEvent: ScheduleEvent = {
            ...existingEvent,
            rowSpan: selection.size,
        };
        const keysToRemove = sortedSelection.slice(1);
        onUpdateEvent(mainCellKey, mergedEvent, keysToRemove);
        clearSelection();
    };

    const handleUnmerge = () => {
        const key = Array.from(selection)[0];
        if (!key || !schedule[key] || !schedule[key].rowSpan) return;

        const mainEvent = { ...schedule[key] };
        delete mainEvent.rowSpan;

        onUpdateEvent(key, mainEvent);
        clearSelection();
    };
    
    const isCellCovered = (day: string, timeIndex: number): boolean => {
        for (let i = 1; i < timeSlots.length; i++) {
            if (timeIndex - i < 0) break;
            const potentialParentKey = getCellKey(day, timeIndex - i);
            const parentEvent = schedule[potentialParentKey];
            if (parentEvent && parentEvent.rowSpan && parentEvent.rowSpan > i) {
                return true;
            }
        }
        return false;
    };

    const findMainEventCellKeyFor = (cellKey: string): string | null => {
        const [day, timeIndexStr] = cellKey.split('-');
        const timeIndex = parseInt(timeIndexStr, 10);
        for (let i = 1; i <= timeIndex; i++) {
            const potentialParentKey = getCellKey(day, timeIndex - i);
            const parentEvent = schedule[potentialParentKey];
            if (parentEvent && parentEvent.rowSpan && parentEvent.rowSpan > i) {
                return potentialParentKey;
            }
        }
        return null;
    };
    
    const isSelectionContiguousAndInSameDay = () => {
        if (selection.size <= 1) return false;
        const selectionArray = Array.from(selection);
        const day = selectionArray[0].split('-')[0];
        const indices = selectionArray.map(s => parseInt(s.split('-')[1])).sort((a, b) => a - b);
        
        for (let i = 0; i < indices.length; i++) {
            if (selectionArray[i].split('-')[0] !== day) return false;
            if (i > 0 && indices[i] !== indices[i-1] + 1) return false;
        }
        return true;
    }
    
    const renderMergeButton = () => {
        const canMerge = isSelectionContiguousAndInSameDay();
        const selectionArray = Array.from(selection);
        const firstCellKey = selectionArray.sort((a, b) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]))[0];
        
        if (!firstCellKey) return null;
        
        const isAlreadyMerged = schedule[firstCellKey] && schedule[firstCellKey].rowSpan;

        const showPopover = (selection.size > 1 && canMerge) || (selection.size === 1 && isAlreadyMerged);

        if (!showPopover) return null;

        const gridElement = (ref.current as HTMLDivElement)?.querySelector(`[data-key="${firstCellKey}"]`) as HTMLElement;
        if (!gridElement) return null;
        
        return (
            <Popover open={showPopover} onOpenChange={(isOpen) => !isOpen && clearSelection()}>
                <PopoverTrigger asChild>
                     <div className='absolute z-20' style={{ top: `${gridElement.offsetTop}px`, left: `${gridElement.offsetLeft + gridElement.offsetWidth}px` }}></div>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-1'>
                    {isAlreadyMerged ? (
                        <Button onClick={handleUnmerge} size="sm"><Split className="mr-2 h-4 w-4" /> Unmerge</Button>
                    ) : (
                        <Button onClick={handleMerge} size="sm" disabled={!canMerge}><Combine className="mr-2 h-4 w-4" /> Merge</Button>
                    )}
                </PopoverContent>
            </Popover>
        )
    };
    
    const eventForDialog = () => {
        if (!selectedCell) return undefined;
        const event = schedule[selectedCell];
        if (event) return event;
        const mainCellKey = findMainEventCellKeyFor(selectedCell);
        return mainCellKey ? schedule[mainCellKey] : undefined;
    }

    const cellKeyForDialog = () => {
        if (!selectedCell) return null;
        if (schedule[selectedCell]) return selectedCell;
        return findMainEventCellKeyFor(selectedCell) || selectedCell;
    }

    return (
      <div onMouseUp={handleMouseUp} onMouseLeave={isSelecting ? handleMouseUp : undefined}>
        <div ref={ref} className="bg-card p-1 sm:p-2 md:p-4 rounded-lg shadow-lg overflow-x-auto select-none">
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
                  <Input
                    type="text"
                    value={time}
                    onChange={(e) => handleTimeSlotChange(timeIndex, e.target.value)}
                    className="h-9 w-full bg-card border-none text-right text-xs sm:text-sm focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  {!isExporting && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 opacity-0 group-hover:opacity-100 lg:opacity-0" onClick={() => removeTimeSlot(timeIndex)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {days.map(day => {
                  const key = getCellKey(day, timeIndex);
                  const event = schedule[key];

                  if (isCellCovered(day, timeIndex)) {
                      return null;
                  }

                  return (
                    <div
                      key={key}
                      data-key={key}
                      className={cn(
                        "border-r border-b p-1 cursor-pointer transition-colors relative group",
                        isSelecting ? 'cursor-cell' : 'cursor-pointer',
                        selection.has(key) ? 'bg-accent/40' : 'hover:bg-accent/20'
                        )}
                      style={{
                        gridRow: event?.rowSpan ? `span ${event.rowSpan}` : 'span 1',
                        zIndex: event?.rowSpan ? 10 : 1
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
          {!isExporting && renderMergeButton()}
        </div>
        <EventDialog
          isOpen={!!selectedCell}
          onClose={() => { setSelectedCell(null); clearSelection(); }}
          cellKey={cellKeyForDialog()}
          eventData={eventForDialog()}
          onSave={handleSaveEvent}
        />
      </div>
    );
  }
);

ScheduleGrid.displayName = "ScheduleGrid";
