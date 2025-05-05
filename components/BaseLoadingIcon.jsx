import {Loader2} from "lucide-react";

export default function BaseLoadingIcon({loading, children}){
    return loading ? <Loader2 className="animate-spin  text-gray-400" size={18}/> : children
}