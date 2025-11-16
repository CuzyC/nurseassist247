import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Menu } from "lucide-react";

function Header({ pageTitle, onMenuClick }) {
    return (
        <header className="h-16 bg-White border-b border-gray-200 px-6 flex items-center justify-between">
            {/* Left side - page title & menu button (mobile) */}
            <div className="flex items-center gap-3">
                {/* Hamburger only visible on mobile */}
                <button
                    className="md:hidden p-2 rounded-md hover:bg-gray-100"
                    onClick={onMenuClick}
                >
                    <Menu className="h-6 w-6 text-gray-700" />
                </button>
                <h1 className="text-gray-900 text-2x1 font-semibold">{pageTitle}</h1>
            </div>

            {/* Right side -- user info (hidden on small screens) */}
            <div className="hidden sm:flex items-center gap-3">
                testing123
            </div>
        </header>
    );
}

export default Header;