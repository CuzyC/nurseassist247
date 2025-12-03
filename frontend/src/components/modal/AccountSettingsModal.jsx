import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Settings({ open, onClose }) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-[800px] w-full ">
                <DialogHeader>
                    <DialogTitle>System Settings</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-96 my-4 pr-2">
                    {/* User Information */}
                    <DialogTitle>User Settings</DialogTitle>
                    <Card className="my-4">
                        <CardContent className="space-y-4 mt-6">
                            <div className="flex items-center gap-4">
                                <Label htmlFor="name" className="w-32">Name</Label>
                                <Input id="name" type="text" className="flex-1" />
                                <Button size="sm" className="bg-[#D2138C] hover:bg-pink-700">Edit</Button>
                            </div>

                            <div className="flex items-center gap-4">
                                <Label htmlFor="username" className="w-32">Username</Label>
                                <Input id="username" type="text" className="flex-1" />
                                <Button size="sm" className="bg-[#D2138C] hover:bg-pink-700">Edit</Button>
                            </div>

                            <div className="flex items-center gap-4">
                                <Label htmlFor="email" className="w-32">Email</Label>
                                <Input id="email" type="email" className="flex-1" />
                                <Button size="sm" className="bg-[#D2138C] hover:bg-pink-700">Edit</Button>
                            </div>

                            <div className="flex items-center gap-4">
                                <Label htmlFor="phone" className="w-32">Phone</Label>
                                <Input id="phone" type="text" className="flex-1" />
                                <Button size="sm" className="bg-[#D2138C] hover:bg-pink-700">Edit</Button>
                            </div>

                        </CardContent>
                    </Card>

                    {/* Password */}
                    <DialogTitle>Password</DialogTitle>

                    <Button
                        className="my-4 text-sm bg-[#D2138C] hover:bg-pink-700"
                    >
                        Change Password
                    </Button>

                    <hr />

                    {/*  */}

                    {/* Account Removal */}
                    <DialogTitle className="mt-4">Account Removal</DialogTitle>
                    <DialogDescription className="text-sm mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                    </DialogDescription>
                    <Button
                        variant="destructive"
                        className="text-sm text-white"
                    >
                        Delete Account
                    </Button>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export default Settings;