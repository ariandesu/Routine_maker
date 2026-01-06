
'use client'

import { useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileDown, FileUp, Share2 } from "lucide-react";
import { ModeToggle } from './mode-toggle';

interface ActionButtonsProps {
  onShare: () => void;
  onExport: (format: 'PNG' | 'JPG' | 'PDF' | 'CSV') => void;
}

export function ActionButtons({ onShare, onExport }: ActionButtonsProps) {
  
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline"><FileDown className="mr-2 h-4 w-4" /> Export</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onExport('PNG')}>as PNG</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport('JPG')}>as JPG</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport('PDF')}>as PDF</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport('CSV')}>as CSV</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline" onClick={onShare}><Share2 className="mr-2 h-4 w-4" /> Share</Button>
      <ModeToggle />
    </div>
  );
}
