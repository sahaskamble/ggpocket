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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import pb from "@/lib/db";

const SNACK_CATEGORIES = [
    "Chips",
    "Beverages",
    "Candy",
    "Chocolates",
    "Others"
];

export function AddSnackDialog({ open, onOpenChange }) {
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [category, setCategory] = useState("");
    const { toast } = useToast();
    
    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(e.target);
            formData.append('type', 'snack');
            formData.append('category', category);
            formData.append('branch_id', localStorage.getItem('branchid'));
            formData.append('user_id', JSON.parse(localStorage.getItem('user')).id);

            const record = await pb.collection('inventory').create(formData);
            
            toast({
                title: "Success",
                description: "Snack added successfully",
            });
            onOpenChange(false);
        } catch (error) {
            console.error('Error:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to add snack",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Snack</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {SNACK_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="stock">Stock</Label>
                        <Input 
                            id="stock" 
                            name="stock" 
                            type="number" 
                            min="0" 
                            required 
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="avatar">Image</Label>
                        <Input 
                            id="avatar" 
                            name="avatar" 
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Adding..." : "Add Snack"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
