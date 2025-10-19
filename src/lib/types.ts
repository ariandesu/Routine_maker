export type ScheduleEvent = {
  title: string;
  subtitle: string;
  color: string;
  rowSpan?: number;
  colSpan?: number;
};

export type ScheduleData = {
  [key: string]: ScheduleEvent; // key format: "DayIndex-TimeSlotIndex"
};
