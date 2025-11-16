import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo.png"
import { useNavigate } from "react-router-dom";

function Contact() {

    const navigate = useNavigate();

    const handleSubmit = () => {
        console.log("submit clicked")
    }

    return(
        <div>
            <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-[#f9e2e8]/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="h-16 flex items-center justify-between py-6">
                            <a href="/">
                                <img src={logo} alt="Logo" className="h-16 w-full" />
                            </a>
                        </div>

                        

                        {/* View Properties */}
                        <Button
                            variant="default"
                            className="bg-[#D2138C] hover:bg-pink-700 rounded-full text-white"
                            onClick={()=> navigate("/properties")}
                        >
                            View Accommodation
                        </Button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 p-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className='text-3xl md:text-4xl font-bold text-foreground mb-4'>Get in touch</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Have questions? We're here to help you find your perfect home</p>
                    </div>
                </div>
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Enquire Form */}
                    <div className="p-8">
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

                    {/* Contact Information */}
                    <div className="p-8">
                        <h2 className="text-gray-900 text-xl font-normal mb-6">Contact Information</h2>

                        <div className="space-y-6 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-6 h-6 text-[#D2138C]" />
                                </div>
                                <div>
                                    <h4 className="text-gray-900 mb-1">Phone</h4>
                                    <p className="text-gray-600">123 Nurse Assist</p>
                                    <p className="text-gray-600">(1234 567 890)</p>
                                    <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9am-5pm AEST</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-6 h-6 text-[#D2138C]" />
                                </div>
                                <div>
                                    <h4 className="text-gray-900 mb-1">Email</h4>
                                    <p className="text-gray-600">test@nurseassist247.com.au</p>
                                    <p className="text-sm text-gray-500 mt-1">We respond within 24 hours</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-[#D2138C]" />
                                </div>
                                <div>
                                    <h4 className="text-gray-900 mb-1">Office Address</h4>
                                    <p className="text-gray-600">
                                        Level 1, 123 Accessible Street
                                        <br />
                                        Melbourne VIC 3000
                                        <br />
                                        Australia
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Additional Info Card */}
                        <div className="p-6">
                            <h4 className="text-gray-900 mb-3">NDIS Registered Provider</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                We are a registered NDIS provider committed to delivering quality SDA
                                accommodation services. Our team has extensive experience in matching
                                participants with homes that support their goals and enhance their
                                independence.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Contact