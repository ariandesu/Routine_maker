export type ScheduleEvent = {
  title: string;
  subtitle: string;
  color: string;
  rowSpan?: number;
};

export type ScheduleData = {
  [key: string]: ScheduleEvent; // key format: "Day-TimeSlotIndex"
};
