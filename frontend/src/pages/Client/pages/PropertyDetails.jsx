import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  MapPin,
  House,
  BedDouble,
  Bath,
  Users,
  ArrowLeft,
  Check,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Smile,
} from "lucide-react";
import NavBar from "../components/NavigationBar";
import Footer from "../components/Footer";

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function PropertyDetails() {
  const [currentImage, setCurrentImage] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  const property = location.state?.property;

  if (!property) {
    // Handle direct navigation without state
    return (
      <div className="p-8 text-center">
        <p>Property not found.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const slug = slugify(property.title || "property");

  const images = (property.images || []).filter(Boolean);
  const hasImages = images.length > 0;
  const mainImage = hasImages ? images[currentImage] : null;

  // Carousel image
  const nextImage = (e) => {
    e.stopPropagation();
    if (!hasImages) return;
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (!hasImages) return;
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Status styles for accommodation
  const getStatusStyle = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "vacant":
        return "bg-[#D2138C] hover:bg-[#D2138C] text-white";
      case "occupied":
        return "bg-gray-200 hover:bg-gray-200 text-gray-700";
      case "coming soon":
        return "bg-amber-100 hover:bg-amber-100 text-amber-800 border border-amber-200";
      case "pending":
        return "bg-blue-100 hover:bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-gray-100 hover:bg-gray-100 text-gray-600";
    }
  };

  return (
    <div>
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/properties")}
          className="flex items-center gap-2 text-gray-600 hover:text-[#D2138C] transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to listings
        </button>

        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/properties">Properties</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{property.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white overflow-hidden">
              <div className="relative h-96">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={`${property.title} - Image ${currentImage + 1}`}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-2xl text-gray-400 text-sm">
                    No image available
                  </div>
                )}

                {/* Navigation Buttons */}
                {hasImages && images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-800" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-800" />
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
                          index === currentImage
                            ? "bg-[#D2138C]"
                            : "bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Status badge */}
                <div
                  className={`absolute top-3 right-3 font-medium text-white px-4 py-2 rounded-full ${getStatusStyle(
                    property.status || (property.available ? "vacant" : "occupied")
                  )}`}
                >
                  {property.status
                    ? property.status.charAt(0).toUpperCase() + property.status.slice(1)
                    : property.available
                    ? "Vacant"
                    : "Occupied"}
                </div>
              </div>

              

              {/* Thumbnail Strip */}
              {hasImages && images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        currentImage === index
                          ? "border-[#D4879C]"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title and Location */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold mb-4">
                  {property.title}
                </h1>
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{property.location}</span>
                </div>
              </div>
            </div>

            {/* Property Stats */}
            <div className="bg-white rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-700">
                {/* Bedrooms */}
                <div className="flex items-center">
                  <div className="w-9 h-9 flex items-center justify-center">
                    <BedDouble className="w-5 h-5 text-[#D2138C]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      {property.bedrooms} Bedrooms
                    </p>
                  </div>
                </div>

                {/* Bathrooms */}
                <div className="flex items-center">
                  <div className="w-9 h-9 flex items-center justify-center">
                    <Bath className="w-5 h-5 text-[#D2138C]" />
                  </div>
                  <p className="text-sm text-gray-900">
                    {property.bathrooms} Bathrooms
                  </p>
                </div>

                {/* Capacity */}
                <div className="flex items-center">
                  <div className="w-9 h-9 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#D2138C]" />
                  </div>
                  <p className="text-sm text-gray-900">
                    {property.capacity}{" "}
                    {property.capacity === 1 ? "Person" : "People"}
                  </p>
                </div>

                {/* Property Type */}
                <div className="flex items-center">
                  <div className="w-9 h-9 flex items-center justify-center">
                    <House className="w-5 h-5 text-[#D2138C]" />
                  </div>
                  <p className="text-sm text-gray-900">
                    {property.propertyType}
                  </p>
                </div>

                {/* Gender */}
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 flex items-center justify-center">
                    <Smile className="w-5 h-5 text-[#D2138C]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{property.gender}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-5">
              <h2 className="text-gray-900 text-xl font-semibold mb-4">
                About This Property
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {property.description}
              </p>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl p-5">
              <h2 className="text-gray-900 text-xl font-semibold mb-4">
                Features
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {(property.features || []).map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-5 h-5 text-[#D2138C]" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl p-5">
              <h2 className="text-gray-900 text-xl font-semibold mb-4">
                Amenities
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {(property.amenities || []).map((amenity, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-5 h-5 text-[#D2138C]" />
                    </div>
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-20">
              <h3 className="text-gray-900 text-lg font-medium mb-4">
                Interested in this property?
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Discover more about our supported living homes designed to
                provide comfort, safety, and independence for every resident.
              </p>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3">
                  <Phone className="w-5 h-5 text-[#d4879c]" />
                  <p className="text-gray-900 text-sm">123 Nurse Assist</p>
                </div>
                <div className="flex items-center gap-3 p-3">
                  <Mail className="w-5 h-5 text-[#d4879c]" />
                  <p className="text-gray-900 text-sm">
                    info@nurseassist247.com.au
                  </p>
                </div>
              </div>

              <Button
                onClick={() =>
                  navigate(`/properties/${property.id}/${slug}/enquire`, {
                    state: { property },
                  })
                }
                className="w-full bg-[#D2138C] text-white rounded-xl mb-3 cursor-pointer"
              >
                Enquire Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default PropertyDetails;
