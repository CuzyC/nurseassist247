import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

function Enquire({ open, onOpenChange }) {

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("submit clicked");
        onOpenChange(false); // close modal after submit (optional)
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Enquire Today</DialogTitle>
                    <DialogDescription>
                        Fill out the form below and we’ll get back to you soon.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name">Name</Label>
                        <Input 
                            id="name"
                            type="text"
                            placeholder="e.g., Juan Dela Cruz"
                            required
                            className="col-span-3"
                        />
                    </div>

                    {/* Email */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email"
                            type="email"
                            placeholder="e.g., juandelacruz@email.com"
                            required
                            className="col-span-3"
                        />
                    </div>

                    {/* Message */}
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="message">Message</Label>
                        <Textarea 
                            id="message"
                            placeholder="Type your message here..."
                            required
                            className="col-span-3"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-[#D2138C] hover:bg-[#B01076] text-white cursor-pointer">
                            Send
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default Enquire;
