import {Skeleton} from "@/components/ui/skeleton";

export default function BaseLoadingSkeleton({loading, children}){
    return loading ? <div className="space-y-4 pt-10">
        <Skeleton className="h-4 w-[250px]"/>
        <Skeleton className="h-4 w-[200px]"/>
        <Skeleton className="h-4 w-[250px]"/>
        <Skeleton className="h-4 w-[200px]"/>
    </div> : children
}
