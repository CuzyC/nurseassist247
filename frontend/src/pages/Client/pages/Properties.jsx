import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search, LayoutGrid, LayoutList } from "lucide-react";

import PropertyCard from "../components/PropertyCard";
import NavBar from "../components/NavigationBar";
import FilterPanel from "../components/FilterPanel";

import Footer from "../components/Footer";

function Properties() {
  const [viewMode, setViewMode] = useState("grid");
  const [openFilter, setOpenFilter] = useState(false);

  // all properties from backend
  const [allProperties, setAllProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);

  // filter state
  const [filters, setFilters] = useState({
    propertyType: "all",
    rooms: "",
    bathrooms: "",
    suburb: "",
    availability: "all",
  });

  const navigate = useNavigate();

  // Fetch ALL accommodations from backend on mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch(
          "http://127.0.0.1:5000/api/public/accommodations"
        );
        const data = await res.json();

        const accommodations = data.accommodations || [];

        const mapped = accommodations.map((a) => {
          const imagesArray = a.images || [];

          // Normalize + remove empty values
          const validImages = imagesArray
            .map((img) =>
              typeof img === "string" ? img : img?.url || img?.path || null
            )
            .filter(Boolean); // removes "", null, undefined

          const status = (a.status || "").toLowerCase();
          const isAvailable =
            a.available !== undefined
              ? a.available
              : status === "available" || status === "vacant";

          return {
            id: a.id,
            title: a.title,
            location: a.location,
            capacity: a.capacity,
            gender: a.gender,
            images: validImages,
            description: a.description,
            features: a.features || [],
            propertyType:
              a.propertyType ||
              a.accommodationType ||
              a.accommodation_type ||
              "House",
            amenities: a.amenities || [],
            bedrooms: a.bedrooms,
            bathrooms: a.bathrooms,
            available: isAvailable,
            status: a.status,
          };
        });

        setAllProperties(mapped);
        setFilteredProperties(mapped);
      } catch (error) {
        console.error("Error fetching accommodations:", error);
      }
    };

    fetchProperties();
  }, []);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    const filtered = allProperties.filter((p) => {
      const matchType =
        filters.propertyType === "all" ||
        p.propertyType.toLowerCase() === filters.propertyType.toLowerCase();

      const matchRooms =
        !filters.rooms || p.bedrooms === parseInt(filters.rooms, 10);

      const matchBathrooms =
        !filters.bathrooms || p.bathrooms === parseInt(filters.bathrooms, 10);

      const matchSuburb =
        !filters.suburb ||
        p.location.toLowerCase().includes(filters.suburb.toLowerCase());

      const matchAvailability =
        filters.availability === "all" ||
        (filters.availability === "available" && p.available) ||
        (filters.availability === "unavailable" && !p.available);

      return (
        matchType &&
        matchRooms &&
        matchBathrooms &&
        matchSuburb &&
        matchAvailability
      );
    });

    setFilteredProperties(filtered);
    setOpenFilter(false);
  };

  const handleResetFilters = () => {
    setFilters({
      propertyType: "all",
      rooms: "",
      bathrooms: "",
      suburb: "",
      availability: "all",
    });
    setFilteredProperties(allProperties);
  };

  const handleSearch = () => {
    // optional: you can hook this into filters or a separate keyword state
    console.log("search clicked");
  };

  const slugify = (title) =>
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const handlePropertySelect = (property) => {
    const slug = slugify(property.title);

    navigate(`/properties/${property.id}/${slug}`, {
      state: { property },
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold mb-5">
          Specialist Disability Accommodation Properties
        </h1>

        {/* Properties List */}
        <div className="lg:col-span-3">
          {/* Search and View Toggle Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            {/* Search */}
            <div className="flex w-128 max-w-3xl items-center gap-3 bg-white rounded-full px-4 py-2">
              <Input
                type="text"
                placeholder="Search title, location, or type"
                className="border-none focus-visible:ring-0 text-gray-700"
              />
              <Button
                onClick={handleSearch}
                className="bg-[#D2138C] hover:bg-pink-700 rounded-full text-white"
              >
                <Search className="h-4 w-4" /> Search
              </Button>
            </div>

            {/* View Toggle + Filters */}
            <div className="flex justify-end">
              <div className="flex gap-2 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-[#D2138C] text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-[#D2138C] text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  aria-label="List view"
                >
                  <LayoutList className="w-5 h-5" />
                </button>
                <Button
                  variant="outline"
                  onClick={() => setOpenFilter(!openFilter)}
                  className="rounded-full border-[#D2138C] text-[#D2138C] hover:bg-pink-50"
                >
                  <Filter className="h-4 w-4 mr-2" /> Filters
                </Button>
              </div>

              {/* FilterPanel */}
              {openFilter && (
                <FilterPanel
                  filters={filters}
                  onChange={handleFilterChange}
                  onApply={handleApplyFilters}
                  onReset={handleResetFilters}
                  onClose={() => setOpenFilter(false)}
                />
              )}
            </div>
          </div>

          {/* Properties Grid/List */}
          {filteredProperties.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid md:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onClick={() => handlePropertySelect(property)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-[#f9e2e8] rounded-full flex items-center justify-center mx-auto mb-4">
                <LayoutGrid className="w-8 h-8 text-[#D2138C]" />
              </div>
              <h3 className="text-gray-900 mb-2">No Properties Found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters to see more results
              </p>
              <Button
                onClick={handleResetFilters}
                className="bg-[#D2138C] hover:bg-pink-700 rounded-full text-white"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Properties;
