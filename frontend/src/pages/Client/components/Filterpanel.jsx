import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { X } from "lucide-react";

function FilterPanel({ filters, onChange, onApply, onReset, onClose }) {
    return (
        <div className="absolute right-40 rounded-xl mt-14 w-80 bg-pink-50 p-5 z-50">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-gray-700 font-medium">Filter</h3>
            <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
            <X />
            </button>
        </div>

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
            <Label className="block text-sm font-medium mb-1">Bathrooms</Label>
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

        {/* Buttons */}
        <div className="flex justify-between">
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
        </div>
    );
}

export default FilterPanel;
