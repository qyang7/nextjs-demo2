import {Check, File} from "lucide-react";
import {useState} from "react";
import {copyToClipboard} from "@/utils/common.js";

export default function CopyText({copyable, text}) {
    const [copy, setCopy] = useState(false)
    const click = (e) => {
        const msg = copyable?.text || text
        copyToClipboard(msg).then(() => {
            setCopy(true)
        })
    }
    return <>
        {copy ? <Check size={16} className={'text-blue-500'}/> :
            <File onClick={click} size={14} className={'text-blue-500 cursor-pointer pointer-events-auto'}/>}
    </>
}