import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

function FilterClientModal({ open, onClose, }){
    return(
        <Dialog open={open} onOpenChange={onClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>

            <ScrollArea>

            </ScrollArea>
          </DialogContent>
        </Dialog>
    )
}

export default FilterClientModal;