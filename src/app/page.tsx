import TimetableWeaverClient from '@/components/timetable-weaver/timetable-weaver-client';
import { ThemeWrapper } from '@/context/theme-provider';

export default function Home() {
  return (
    <ThemeWrapper>
      <TimetableWeaverClient />
    </ThemeWrapper>
  );
}
