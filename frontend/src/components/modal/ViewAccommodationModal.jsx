import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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

        <ScrollArea className="h-[60vh] pr-4 mt-2">
          <div className="grid gap-4 py-4">
            {/* ID */}
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-gray-500">ID:</span>
              <span className="col-span-2 text-gray-900">
                #{accommodation.id}
              </span>
            </div>

            {/* Title */}
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-gray-500">Title:</span>
              <span className="col-span-2 text-gray-900">
                {accommodation.title}
              </span>
            </div>

            {/* Location */}
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-gray-500">Location:</span>
              <span className="col-span-2 text-gray-900">
                {accommodation.location}
              </span>
            </div>

            {/* Capacity */}
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-gray-500">Capacity:</span>
              <span className="col-span-2 text-gray-900">
                {accommodation.capacity}
              </span>
            </div>

            {/* Description */}
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-gray-500">Description:</span>
              <span className="col-span-2 text-gray-900">
                {accommodation.description}
              </span>
            </div>

            {/* Accommodation Type */}
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-gray-500">Type:</span>
              <span className="col-span-2 text-gray-900">
                {accommodation.accommodationType}
              </span>
            </div>

            {/* Gender */}
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-gray-500">Gender:</span>
              <span className="col-span-2 text-gray-900">
                {accommodation.gender}
              </span>
            </div>

            {/* Room Configuration */}
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-gray-500">Room Configuration:</span>
              <span className="col-span-2 text-gray-900">
                {accommodation.bedrooms} Bedrooms, {accommodation.bathrooms} Bathrooms
              </span>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-gray-500">Features:</span>
              <span className="col-span-2 text-gray-900">
                {accommodation.features}
              </span>
            </div>

            {/* Amenities */}
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-gray-500">Amenities:</span>
              <span className="col-span-2 text-gray-900">
                {accommodation.amenities}
              </span>
            </div>


            {/* Images */}
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-gray-500">Images:</span>
              <span className="col-span-2 text-gray-900">
                {accommodation.images}
              </span>
            </div>
            

            {/* Status */}
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-gray-500">Status:</span>
              <span className="col-span-2 text-gray-900">
                {accommodation.status}
              </span>
            </div>
          </div>
        </ScrollArea>

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
