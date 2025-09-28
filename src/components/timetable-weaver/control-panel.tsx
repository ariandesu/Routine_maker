'use client'

import { useRef } from 'react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CalendarDays, FileDown, FileUp, Share2, Palette } from "lucide-react";
import { Label } from '../ui/label';

interface ControlPanelProps {
  onShare: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: (format: 'PNG' | 'JPG' | 'PDF') => void;
}

export function ControlPanel({ onShare, onImport, onExport }: ControlPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold font-headline">Controls</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <Accordion type="multiple" defaultValue={['appearance', 'actions']} className="w-full">
            <AccordionItem value="appearance">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span>Appearance</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 p-1">
                <div className='space-y-2'>
                  <Label>Font Family</Label>
                  <Button variant="outline" className="w-full" disabled>Alegreya</Button>
                  <p className="text-xs text-muted-foreground">Font customization is coming soon.</p>
                </div>
                 <div className='space-y-2'>
                  <Label>Color Palette</Label>
                  <Button variant="outline" className="w-full" disabled>Indigo & Gold</Button>
                  <p className="text-xs text-muted-foreground">Color customization is coming soon.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="actions">
              <AccordionTrigger>Actions</AccordionTrigger>
              <AccordionContent className="space-y-2 p-1">
                <input type="file" ref={fileInputRef} onChange={onImport} accept=".csv" className="hidden" />
                <Button className="w-full justify-start" onClick={handleImportClick}><FileUp className="mr-2 h-4 w-4" /> Import from CSV</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start"><FileDown className="mr-2 h-4 w-4" /> Export</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onExport('PNG')}>as PNG</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExport('JPG')}>as JPG</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExport('PDF')}>as PDF</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" className="w-full justify-start" onClick={onShare}><Share2 className="mr-2 h-4 w-4" /> Share Schedule</Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
