import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/context/theme-provider';

export const metadata: Metadata = {
  title: 'Timetable Weaver',
  description: 'Visually design and share your schedules with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Roboto:wght@400;700&family=Lato:wght@400;700&family=Merriweather:wght@400;700&family=Open+Sans:wght@400;700&family=Montserrat:wght@400;700&family=Raleway:wght@400;700&family=Playfair+Display:wght@400;700&family=Ubuntu:wght@400;700&family=Poppins:wght@400;700&family=Nunito:wght@400;700&family=Oswald:wght@400;700&family=Source+Sans+Pro:wght@400;700&family=Lora:wght@400;700&family=PT+Sans:wght@400;700&family=Fira+Sans:wght@400;700&family=Inter:wght@400;700&family=Work+Sans:wght@400;700&family=Inconsolata:wght@400;700&family=Dosis:wght@400;700&family=Exo+2:wght@400;700&family=Arvo:wght@400;700&family=Crimson+Text:wght@400;700&family=Lobster&family=Pacifico&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
