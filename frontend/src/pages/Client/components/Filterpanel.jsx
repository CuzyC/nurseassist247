import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

function FilterPanel({
  filters,
  onChange,
  onApply,
  onReset,
  onClose,
  open = false, // expects a boolean prop; default false
}) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose?.(); }}>
      <DialogContent className="sm:max-w-md w-[320px] rounded-xl p-5">
        <DialogHeader className="p-0 mb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-gray-700 font-medium text-base">Filter</DialogTitle>

            <DialogClose asChild>
              <button
                aria-label="Close"
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                <X />
              </button>
            </DialogClose>
          </div>
        </DialogHeader>

        {/* Property Type */}
        <div className="mb-4">
          <Label className="block text-sm font-medium mb-1">Property Type</Label>
          <Select
            value={filters.propertyType}
            onValueChange={(v) => onChange("propertyType", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="group-home">Group Home</SelectItem>
              <SelectItem value="appartment">Apartment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Room Count */}
        <div className="mb-4 flex gap-2">
          <div className="w-1/2">
            <Label className="block text-sm font-medium mb-1">Rooms</Label>
            <Select
              value={filters.rooms}
              onValueChange={(v) => onChange("rooms", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-1/2">
            <Label className="block text-sm font medium mb-1">Bathrooms</Label>
            <Select
              value={filters.bathrooms}
              onValueChange={(v) => onChange("bathrooms", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Suburb */}
        <div className="mb-4">
          <Label className="block text-sm font-medium mb-1">Suburb</Label>
          <Input
            placeholder="Enter suburb"
            value={filters.suburb}
            onChange={(e) => onChange("suburb", e.target.value)}
          />
        </div>

        {/* Availability */}
        <div className="mb-6">
          <Label className="block text-sm font-medium mb-1">Availability</Label>
          <Select
            value={filters.availability}
            onValueChange={(v) => onChange("availability", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="p-0">
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              className="rounded-full text-gray-600 border-gray-300"
              onClick={onReset}
            >
              Reset all
            </Button>
            <Button
              className="bg-[#D2138C] text-white rounded-full hover:bg-pink-700"
              onClick={onApply}
            >
              Apply
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FilterPanel;
