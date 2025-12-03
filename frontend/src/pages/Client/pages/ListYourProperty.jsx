import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CircleCheck, UsersRound, LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";
import picture from "@/assets/landing page image.jpg";
import Logo from "@/assets/logo.png";

export default function ListYourProperty() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Top Nav */}
      <header className="w-full">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={Logo} alt="Nurse Assist 24/7" className="h-16 w-full" />
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm rounded-full border border-gray-200 hover:bg-gray-50"
            >
              Sign in
            </Link>

            <Link to="/register">
              <Button className="rounded-full px-4 py-2 text-sm bg-pink-600 hover:bg-pink-700">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="w-full">
        <div className="max-w-6xl mx-auto px-6 pt-8 pb-16 md:pt-12 md:pb-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-[42px] leading-tight font-bold text-pink-600">
              Your Accommodation,
              <br /> Their Next Home
            </h1>
            <p className="mt-4 text-[17px] text-gray-700 max-w-prose">
              List your SDA property and help participants find safe,
              independent living spaces.
            </p>
            <div className="mt-6">
              <Link to="/register">
                <Button className="rounded-full px-5 py-6 bg-pink-600 hover:bg-pink-700">
                  List your property
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <img
              src={picture}
              alt="SDA illustration"
              className="w-[520px] max-w-full h-auto"
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
                    Any registered SDA provider, homeowner, or organization
                    offering supported accommodation.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q2" className="border-b border-gray-200">
                  <AccordionTrigger className="py-5">
                    Is listing my property free?
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-gray-700">
                    Yes listing is free. Optional upgrades are available for
                    added visibility.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q3" className="border-b border-gray-200">
                  <AccordionTrigger className="py-5">
                    How do participants contact me?
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-gray-700">
                    Participants can send enquiries directly from your listing,
                    and you’ll receive notifications instantly.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q4" className="border-b border-gray-200">
                  <AccordionTrigger className="py-5">
                    Can I edit my listing after publishing?
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-gray-700">
                    Yes. You can update details anytime via the dashboard.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q5" className="border-b border-gray-200">
                  <AccordionTrigger className="py-5">
                    Do I have control over who stays at my property?
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-gray-700">
                    Absolutely. You review and approve or decline requests.
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

      {/* FOOTER – compact bar */}
      <footer className="w-full bg-pink-50 border-t border-pink-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: logo + copyright */}
          <div className="flex items-center gap-4">
            <img src={Logo} alt="Nurse Assist 24/7" className="h-10 w-auto" />
            <p className="text-xs text-gray-600">
              &copy; 2025 Nurse Assist 24/7. All rights reserved.
            </p>
          </div>

          {/* Right: columns */}
          <div className="flex flex-wrap items-start gap-10 text-xs text-gray-700">
            <div>
              <h4 className="font-semibold mb-1">Company</h4>
              <a
                href="https://nurseassist247.com.au/our-values/"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                About us
              </a>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Business Consultation</h4>
              <p>+08 9545 6010</p>
              <a
                href="mailto:admin@nurseassist247.com.au"
                className="hover:underline block"
              >
                admin@nurseassist247.com.au
              </a>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Quick Links</h4>
              <ul className="space-y-0.5">
                <li>
                  <a href="#" className="hover:underline">
                    Nurse Assist 24/7
                  </a>
                </li>
                <li>
                  <Link to="/login" className="hover:underline">
                    Partner Sign in
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:underline">
                    Get started
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
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
