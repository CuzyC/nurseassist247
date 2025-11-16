import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import NavBar from "../components/NavigationBar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Send,
  MapPin,
  Users,
  Smile,
  BedDouble,
  Bath,
  ArrowLeft,
} from "lucide-react";

import Footer from "../components/Footer";

// same slugify logic as PropertyDetails
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function Enquire() {
  const { id } = useParams(); // we don't really need slug from params since we can regenerate it
  const location = useLocation();
  const navigate = useNavigate();

  const property = location.state?.property || null;
  const slug = property ? slugify(property.title || "property") : "";

  // Handle direct access / refresh where state is lost
  if (!property) {
    return (
      <div>
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate("/properties")}
            className="flex items-center gap-2 text-gray-600 hover:text-[#D2138C] transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to properties
          </button>
          <p className="text-gray-700">
            We couldn’t load the property details. Please go back to the
            properties page and select a property again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/properties">Properties</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>{property.title}</BreadcrumbPage>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>Enquire</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Accommodation Information */}
          <div className="p-8">
            {/* Title and Location */}
            <div className="flex items-center gap-1 mb-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{property.location}</span>
            </div>
            <h2 className="text-xl font-normal mb-2">{property.title}</h2>

            {/* Some Details */}
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

            {/* Description */}
            <div className="mb-4 text-gray-700">
              <p className="text-sm font-normal">{property.description}</p>
            </div>

            {/* View Accommodation details */}
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() =>
                navigate(`/properties/${property.id}/${slug}`, {
                  state: { property },
                })
              }
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> View accommodation details
            </Button>
          </div>

          {/* Enquire Form */}
          <div className="p-8">
            <h2 className="text-gray-900 text-xl font-normal mb-2">
              Enquire about this Property
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Tell us a little about what you need and we'll get back to you
              shortly.
            </p>

            <form className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Type your message or questions here..."
                  rows={5}
                  required
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#D2138C] hover:bg-[#D2138C] text-white rounded-xl cursor-pointer"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
    
  );
}

export default Enquire;
