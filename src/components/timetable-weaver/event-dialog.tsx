
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
import type { ScheduleEvent } from '@/lib/types';
import { Trash2 } from 'lucide-react';

const eventSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }).max(50),
  subtitle: z.string().max(50).optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cellKey: string | null;
  eventData?: ScheduleEvent;
  onSave: (key: string, event: ScheduleEvent | null) => void;
  selectionSize: number;
}

export function EventDialog({ isOpen, onClose, cellKey, eventData, onSave, selectionSize }: EventDialogProps) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      subtitle: '',
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (eventData) {
      reset({
        title: eventData.title,
        subtitle: eventData.subtitle,
      });
    } else {
      reset({
        title: '',
        subtitle: '',
      });
    }
  }, [eventData, reset]);

  const onSubmit = (data: EventFormValues) => {
    if (cellKey) {
      const newEvent: ScheduleEvent = {
        title: data.title,
        subtitle: data.subtitle || '',
        color: 'bg-white',
      };
      
      const currentSpan = eventData?.colSpan;
      
      if (selectionSize > 1) {
        newEvent.colSpan = selectionSize;
      } else if (currentSpan) {
        newEvent.colSpan = currentSpan;
      }

      onSave(cellKey, newEvent);
    }
  };

  const handleDelete = () => {
    if (cellKey) {
      onSave(cellKey, null);
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
          </form>
        </Form>
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between w-full">
            <div className="flex gap-2 justify-start">
                {eventData && (
                    <Button variant="destructive" size="icon" onClick={handleDelete} title="Delete Event"><Trash2 className="h-4 w-4" /></Button>
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
