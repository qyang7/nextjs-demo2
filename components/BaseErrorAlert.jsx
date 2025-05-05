import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {AlertCircle} from "lucide-react";

export default function BaseErrorAlert({children}){
    return  <Alert variant="destructive" style={{border:'1px solid red', width:'90%'}}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className={'mt-2'}>Error</AlertTitle>
        <AlertDescription>
            {children}
        </AlertDescription>
    </Alert>
}