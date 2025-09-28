import type { ScheduleData } from "@/lib/types";

export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const timeSlots = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

export const initialScheduleData: ScheduleData = {
  "Monday-1": { title: "Quantum Physics", subtitle: "Room 101", color: "bg-red-300" },
  "Monday-3": { title: "Advanced Calculus", subtitle: "Prof. Smith", color: "bg-blue-300" },
  "Tuesday-2": { title: "Literary Analysis", subtitle: "Room 203", color: "bg-green-300" },
  "Wednesday-0": { title: "History of Art", subtitle: "Auditorium B", color: "bg-yellow-300" },
  "Wednesday-4": { title: "Organic Chemistry", subtitle: "Lab 3", color: "bg-purple-300" },
  "Thursday-1": { title: "Computer Science 101", subtitle: "Room 404", color: "bg-indigo-300" },
  "Friday-3": { title: "Philosophy", subtitle: "Room 101", color: "bg-pink-300" },
};

export const eventColors = [
    { label: "Rose", value: "bg-rose-300" },
    { label: "Pink", value: "bg-pink-300" },
    { label: "Fuchsia", value: "bg-fuchsia-300" },
    { label: "Purple", value: "bg-purple-300" },
    { label: "Violet", value: "bg-violet-300" },
    { label: "Indigo", value: "bg-indigo-300" },
    { label: "Blue", value: "bg-blue-300" },
    { label: "Sky", value: "bg-sky-300" },
    { label: "Cyan", value: "bg-cyan-300" },
    { label: "Teal", value: "bg-teal-300" },
    { label: "Emerald", value: "bg-emerald-300" },
    { label: "Green", value: "bg-green-300" },
    { label: "Lime", value: "bg-lime-300" },
    { label: "Yellow", value: "bg-yellow-300" },
    { label: "Amber", value: "bg-amber-300" },
    { label: "Orange", value: "bg-orange-300" },
    { label: "Red", value: "bg-red-300" },
];
