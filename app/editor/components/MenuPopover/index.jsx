"use client"

import {Popover, PopoverContent} from "@/components/ui/popover";
import {useEffect, useMemo, useRef} from "react";

export default function MenuPopover({popoverVisible,
                                        setPopoverVisible,
                                        popoverPosition,
                                        clickType,
                                        hasStartNode,
                                        onChange}) {
    const popoverRef = useRef(null);

    const onClick = (target) => {
        onChange && onChange(target)
        setPopoverVisible(false)
    }
    const items = useMemo(()=>{
        return  [
            {
                key: 'addNode', label: 'Add Node', disabled: clickType !== 'context'
            },
            {
                key: 'deleteNode', label: 'Delete Node', disabled: clickType !== 'node'
            },
            {
                key: 'addLinkStart', label: 'Add Link (Start Node)', disabled: clickType !== 'node'
            },
            {
                key: 'addLinkEnd', label: 'Add Link (End Node)', disabled: clickType !== 'node' || !hasStartNode
            },
            {
                key: 'deleteLink', label: 'Delete Link', disabled: clickType !== 'link'
            }
        ].filter(item => !item.disabled)
    },[clickType, hasStartNode])

    const handleClickOutside = (event) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target)) {
            setPopoverVisible(false);
        }
    };

    useEffect(() => {
        if (popoverVisible) {
            document.addEventListener('click', handleClickOutside);
        } else {
            document.removeEventListener('click', handleClickOutside);
        }
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [popoverVisible]);

    return popoverVisible ? (
        <Popover open={popoverVisible}>
            <PopoverContent
                ref={popoverRef}
                style={{
                    position: 'absolute',
                    top: popoverPosition.y + 15,
                    left: popoverPosition.x - 15,
                }}
            >
                <div>
                    {items.map(item => <div
                        className={'hover:bg-gray-100 p-1 cursor-pointer ' + (item.disabled ? 'text-gray-50 cursor-not-allowed' : '')}
                        onClick={()=>!item.disabled && onClick(item.key)}
                        key={item.key}>{item.label}</div>)}

                    {items?.length === 0 && <div>Nothing</div>}
                </div>
            </PopoverContent>
        </Popover>
    ) : null
}
