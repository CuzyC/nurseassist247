import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Users,
  Smile,
  BedDouble,
  Bath,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function PropertyCard({ property, onClick }) {
  const [currentImage, setCurrentImage] = useState(0);

  const images = property.images || [];
  const hasImages = images.length > 0;
  const mainImage = hasImages ? images[currentImage] : null;

  // Status styles for accommodation
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "bg-[#D2138C] hover:bg-[#D2138C] text-white";
      case "unavailable":
        return "bg-gray-200 hover:bg-gray-200 text-gray-700";
      case "coming soon":
        return "bg-amber-100 hover:bg-amber-100 text-amber-800 border border-amber-200";
      case "pending":
        return "bg-blue-100 hover:bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-gray-100 hover:bg-gray-100 text-gray-600";
    }
  };

  // Carousel image
  const prevImage = (e) => {
    e.stopPropagation();
    if (!hasImages) return;
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e) => {
    e.stopPropagation();
    if (!hasImages) return;
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {/* Image Gallery */}
      <div className="relative h-56 overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt={property.title}
            className="w-full h-full object-cover rounded-2xl transition-all duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-2xl text-gray-400 text-sm">
            No image available
          </div>
        )}

        {/* Prev / Next buttons */}
        {hasImages && images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 p-1.5 rounded-full shadow transition"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 p-1.5 rounded-full shadow transition"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {hasImages && images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-1.5 rounded-full ${
                  index === currentImage ? "bg-[#D2138C]" : "bg-white/70"
                }`}
              />
            ))}
          </div>
        )}

        {/* Status badge */}
        <Badge
          className={`absolute top-3 right-3 text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm ${getStatusStyle(
            property.status ||
              (property.available ? "available" : "unavailable")
          )}`}
        >
          {property.status
            ? property.status.charAt(0).toUpperCase() + property.status.slice(1)
            : property.available
            ? "Available"
            : "Unavailable"}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title and Location */}
        <h3 className="text-gray-900 text-base font-semibold mb-1 line-clamp-2">
          {property.title}
        </h3>
        <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span>{property.location}</span>
        </div>

        {/* Details */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-gray-700">
          <div className="flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5" />
            <span>{property.bedrooms} Bed</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5" />
            <span>{property.bathrooms} Bath</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>
              {property.capacity}{" "}
              {property.capacity === 1 ? "person" : "people"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {property.gender === "Men & Women" ? (
              <Users className="w-3.5 h-3.5" />
            ) : (
              <Smile className="w-3.5 h-3.5" />
            )}
            <span>{property.gender}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge
            variant="secondary"
            className="bg-[#D2138C] hover:bg-[#D2138C] text-white text-xs px-2 py-0.5"
          >
            {property.supportLevel}
          </Badge>
          <Badge
            variant="outline"
            className="text-gray-600 text-xs px-2 py-0.5"
          >
            {property.propertyType}
          </Badge>
        </div>

        {/* Read more */}
        <Button
          variant="outline"
          onClick={onClick}
          className="text-xs font-medium text-gray-700 border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          Read More
        </Button>
      </div>
    </div>
  );
}

export default PropertyCard;
