
import type { ScheduleData } from "@/lib/types";

export const initialDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const initialTimeSlots = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

export const initialScheduleData: ScheduleData = {
  "1-1": { title: "Quantum Physics", subtitle: "Room 101" },
  "1-3": { title: "Advanced Calculus", subtitle: "Prof. Smith" },
  "2-2": { title: "Literary Analysis", subtitle: "Room 203" },
  "3-0": { title: "History of Art", subtitle: "Auditorium B" },
  "3-4": { title: "Organic Chemistry", subtitle: "Lab 3" },
  "4-1": { title: "Computer Science 101", subtitle: "Room 404" },
  "0-3": { title: "Philosophy", subtitle: "Room 101" },
};
