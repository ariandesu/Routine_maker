
'use client'

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface DimensionControlsProps {
  cellWidth: number;
  onCellWidthChange: (value: number[]) => void;
  cellHeight: number;
  onCellHeightChange: (value: number[]) => void;
}

export function DimensionControls({ cellWidth, onCellWidthChange, cellHeight, onCellHeightChange }: DimensionControlsProps) {
  return (
    <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="flex items-center gap-2 w-full sm:w-auto sm:min-w-36">
            <Label htmlFor="width-slider" className="text-xs">Width</Label>
            <Slider
                id="width-slider"
                min={80} 
                max={250}
                step={10}
                value={[cellWidth]}
                onValueChange={onCellWidthChange}
            />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto sm:min-w-36">
            <Label htmlFor="height-slider" className="text-xs">Height</Label>
            <Slider
                id="height-slider"
                min={50} 
                max={150}
                step={10}
                value={[cellHeight]}
                onValueChange={onCellHeightChange}
            />
        </div>
    </div>
  );
}
