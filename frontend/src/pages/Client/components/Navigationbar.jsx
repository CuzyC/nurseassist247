import { Home, Building2, Info, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from "@/assets/logo.png"

function NavBar(){
    return(
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
                        <a href="/properties" className="text-foreground hover:text-[#D2138C] transition-colors">Properties</a>
                        <a href="#" className="text-foreground hover:text-[#D2138C] transition-colors">About Us</a>
                        <a href="#" className="text-foreground hover:text-[#D2138C] transition-colors">What We Do</a>
                    </div>

                    {/* Contact Us */}
                    <Button
                        variant="default"
                        className="bg-[#D2138C] hover:bg-pink-700 rounded-full text-white"
                    >
                        Contact Us
                    </Button>
                </div>
            </div>
        </nav>
    )
}

export default NavBar;