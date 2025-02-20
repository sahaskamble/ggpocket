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
import { fetchGames } from "@/lib/db_data_helper";

export function AddGameDialog({ open, onOpenChange }) {
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const { toast } = useToast();
    
    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(e.target);
            formData.append('type', 'game');
            formData.append('branch_id', localStorage.getItem('branchid'));
            formData.append('user_id', JSON.parse(localStorage.getItem('user')).id);

            const record = await pb.collection('inventory').create(formData);
            
            toast({
                title: "Success",
                description: "Game added successfully",
            });
            onOpenChange(false);
            await fetchGames();
        } catch (error) {
            console.error('Error:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to add game",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Game</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="popularity_score">Popularity Score</Label>
                        <Input 
                            id="popularity_score" 
                            name="popularity_score" 
                            type="number" 
                            min="0" 
                            max="100" 
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
                        {loading ? "Adding..." : "Add Game"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
