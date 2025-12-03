import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search, LayoutGrid, LayoutList } from "lucide-react";

import PropertyCard from "../components/PropertyCard";
import NavBar from "../components/NavigationBar";
import FilterPanel from "../components/Filterpanel";

import Footer from "../components/Footer";

const API_URL = import.meta.env.VITE_API_URL;

const PAGE_SIZE = 12;

const INITIAL_FILTERS = {
  propertyType: "all",
  capacity: "",
  gender: "",
  location: "",
  availability: "all",
};

function Properties() {
  // all properties from backend
  const [viewMode, setViewMode] = useState("grid");
  const [openFilter, setOpenFilter] = useState(false);

  // all properties from backend
  const [allProperties, setAllProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  // filter state (actually applied)
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  // filter state being edited in the modal (only applied on "Apply")
  const [pendingFilters, setPendingFilters] = useState(INITIAL_FILTERS);

  // 🔹 search keyword (from URL and search bar)
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 helper: apply keyword + filters together
  const applyAllFilters = (properties, filtersObj, keyword) => {
    const q = (keyword || "").trim().toLowerCase();

    return properties.filter((p) => {
      // keyword search (title / location / type)
      const title = (p.title || "").toLowerCase();
      const loc = (p.location || "").toLowerCase();
      const typeStr = (p.propertyType || "").toLowerCase();
      const matchSearch =
        !q || title.includes(q) || loc.includes(q) || typeStr.includes(q);

      // property type
      const matchType =
        filtersObj.propertyType === "all" ||
        typeStr === filtersObj.propertyType.toLowerCase();

      // capacity
      const matchCapacity =
        !filtersObj.capacity ||
        p.capacity === parseInt(filtersObj.capacity, 10);

      // gender
      const matchGender =
        !filtersObj.gender ||
        (p.gender || "").toLowerCase() === filtersObj.gender.toLowerCase();

      // location filter (separate from keyword)
      const matchLocationFilter =
        !filtersObj.location ||
        (p.location || "")
          .toLowerCase()
          .includes(filtersObj.location.toLowerCase());

      // availability
      const status = (p.status || "").toLowerCase();
      const matchAvailability =
        filtersObj.availability === "all" ||
        (filtersObj.availability === "vacant" && status === "vacant") ||
        (filtersObj.availability === "occupied" && status === "occupied");

      return (
        matchSearch &&
        matchType &&
        matchCapacity &&
        matchGender &&
        matchLocationFilter &&
        matchAvailability
      );
    });
  };

  // Fetch accommodations from backend on mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch(`${API_URL}/api/public/accommodations`);
        const data = await res.json();

        let accommodations = data.accommodations || [];

        // 🔒 Safety net: keep ONLY `listed` properties
        accommodations = accommodations.filter((a) => {
          const ls = (
            a.listingStatus || // camelCase from to_json()
            a.listing_status || // snake_case fallback
            "listed"
          ).toLowerCase();
          return ls === "listed";
        });

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

            // 🔹 NEW: pass SDA owner's contact details through to the frontend
            ownerPhone: a.ownerPhone || a.owner_phone || "",
            ownerEmail: a.ownerEmail || a.owner_email || "",
          };
        });

        setAllProperties(mapped);
      } catch (error) {
        console.error("Error fetching accommodations:", error);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search") || "";
    setSearchTerm(q);
  }, [location.search]);

  // Recalculate filtered list whenever data / filters / keyword change
  useEffect(() => {
    const filtered = applyAllFilters(allProperties, filters, searchTerm);
    setFilteredProperties(filtered);

    // 👇 RESET TO PAGE 1 WHEN RESULT SET CHANGES
    setCurrentPage(1);
  }, [allProperties, filters, searchTerm]);

  const handleFilterChange = (name, value) => {
    setPendingFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    // copy whatever is in the modal into the real filters
    setFilters(pendingFilters);
    setOpenFilter(false);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setPendingFilters(INITIAL_FILTERS);
    setFilters(INITIAL_FILTERS);
    setSearchTerm("");
    setCurrentPage(1);
    setOpenFilter(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // no extra logic needed; filtering reacts to searchTerm
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

  // 👇 PAGINATION DERIVED VALUES
  const totalPages = Math.ceil(filteredProperties.length / PAGE_SIZE) || 1;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedProperties = filteredProperties.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold mb-5">
          SDA Available Properties
        </h1>

        {/* Properties List */}
        <div className="lg:col-span-3">
          {/* Search and View Toggle Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="flex w-128 max-w-3xl items-center gap-3 bg-white rounded-full px-4 py-2"
            >
              <Input
                type="text"
                placeholder="Search title, location, or type"
                className="border-none focus-visible:ring-0 text-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                type="submit"
                className="bg-[#D2138C] hover:bg-pink-700 rounded-full text-white"
              >
                <Search className="h-4 w-4" /> Search
              </Button>
            </form>

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
                  onClick={() => {
                    // when opening the modal, start from the currently applied filters
                    setPendingFilters(filters);
                    setOpenFilter(true);
                  }}
                  className="rounded-full border-[#D2138C] text-[#D2138C] hover:bg-pink-50"
                >
                  <Filter className="h-4 w-4 mr-2" /> Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Properties Grid/List */}
          {filteredProperties.length > 0 ? (
            <>
              <div
                className={
                  viewMode === "grid"
                    ? "grid md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {paginatedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onClick={() => handlePropertySelect(property)}
                  />
                ))}
              </div>

              {/* 👇 Pagination controls */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-full text-sm border ${
                      currentPage === 1
                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                        : "text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-full text-sm border ${
                          page === currentPage
                            ? "bg-[#D2138C] text-white border-[#D2138C]"
                            : "text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-full text-sm border ${
                      currentPage === totalPages
                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                        : "text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
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
      {/* Filter Modal */}
      {openFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filter</h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setOpenFilter(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Property Type
                </label>
                <select
                  value={pendingFilters.propertyType}
                  onChange={(e) =>
                    handleFilterChange("propertyType", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D2138C]"
                >
                  <option value="all">All</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="group house">Group House</option>
                </select>
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  value={pendingFilters.capacity}
                  onChange={(e) =>
                    handleFilterChange("capacity", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D2138C]"
                  placeholder="Any"
                />
              </div>

              {/* Gender & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Gender
                  </label>
                  <select
                    value={pendingFilters.gender || ""}
                    onChange={(e) =>
                      handleFilterChange("gender", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D2138C]"
                  >
                    <option value="">Any</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Property Location
                  </label>
                  <input
                    type="text"
                    value={pendingFilters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D2138C]"
                    placeholder="Enter Location"
                  />
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Availability
                </label>
                <select
                  value={pendingFilters.availability}
                  onChange={(e) =>
                    handleFilterChange("availability", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D2138C]"
                >
                  <option value="all">All</option>
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="rounded-full"
              >
                Reset all
              </Button>
              <Button
                onClick={handleApplyFilters}
                className="bg-[#D2138C] hover:bg-pink-700 text-white rounded-full px-6"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Properties;
