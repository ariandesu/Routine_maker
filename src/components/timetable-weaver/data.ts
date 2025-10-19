import type { ScheduleData } from "@/lib/types";

export const initialDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const initialTimeSlots = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

export const initialScheduleData: ScheduleData = {
  "1-1": { title: "Quantum Physics", subtitle: "Room 101", color: "bg-red-300" },
  "1-3": { title: "Advanced Calculus", subtitle: "Prof. Smith", color: "bg-blue-300" },
  "2-2": { title: "Literary Analysis", subtitle: "Room 203", color: "bg-green-300" },
  "3-0": { title: "History of Art", subtitle: "Auditorium B", color: "bg-yellow-300" },
  "3-4": { title: "Organic Chemistry", subtitle: "Lab 3", color: "bg-purple-300" },
  "4-1": { title: "Computer Science 101", subtitle: "Room 404", color: "bg-indigo-300" },
  "0-3": { title: "Philosophy", subtitle: "Room 101", color: "bg-pink-300" },
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

export const fonts = [
    { label: 'Alegreya', value: 'font-body' },
    { label: 'Roboto', value: 'font-roboto' },
    { label: 'Lato', value: 'font-lato' },
    { label: 'Merriweather', value: 'font-merriweather' },
    { label: 'Open Sans', value: 'font-open-sans' },
    { label: 'Montserrat', value: 'font-montserrat' },
    { label: 'Raleway', value: 'font-raleway' },
    { label: 'Playfair Display', value: 'font-playfair-display' },
    { label: 'Ubuntu', value: 'font-ubuntu' },
    { label: 'Poppins', value: 'font-poppins' },
    { label: 'Nunito', value: 'font-nunito' },
    { label: 'Oswald', value: 'font-oswald' },
    { label: 'Source Sans Pro', value: 'font-source-sans-pro' },
    { label: 'Lora', value: 'font-lora' },
    { label: 'PT Sans', value: 'font-pt-sans' },
    { label: 'Fira Sans', value: 'font-fira-sans' },
    { label: 'Inter', value: 'font-inter' },
    { label: 'Work Sans', value: 'font-work-sans' },
    { label: 'Inconsolata', value: 'font-inconsolata' },
    { label: 'Dosis', value: 'font-dosis' },
    { label: 'Exo 2', value: 'font-exo-2' },
    { label: 'Arvo', value: 'font-arvo' },
    { label: 'Crimson Text', value: 'font-crimson-text' },
    { label: 'Lobster', value: 'font-lobster' },
    { label: 'Pacifico', value: 'font-pacifico' },
];

export const themes = [
    { label: 'Indigo & Gold', value: 'theme-indigo' },
    { label: 'Forest Green', value: 'theme-forest' },
    { label: 'Ocean Blue', value: 'theme-ocean' },
    { label: 'Sunset Orange', value: 'theme-sunset' },
    { label: 'Rose Tint', value: 'theme-rose' },
];
