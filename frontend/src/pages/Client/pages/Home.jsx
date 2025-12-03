import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

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

export default function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [allProperties, setAllProperties] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

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
          propertyType:
            a.propertyType || a.accommodationType || a.accommodation_type || "",

          // 🔹 optional: keep owner contact on suggestions too
          ownerPhone: a.ownerPhone || a.owner_phone || "",
          ownerEmail: a.ownerEmail || a.owner_email || "",
          
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

      {/* How it works */}
      <section className="w-full border-y border-gray-200 bg-white">
        <div className="text-center mt-12">
          <h2 className="text-gray-900 mb-4 text-3xl font-semibold">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Finding your perfect SDA home is simple with our three-step process
          </p>
        </div>
        <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10">
          <Feature
            icon={<HomeIcon className="h-5 w-5" />}
            title="Browse Properties"
            text="Search our database of accessible homes tailored to your specific support needs."
          />
          <Feature
            icon={<HomeIcon className="h-5 w-5" />}
            title="Simple Property Dashboard"
            text="Explore comprehensive information about accessibility features and amenities"
          />
          <Feature
            icon={<Shield className="h-5 w-5" />}
            title="Approve or Decline Requests"
            text="Contact us to apply and we'll guide you through the process to your new home"
          />
        </div>
      </section>

      {/* List your property */}
      <section className="w-full">
        <div className="max-w-5xl mx-auto py-8 md:py-8 grid md:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold text-pink-600">
              Turn your accommodation into their next home
            </h2>

            <p className="mt-3 text-md md:text-lg text-gray-700 max-w-prose">
              List your SDA property so participants, 
              coordinators and providers can discover it — quick verification, flexible bookings.
            </p>

            <div className="mt-4">
              <Link to="/register">
                <Button className="rounded-full px-5 py-6 text-sm bg-pink-600 hover:bg-pink-700">
                  List your property
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <img
              src={picture}
              alt="SDA illustration"
              className="w-72 md:w-88 max-w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* FEATURES (3 columns) */}
      <section className="w-full border-y border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10">
          <Feature
            icon={<UsersRound className="h-5 w-5" />}
            title="Reach more Participants"
            text="Your property appears in front of families, coordinators, and individuals searching for SDA homes."
          />
          <Feature
            icon={<LayoutGrid className="h-5 w-5" />}
            title="Simple Property Dashboard"
            text="Update your listing, manage enquiries, and track bookings all in one place."
          />
          <Feature
            icon={<CircleCheck className="h-5 w-5" />}
            title="Approve or Decline Requests"
            text="Review participant enquiries and choose who stays in your accommodation."
          />
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
      <div className="mt-1 h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{text}</p>
      </div>
    </div>
  );
}
