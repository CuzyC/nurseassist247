import { useState, useEffect } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Menu, Settings, Bell } from "lucide-react";

function Header({ pageTitle }) {

    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Format the date as "12 Nov 2025, Wednesday"
    const formattedDate = dateTime.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
    const weekday = dateTime.toLocaleDateString("en-GB", { weekday: "long" });
    const formattedFullDate = `${formattedDate}, ${weekday}`;

    const formattedTime = dateTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
            {/* Left side — page title & menu button (mobile) */}
            <div className="flex items-center gap-3">
                {/* Hamburger only visible on mobile */}
                <button
                    className="md:hidden p-2 rounded-md hover:bg-gray-100"
                >
                    <Menu className="h-6 w-6 text-gray-700" />
                </button>
                <h1 className="text-gray-900 text-2xl font-semibold">{pageTitle}</h1>
            </div>

            {/* Right side — user info (hidden on small screens) */}
            <div className="hidden sm:flex items-center gap-4 text-gray-700">
                <div className="flex items-center gap-4 text-sm font-medium">
                    <span>{formattedFullDate}</span>
                    <span>{formattedTime}</span>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-2 rounded-full bg-[#D2138C] hover:bg-[#D2138C] transition cursor-pointer">
                        <Settings className="h-5 w-5 text-white" />
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;
