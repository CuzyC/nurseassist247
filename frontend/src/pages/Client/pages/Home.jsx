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

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-[#f9e2e8]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="h-16 flex items-center justify-between py-6">
              <a href="/">
                <img src={logo} alt="Logo" className="h-16 w-full" />
              </a>
            </div>

            {/* Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href="/properties"
                className="text-foreground hover:text-[#D2138C] transition-colors"
              >
                Properties
              </a>
              <a
                href="#"
                className="text-foreground hover:text-[#D2138C] transition-colors"
              >
                About Us
              </a>
              <a
                href="#"
                className="text-foreground hover:text-[#D2138C] transition-colors"
              >
                What We Do
              </a>
            </div>

            <div className="space-x-2">
              {/* Contact Us */}
              <Button
                variant="default"
                className="bg-[#D2138C] hover:bg-pink-700 rounded-full text-white"
              >
                Contact Us
              </Button>

              {/* Sign In */}
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="text-sm rounded-full border border-gray-200 hover:bg-gray-50"
              >
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <section
        className="relative bg-gradient-to-b from-[#D2138C] to-[#FCE8F3] 
            lg:bg-gradient-to-r lg:from-[#D2138C] lg:to-[#FCE8F3] py-20 overflow-hidden"
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

              {/* Search Bar */}
              <div className="bg-white rounded-2xl p-2 shadow-md flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3">
                  <Search className="w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by location or property type..."
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <Button className="bg-[#D2138C] hover:bg-[#950E64] text-white rounded-xl px-6">
                  Search
                </Button>
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
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-10 grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-pink-600">
              Your Accommodation,
              <br /> Their Next Home
            </h2>

            <p className="mt-3 text-sm md:text-base text-gray-700 max-w-prose">
              List your SDA property and help participants find safe,
              independent living spaces.
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

      {/* FAQ */}
      <section className="w-full">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-10">
            <h2 className="text-3xl font-semibold">Your questions, answered</h2>

            <div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="q1" className="border-b border-gray-200">
                  <AccordionTrigger className="py-5">
                    Who can list an SDA property?
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-gray-700">
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                    Autem, eveniet voluptate! Debitis consequuntur laudantium
                    possimus sequi consectetur optio ab temporibus laboriosam
                    est? Ipsum obcaecati, accusamus nostrum libero cumque neque
                    minus.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q2" className="border-b border-gray-200">
                  <AccordionTrigger className="py-5">
                    Is listing my property free?
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-gray-700">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Illo ea excepturi fugiat porro aspernatur sunt tempore
                    blanditiis error earum distinctio quasi doloremque numquam
                    reprehenderit, voluptatibus optio laboriosam ab saepe
                    corporis?
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q3" className="border-b border-gray-200">
                  <AccordionTrigger className="py-5">lorem</AccordionTrigger>
                  <AccordionContent className="pb-5 text-gray-700">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Sequi nostrum id ex excepturi magni earum maiores debitis
                    omnis, molestiae eligendi enim dignissimos a impedit
                    veritatis quos corporis maxime vero blanditiis.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q4" className="border-b border-gray-200">
                  <AccordionTrigger className="py-5">
                    Can I edit my listing after publishing?
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-gray-700">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut
                    quae dolorem assumenda, commodi illum nemo nesciunt, libero
                    quaerat corrupti, at blanditiis? Placeat repellat aliquam
                    neque ut iure laborum, odio assumenda?
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q5" className="border-b border-gray-200">
                  <AccordionTrigger className="py-5">
                    Do I have control over who stays at my property?
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-gray-700">
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                    Veritatis rerum reprehenderit aspernatur nulla vero fuga
                    possimus alias architecto, suscipit maiores minima beatae,
                    molestiae vitae est illum quasi dolorum facere quo?
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <p className="mt-8 text-sm text-gray-600">
                Still have questions? Check out our{" "}
                <a
                  className="text-pink-600 font-medium hover:underline"
                  href="#"
                >
                  FAQ
                </a>{" "}
                or reach out to us at{" "}
                <a
                  className="text-pink-600 font-medium hover:underline"
                  href="mailto:admin@nurseassist247.com.au"
                >
                  admin@nurseassist247.com.au
                </a>
              </p>
            </div>
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
