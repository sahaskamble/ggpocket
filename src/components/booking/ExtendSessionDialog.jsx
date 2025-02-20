"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import pb from "@/lib/db";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { fetchPricing } from "@/lib/db_data_helper";

export function ExtendSessionDialog({ open, onOpenChange, session, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [extraHours, setExtraHours] = useState("1");
    const [extraPlayers, setExtraPlayers] = useState("0");
    const [pricing, setPricing] = useState(null);
    const [totalAmount, setTotalAmount] = useState(0);
    const { toast } = useToast();

    useEffect(() => {
        const getPricing = async () => {
            try {
                const pricingData = await fetchPricing();
                setPricing(pricingData[0]);
            } catch (error) {
                console.error('Error fetching pricing:', error);
            }
        };
        if (open) {
            getPricing();
        }
    }, [open]);

    const calculateAdditionalAmount = () => {
        if (!pricing || !session) return 0;
        
        const currentPlayers = session.no_of_players;
        const newTotalPlayers = currentPlayers + parseInt(extraPlayers);
        let hourlyRate = 0;

        // Calculate rate based on the new total number of players
        if (extraPlayers === "0") {
            // If no new players, use rate based on current player count
            if (currentPlayers === 1) {
                hourlyRate = pricing.single_player;
            } else if (currentPlayers === 2) {
                hourlyRate = pricing.multi_player * currentPlayers;
            } else {
                hourlyRate = pricing.over_three_player;
            }
        } else {
            // For additional players, never use single_player rate
            if (newTotalPlayers === 2) {
                hourlyRate = pricing.multi_player * newTotalPlayers;
            } else {
                hourlyRate = pricing.over_three_player;
            }
        }

        return parseInt(extraHours) * hourlyRate;
    };

    useEffect(() => {
        setTotalAmount(calculateAdditionalAmount());
    }, [extraHours, extraPlayers, pricing]);

    if (!session) return null;

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const currentEndTime = new Date(session.session_out);
            const newEndTime = new Date(currentEndTime.getTime() + parseInt(extraHours) * 60 * 60 * 1000);
            const additionalAmount = calculateAdditionalAmount();

            // Update session with extended time and players
            await pb.collection('sessions').update(session.id, {
                status: "extended",
                session_out: newEndTime.toISOString(),
                extended_duration: (session.extended_duration || 0) + parseInt(extraHours),
                duration_hours: session.duration_hours + parseInt(extraHours),
                no_of_players: session.no_of_players + parseInt(extraPlayers),
                total_amount: session.total_amount + additionalAmount
            });

            toast({
                title: "Success",
                description: "Session extended successfully",
            });
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error('Error:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to extend session",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-[425px] p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle>Extend Session</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                        <Label>Additional Hours</Label>
                        <Select value={extraHours} onValueChange={setExtraHours}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select hours" />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3].map((hours) => (
                                    <SelectItem key={hours} value={hours.toString()}>
                                        {hours} {hours === 1 ? 'hour' : 'hours'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Add Players (Current: {session.no_of_players})</Label>
                        <Select value={extraPlayers} onValueChange={setExtraPlayers}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select additional players" />
                            </SelectTrigger>
                            <SelectContent>
                                {[0, 1, 2].map((num) => (
                                    <SelectItem key={num} value={num.toString()}>
                                        {num} {num === 1 ? 'player' : 'players'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between items-center">
                            <span>Current End Time:</span>
                            <span>{new Date(session.session_out).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>New End Time:</span>
                            <span>
                                {new Date(new Date(session.session_out).getTime() + 
                                    parseInt(extraHours) * 60 * 60 * 1000).toLocaleTimeString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm font-bold">
                            <span>Additional Amount:</span>
                            <span>₹{totalAmount}</span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button 
                            type="submit" 
                            className="w-full h-9 sm:h-10" 
                            disabled={loading}
                        >
                            {loading ? "Extending..." : "Extend Session"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
