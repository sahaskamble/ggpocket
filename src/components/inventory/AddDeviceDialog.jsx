"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import pb from "@/lib/db";
import { useAuth } from "@/contexts/auth-context";
import { fetchDevices } from "@/lib/db_data_helper";

export function AddDeviceDialog({ open, onOpenChange }) {
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const { toast } = useToast();
    const { user } = useAuth();
    
    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(e.target);
            formData.append('type', 'device');
            formData.append('branch_id', localStorage.getItem('branchid'));
            formData.append('user_id', user?.id);

            const record = await pb.collection('inventory').create(formData);
            // console.log('Device added:', formData);
            toast({
                title: "Success",
                description: "Device added successfully",
            });
            onOpenChange(false);
            await fetchDevices();
        } catch (error) {
            console.error('Error:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to add device",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Device</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="avatar">Image</Label>
                        <Input 
                            id="avatar" 
                            name="avatar" 
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files)}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Adding..." : "Add Device"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
