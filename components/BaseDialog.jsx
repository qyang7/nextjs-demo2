import {
    Dialog,
    DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button";
import {BaseLoadingButton} from "@/components/BaseLoadingButton.jsx";

export default function BaseDialog({ width, title, children, open, onCancel, onOk=()=>{}, footer=true, loading=false }) {
  const handleClose = () => {
    if (onCancel) onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTitle/>
      <DialogContent
          style={{width, maxHeight:'80%', overflowY:'auto'}}
      >
          <DialogHeader>
              <DialogTitle style={{marginTop:'-8px'}}>{title}</DialogTitle>
              <DialogDescription  style={{marginTop:'-20px'}}></DialogDescription>
          </DialogHeader>

        {children}
        { !!footer && <DialogFooter>
          <BaseLoadingButton loading={loading}>
              <Button type="submit" onClick={onOk}>Confirm</Button>
          </BaseLoadingButton>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
