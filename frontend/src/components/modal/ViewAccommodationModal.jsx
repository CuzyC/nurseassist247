import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function ViewAccommodationModal({ open, onOpenChange, accommodation }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Accommodation Details</DialogTitle>
          <DialogDescription>
            View complete information about this accommodation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* ID */}
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-gray-500">ID:</span>
            <span className="col-span-2 text-gray-900">
              #{accommodation.id}
            </span>
          </div>

          {/* Accommodation Type */}
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-gray-500">Type:</span>
            <span className="col-span-2 text-gray-900">
              {accommodation.type}
            </span>
          </div>

          {/* Room Configuration */}
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-gray-500">Configuration:</span>
            <span className="col-span-2 text-gray-900">
              {accommodation.roomConfiguration}
            </span>
          </div>

          {/* Suburb */}
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-gray-500">Suburb:</span>
            <span className="col-span-2 text-gray-900">
              {accommodation.suburb}
            </span>
          </div>

          {/* Address */}
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-gray-500">Address:</span>
            <span className="col-span-2 text-gray-900">
              {accommodation.address}
            </span>
          </div>

          {/* Status */}
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-gray-500">Status:</span>
            <div className="col-span-2">
              <Badge
                variant={
                  accommodation.availabilityStatus === "Vacant"
                    ? "default"
                    : "secondary"
                }
                className={
                  accommodation.availabilityStatus === "Vacant"
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }
              >
                {accommodation.availabilityStatus}
              </Badge>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ViewAccommodationModal;
