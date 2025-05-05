import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";

export default function BasePopover({children, content}){
    return <Popover>
        <PopoverTrigger asChild>
            {children}
        </PopoverTrigger>
        <PopoverContent className="w-96">
            {content}
        </PopoverContent>
    </Popover>
}