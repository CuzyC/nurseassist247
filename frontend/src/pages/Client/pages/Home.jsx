import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";

import logo from "@/assets/logo.png";
import picture from "@/assets/landing page image.jpg";
import Footer from "../components/Footer";

import {
  Search,
  Home as HomeIcon,
  Heart,
  Shield,
  ArrowRight,
  CircleCheck,
  UsersRound,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import NavBar from "../components/NavigationBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PropertyCard from "../components/PropertyCard";

export default function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [allProperties, setAllProperties] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const handlePropertySelect = (property) => {
    navigate(`/properties/${property.id}`);
  };
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch properties once so we can show suggestions
  useEffect(() => {
    const fetchProps = async () => {
      try {
        const res = await fetch(`${API_URL}/api/public/accommodations`);
        const data = await res.json();

        const mapped = (data.accommodations || []).map((a) => ({
          id: a.id,
          title: a.title || "",
          location: a.location || "",
          propertyType: a.propertyType || a.accommodationType || a.accommodation_type || ""
        }));

        setAllProperties(mapped);
      } catch (err) {
        console.error("Error fetching properties for suggestions:", err);
      }
    };

    fetchProps();
  }, []);

  // When you click Search (or press Enter)
  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchTerm.trim();

    if (!q) {
      // Empty → just go to Properties page
      navigate("/properties");
    } else {
      // With text → go to Properties with ?search=
      navigate(`/properties?search=${encodeURIComponent(q)}`);
    }
  };

  // Typing in the search box (for suggestions)
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const q = value.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      return;
    }

    const matches = allProperties
      .filter((p) => {
        const t = (p.title || "").toLowerCase();
        const l = (p.location || "").toLowerCase();
        const type = (p.propertyType || "").toLowerCase();
        return t.includes(q) || l.includes(q) || type.includes(q);
      })
      .slice(0, 5); // top 5 suggestions

    setSuggestions(matches);
  };

  // Clicking a suggestion → go to Properties with that title
  const handleSuggestionClick = (prop) => {
    navigate(`/properties?search=${encodeURIComponent(prop.title)}`);
  };

  return (
    <div className="min-h-screen w-full">
      {/* Navigation Bar */}
      <NavBar />

      {/* Hero section */}
      <section
        className="relative bg-gradient-to-b from-[#D2138C] to-[#FCE8F3] 
            lg:bg-gradient-to-r lg:from-[#D2138C] lg:to-[#FCE8F3] py-20 overflow-hidden min-h-screen"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <h1 className="text-white leading-tight text-6xl font-bold ">
                Find Your Perfect SDA Home
              </h1>
              <p className="leading-relaxed text-white text-lg">
                Discover SDA designed for your unique needs. Browse accessible,
                comfortable homes across Australia with the support you deserve.
              </p>

              {/* Search Bar + Suggestions */}
              <div className="space-y-2 relative max-w-xl">
                <form
                  onSubmit={handleSearch}
                  className="bg-white rounded-2xl p-2 shadow-md flex gap-2"
                >
                  <div className="flex-1 flex items-center gap-2 px-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Search by location or property type..."
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      value={searchTerm}
                      onChange={handleChange}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-[#D2138C] hover:bg-[#950E64] text-white rounded-xl px-6"
                  >
                    Search
                  </Button>
                </form>

                {/* Suggestions dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg overflow-hidden max-w-[640px] z-20">
                    {suggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSuggestionClick(s)}
                        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-pink-50 transition-colors border-none outline-none focus-visible:ring-0"
                      >
                        <Search className="w-4 h-4 mt-1 text-gray-400 shrink-0" />

                        <div className="text-sm font-medium text-gray-900">
                          {s.title}
                        </div>
                        <div className="text-sm text-gray-600 mt-0.5">
                          {s.location}
                          {s.propertyType ? ` • ${s.propertyType}` : ""}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <img
                src="https://nurseassist247.com.au/wp-content/uploads/2024/12/b23a01e3c64741d994422b58f59121d7-Baldivis-2024-12-09-043215-1-scaled-1.jpg"
                alt="Modern accessible home"
                className="w-full h-full object-cover rounded-2xl transition-all duration-300"
              />
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#f9e2e8] rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-[#D2138C]" />
                  </div>
                  <div>
                    <p className="text-gray-900">Trusted Service</p>
                    <p className="text-sm text-gray-600">NDIS Registered</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties*/}
      <section className="w-full bg-color-pink/10 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
          {/* Heading */}
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
              Featured Properties
            </h2>
            <p className="mt-4 text-gray-700 max-w-2xl mx-auto">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam accusantium sed cumque est eveniet adipisci sint? Totam optio tenetur libero praesentium a nisi, deserunt dolores dolorum, velit natus, nam aspernatur.
            </p>
          </div>

          {/* Featured Lists */}
          <div className="grid gap-6 md:gap-8 md:grid-cols-3">
            {allProperties.slice(0, 3).map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={() => handlePropertySelect(property)}
              />
            ))}
          </div>

          {/* CTA button */}
          <div className="flex mt-4 items-center justify-center">
            <Button
              onClick={() => navigate('/properties')}
              className="w-full sm:w-auto rounded-full px-6 py-6 text-lg bg-[#D2138C] hover:bg-pink-700"
            >
              View more properties
            </Button>
          </div>

        </div>
      </section>

      {/* List your property */}
      <section className="w-full py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text + CTA */}
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-semibold text-[#D2138C]">
                Turn your accommodation into their next home
              </h2>

              <p className="mt-3 text-md md:text-lg text-gray-700 max-w-prose">
                List your SDA property so participants, 
                coordinators and providers can discover it — quick verification, flexible bookings.
              </p>
              <div className="mt-4">
                <Link to="/register">
                  <Button className="rounded-full px-5 py-6 text-lg bg-[#D2138C] hover:bg-pink-700">
                    List your property
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex justify-center">
              <img
                src={picture}
                alt="SDA illustration"
                className="w-82 h-100 object-cover rounded-2xl transition-all duration-300"
              />
            </div>

            
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="w-full bg-color-pink/10 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
          {/* Heading */}
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
              Your SDA Journey in 3 Simple Steps
            </h2>
            <p className="mt-4 text-gray-700 max-w-2xl mx-auto">
              Finding your perfect SDA home or connecting with participants is simple – choose your path below.
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="seeker" className="mt-10 w-full">
            {/* Pill tabs */}
            <div className="flex justify-center">
              <TabsList
                className="
                  inline-flex items-center justify-center
                  rounded-full bg-white
                  shadow-[0_16px_40px_rgba(15,23,42,0.12)]
                  p-2 h-16
                "
              >
                <TabsTrigger
                  value="seeker"
                  className="
                    px-10 py-3 text-base md:text-lg font-semibold rounded-full
                    transition-all
                    data-[state=active]:bg-[#D2138C]
                    data-[state=active]:text-white
                    data-[state=active]:shadow-[0_10px_25px_rgba(234,109,151,0.55)]
                    data-[state=inactive]:text-gray-500
                    data-[state=inactive]:bg-transparent
                  "
                >
                  Seeker
                </TabsTrigger>
                <TabsTrigger
                  value="lister"
                  className="
                    px-10 py-3 text-base md:text-lg font-semibold rounded-full
                    transition-all
                    data-[state=active]:bg-[#D2138C]
                    data-[state=active]:text-white 
                    data-[state=active]:shadow-[0_10px_25px_rgba(234,109,151,0.55)]
                    data-[state=inactive]:text-gray-500
                    data-[state=inactive]:bg-transparent
                  "
                >
                  Lister
                </TabsTrigger>
              </TabsList>
            </div>

            {/* SEEKER STEPS */}
            <TabsContent value="seeker" className="mt-12">
              <div className="grid gap-6 md:gap-8 md:grid-cols-3">
                <div className="bg-white rounded-3xl shadow-md p-6 md:p-8 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-lg transition">
                  <Feature
                    icon={<HomeIcon className="h-6 w-6" />}
                    title="Browse Properties"
                    text="Search our database of accessible homes tailored to your specific support needs."
                  />
                </div>
                <div className="bg-white rounded-3xl shadow-md p-6 md:p-8 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-lg transition">
                  <Feature
                    icon={<LayoutGrid className="h-6 w-6" />}
                    title="Simple Property Dashboard"
                    text="Explore comprehensive information about accessibility features and amenities."
                  />
                </div>
                <div className="bg-white rounded-3xl shadow-md p-6 md:p-8 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-lg transition">
                  <Feature
                    icon={<Shield className="h-6 w-6" />}
                    title="Apply with Confidence"
                    text="Contact us to apply and we'll guide you through the process to your new home."
                  />
                </div>
              </div>
            </TabsContent>

            {/* LISTER STEPS */}
            <TabsContent value="lister" className="mt-12">
              <div className="grid gap-6 md:gap-8 md:grid-cols-3">
                <div className="bg-white rounded-3xl shadow-md p-6 md:p-8 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-lg transition">
                  <Feature
                    icon={<UsersRound className="h-6 w-6" />}
                    title="Reach More Participants"
                    text="Your property appears in front of families, coordinators, and individuals searching for SDA homes."
                  />
                </div>
                <div className="bg-white rounded-3xl shadow-md p-6 md:p-8 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-lg transition">
                  <Feature
                    icon={<LayoutGrid className="h-6 w-6" />}
                    title="Manage Listings Easily"
                    text="Update your listing, manage enquiries, and track bookings all in one place."
                  />
                </div>
                <div className="bg-white rounded-3xl shadow-md p-6 md:p-8 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-lg transition">
                  <Feature
                    icon={<CircleCheck className="h-6 w-6" />}
                    title="Approve or Decline Requests"
                    text="Review participant enquiries and choose who stays in your accommodation."
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 mb-4 text-3xl font-semibold">What Our Residents Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from people who have found their perfect home through SDA Living
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'John Doe',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
              },
              {
                name: 'John Doe',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
              },
              {
                name: 'John Doe',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-[#f9e2e8]/30 rounded-2xl p-6">
                <p className="text-gray-600 text-sm leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center mt-2">
                  <p className="text-[#D2138C] font-bold">{testimonial.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#f9e2e8] to-[#fce8ed]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-gray-900 mb-4 font-semibold text-lg">Ready to Find Your Perfect Home?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Browse our complete selection of accessible properties or get in touch with our team
            for personalized assistance in finding the right SDA home for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/properties')}
              className="bg-[#D2138C] hover:bg-pink-700 text-white rounded-xl px-8"
            >
              Browse Properties
            </Button>
            <Button
              onClick={() => navigate('/contact')}
              variant="outline"
              className="rounded-xl border-[#D2138C] text-[#D2138C] hover:text-[#950E64] hover:border-[#950E64]"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 h-8 w-8 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{text}</p>
      </div>
    </div>
  );
}
