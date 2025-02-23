"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { pb } from "@/app/lib/db";

export function PricingForm({ initialData }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        single_player: initialData?.single_player || 0,
        multi_player: initialData?.multi_player || 0,
        over_three_player: initialData?.over_three_player || 0,

    });
    const { user } = useSession();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseInt(value) || 0
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = {
                ...formData,
                branch_id: localStorage.getItem('branchid'),
                user_id: user.id
            };

            if (initialData?.id) {
                // Update existing pricing
                await pb.collection('pricing').update(initialData.id, data);
            } else {
                // Create new pricing
                await pb.collection('pricing').create(data);
            }

            toast.success("Pricing updated successfully");
        } catch (error) {
            console.error('Error:', error);
            toast.error("Failed to update pricing");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="single_player">Single Player Rate (per hour)</Label>
                <Input
                    id="single_player"
                    name="single_player"
                    type="number"
                    value={formData.single_player}
                    onChange={handleChange}
                    min="0"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="multi_player">
                    Multi Player Rate (per player per hour)
                </Label>
                <Input
                    id="multi_player"
                    name="multi_player"
                    type="number"
                    value={formData.multi_player}
                    onChange={handleChange}
                    min="0"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="over_three_player">
                    Over Three Players Rate (per hour)
                </Label>
                <Input
                    id="over_three_player"
                    name="over_three_player"
                    type="number"
                    value={formData.over_three_player}
                    onChange={handleChange}
                    min="0"
                    required
                />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Save Pricing"}
            </Button>
        </form>
    );
}
