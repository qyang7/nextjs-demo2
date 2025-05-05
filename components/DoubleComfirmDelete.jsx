import React, { useState } from 'react';
import { Trash2 } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export default function DoubleConfirmDelete({ onDelete=()=>{}, size=18 }) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const handleDelete = () => {
        setIsPopoverOpen(false);
        onDelete();
    };

    return (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
                <Trash2 size={size} style={{ color: 'red', cursor: 'pointer' }} />
            </PopoverTrigger>
            <PopoverContent>
                <div>Are you sure you want to delete?</div>
                <div className="flex justify-end space-x-2 mt-2">
                    <Button size={'sm'} className={'cursor-pointer'} variant="secondary" onClick={() => {
                        setIsPopoverOpen(false)
                    }}>Cancel</Button>
                    <Button size={'sm'}  className={'cursor-pointer'}   variant="destructive" onClick={handleDelete}>Confirm</Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}