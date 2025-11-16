import { useState } from 'react'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import logo from '@/assets/logo.png'


// Room configurations based on accommodation type
const roomConfigurations = {
  'house': ['2 Rooms, 2 Toilets', '3 Rooms, 3 Toilets'],
  'villa': ['1 Room, 1 Toilet', '2 Rooms, 2 Toilets', '3 Rooms, 3 Toilets'],
  'group-home': ['4 Rooms, 4 Toilets', '5 Rooms, 5 Toilets'],
  'apartment': ['1 Bedroom, 1 Toilet', '2 Bedrooms, 2 Toilets', '3 Bedrooms, 3 Toilets'],
};

function UserForm() {
    const [accommodationType, setAccommodationType] = useState('');
    const [roomConfiguration, setRoomConfiguration] = useState('');
    const [suburb, setSuburb] = useState('');

    const handleSubmit = async(e) => {
        e.preventDefault();

        console.log("availability clicked")
    }

    return (
        <div className='bg-gray-100 min-h-screen flex items-center justify-center'>
            <Card className="shadow-lg w-full max-w-md m-4">
                <CardHeader className="p-6 rounded-t-lg">
                    {/* Logo */}
                    <img 
                        src={logo} 
                        alt="SDA Logo" 
                        className="object-contain" 
                    />
                    <CardTitle className=" text-center font-bold">Find Your Accommodation</CardTitle>
                    <CardDescription className="text-center font-medium">
                        Follow the steps below to check availability
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    <form onSubmit={handleSubmit} className="pt-6 space-y-6">
                        {/* Accommodation Type */}
                        <div className='space-y-2'>
                            <Label htmlFor="accommodation">Select Accommodation Type</Label>
                            <Select onValueChange={(value) => {
                                setAccommodationType(value);
                                setRoomConfiguration(''); // reset when type changes
                            }}>
                                <SelectTrigger id="accommodation-type" className="w-full">
                                    <SelectValue placeholder="Choose accommodation type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="house">House</SelectItem>
                                    <SelectItem value="villa">Villa</SelectItem>
                                    <SelectItem value="group-home">Group Home</SelectItem>
                                    <SelectItem value="apartment">Apartment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Room Configuration */}
                        <div className="space-y-2">
                            <Label htmlFor="room-configuration ">Select Room Configuration</Label>
                            <Select
                                value={roomConfiguration}
                                onValueChange={setRoomConfiguration}
                                disabled={!accommodationType}
                            >
                                <SelectTrigger id="room-configuration" className="w-full">
                                    <SelectValue placeholder="Choose room configuration..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {accommodationType && roomConfigurations[accommodationType]?.map((config) => (
                                        <SelectItem key={config} value={config}>
                                        {config}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Suburb Input */}
                        <div className="space-y-2">
                            <Label htmlFor="suburb ">Enter Suburb</Label>
                            <Input
                                id="suburb"
                                type="text"
                                placeholder="e.g., Sydney"
                                value={suburb}
                                onChange={(e) => setSuburb(e.target.value)}
                                className="w-full"
                                required
                            />
                        </div>

                        {/* Check Availability Button */}
                        <Button
                            className="w-full text-white rounded bg-[#D2138C] hover:bg-[#a50e6a]"
                            disabled={!accommodationType || !roomConfiguration || !suburb}
                            type="submit"
                        >
                            Check Availability
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default UserForm