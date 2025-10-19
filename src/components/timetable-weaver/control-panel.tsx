
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

interface ControlPanelProps {
  onShare: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: (format: 'PNG' | 'JPG' | 'PDF' | 'CSV') => void;
}

export function ControlPanel({ onShare, onImport, onExport }: ControlPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="flex items-center gap-2">
      <input type="file" ref={fileInputRef} onChange={onImport} accept=".csv" className="hidden" />
      <Button onClick={handleImportClick}><FileUp className="mr-2 h-4 w-4" /> Import</Button>
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
    </div>
  );
}
