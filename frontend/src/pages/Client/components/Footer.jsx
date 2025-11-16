import logo from "@/assets/logo.png";
import logo2 from "@/assets/White logo.svg"
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="w-full bg-[#2f0335] border-t border-[#2f0335]">
      <div className="max-w-6xl mx-auto px-6 py-10 text-white">
        
        {/* Center grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mx-auto text-center">
          
          {/* Logo + copyright */}
          <div className="space-y-4 flex flex-col">
            <img src={logo} alt="Nurse Assist 24/7" className="h-16" />
            <p className="text-xs text-left">
              Copyright &copy; 2025 Nurse Assist 24/7. All rights reserved.
            </p>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-semibold text-[#ff50b9] text-md">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://nurseassist247.com.au/our-values/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline "
                >
                  About us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-[#ff50b9]">Business Consultation</h4>
            <ul className="space-y-2 text-sm">
              <li>+08 9545 6010</li>
              <li>
                <a
                  href="mailto:admin@nurseassist247.com.au"
                  className="hover:underline block"
                >
                  admin@nurseassist247.com.au
                </a>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-[#ff50b9]">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:underline">Nurse Assist 24/7</a></li>
              <li><Link to="/properties" className="hover:underline">Properties</Link></li>
              <li><Link to="/login" className="hover:underline">Partner Sign in</Link></li>
              <li><Link to="/register" className="hover:underline">Get started</Link></li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default Footer;
