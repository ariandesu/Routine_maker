'use client'

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { eventColors } from './data';
import type { ScheduleEvent } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowDownToLine, ArrowUpToLine, Trash2, ArrowUpFromLine, ChevronsUpDown } from 'lucide-react';

const eventSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }).max(50),
  subtitle: z.string().max(50).optional(),
  color: z.string().min(1, { message: "Please select a color." }),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cellKey: string | null;
  eventData?: ScheduleEvent;
  onSave: (key: string, event: ScheduleEvent | null) => void;
  onMergeDown: (key: string) => void;
  onMergeUp: (key: string) => void;
  onSplit: (key: string) => void;
  isMergeableDown: boolean;
  isMergeableUp: boolean;
  isSplittable: boolean;
}

export function EventDialog({ isOpen, onClose, cellKey, eventData, onSave, onMergeDown, onMergeUp, onSplit, isMergeableDown, isMergeableUp, isSplittable }: EventDialogProps) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      color: eventColors[0].value,
    },
  });

  useEffect(() => {
    if (eventData) {
      form.reset({
        title: eventData.title,
        subtitle: eventData.subtitle,
        color: eventData.color,
      });
    } else {
      form.reset({
        title: '',
        subtitle: '',
        color: eventColors[0].value,
      });
    }
  }, [eventData, form]);

  const onSubmit = (data: EventFormValues) => {
    if (cellKey) {
      onSave(cellKey, {
        ...eventData,
        title: data.title,
        subtitle: data.subtitle || '',
        color: data.color,
      });
    }
  };

  const handleDelete = () => {
    if (cellKey) {
      onSave(cellKey, null);
    }
  };

  const handleMergeDown = () => {
    if (cellKey) {
      onMergeDown(cellKey);
    }
  };

  const handleMergeUp = () => {
    if (cellKey) {
      onMergeUp(cellKey);
    }
  };
  
  const handleSplit = () => {
    if (cellKey) {
      onSplit(cellKey);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{eventData ? 'Edit Event' : 'Add Event'}</DialogTitle>
          <DialogDescription>
            {eventData ? "Update details for your schedule." : "Fill in the details for the new event."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="event-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Quantum Physics" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtitle (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Room 101 or Prof. Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Event Color</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-6 gap-2"
                    >
                      {eventColors.map(color => (
                        <FormItem key={color.value} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={color.value} className="sr-only" />
                          </FormControl>
                           <FormLabel className={cn(
                              "w-10 h-10 rounded-full cursor-pointer border-2 border-transparent ring-offset-background transition-all",
                              color.value,
                              field.value === color.value && "ring-2 ring-primary ring-offset-2"
                           )}>
                              <span className="sr-only">{color.label}</span>
                           </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between w-full">
            <div className="flex gap-2 justify-start">
                {eventData && (
                    <>
                        <Button variant="destructive" size="icon" onClick={handleDelete} title="Delete Event"><Trash2 className="h-4 w-4" /></Button>
                        {isMergeableUp && (
                            <Button variant="outline" size="icon" onClick={handleMergeUp} title="Merge Up"><ArrowUpFromLine className="h-4 w-4" /></Button>
                        )}
                        {isMergeableDown && (
                            <Button variant="outline" size="icon" onClick={handleMergeDown} title="Merge Down"><ArrowDownToLine className="h-4 w-4" /></Button>
                        )}
                        {isSplittable && (
                           <Button variant="outline" size="icon" onClick={handleSplit} title="Split Event"><ChevronsUpDown className="h-4 w-4" /></Button>
                        )}
                    </>
                )}
            </div>
            <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit" form="event-form">Save</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
