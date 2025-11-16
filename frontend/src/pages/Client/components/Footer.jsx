import logo from "@/assets/logo.png";

import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="w-full bg-pink-50 border-t border-pink-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex">
          {/* Left: logo + copyright */}
          <div className="flex items-center gap-4">
            <img src={logo} alt="Nurse Assist 24/7" className="h-10 w-auto" />
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
  );
}

export default Footer;
