"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import pb from "@/lib/db";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "../ui/input";
import { fetchCustomers, fetchPricing, fetchGames } from "@/lib/db_data_helper";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { API_URL } from "@/lib/constants";

export function AddSessionDialog({ open, onOpenChange, device, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [duration, setDuration] = useState("1");
    const [players, setPlayers] = useState("1");
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customers, setCustomers] = useState([]);
    const [pricing, setPricing] = useState(null);
    const [totalAmount, setTotalAmount] = useState(0);
    const [games, setGames] = useState([]);
    const [selectedGames, setSelectedGames] = useState([]);
    // const [ggPoints, setGgPoints] = useState(0);
    const { toast } = useToast();

    const fetchPageInfo = useCallback(async () => {
        try {
            const customer = await fetchCustomers();
            const pricing = await fetchPricing();
            const gamesList = await fetchGames();

            setCustomers(customer);
            setPricing(pricing[0]); // Assuming you only need the first pricing record
            setGames(gamesList);
        } catch (error) {
            console.error('Error fetching page info:', error);
        }
    }, []);

    useEffect(() => {
        fetchPageInfo();
    }, [fetchPageInfo]);

    // const calculateGGPoints = (amount) => {
    //     return Math.floor(amount * 10); // Convert amount to GG-points
    // };

    useEffect(() => {
        const total = calculateTotal();
        setTotalAmount(total);
        // setGgPoints(calculateGGPoints(total));
    }, [duration, players, pricing]);

    const handleCustomerSelect = (e) => {
        const selectedCustomer = customers.find(customer => 
            customer.customer_name === e.target.value || customer.customer_contact === e.target.value
        );
        if (selectedCustomer) {
            setCustomerName(selectedCustomer.customer_name);
            setCustomerPhone(selectedCustomer.customer_contact);
        }
    };

    const calculateTotal = () => {
        if (!pricing) return 0;
        const baseAmount = parseInt(duration) * pricing.single_player;
        let playerAmount = 0;
        if (parseInt(players) === 2) {
            playerAmount = parseInt(duration) * pricing.multi_player * parseInt(players);
            return playerAmount;
        } else if (parseInt(players) > 2) {
            playerAmount = parseInt(duration) * pricing.over_three_player * parseInt(players);
            return playerAmount;
        }
        return baseAmount;
    };
    console.log(parseInt(players))
    console.log(pricing?.multi_player * parseInt(players) * parseInt(duration))
    console.log(customers)

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            // First, check if customer exists or create new one
            let customerId;
            try {
                const existingCustomer = await pb.collection('customers').getFirstListItem(
                    `phone = "${customerPhone}"`
                );
                customerId = existingCustomer.id;
            } catch (error) {
                // Customer doesn't exist, create new one
                const newCustomer = await pb.collection('customers').create({
                    name: customerName,
                    phone: customerPhone,
                    branch_id: localStorage.getItem('branchid')
                });
                customerId = newCustomer.id;
            }

            const sessionData = {
                device_id: device?.id,
                branch_id: localStorage.getItem('branchid'),
                user_id: JSON.parse(localStorage.getItem('user')).id,
                customer_id: customerId, // Add reference to customer
                duration_hours: parseInt(duration),
                no_of_players: parseInt(players),
                customer_name: customerName,
                customer_contact: customerPhone,
                total_amount: calculateTotal(),
                // gg_points_earned: ggPoints, // Add GG-points to session data
                status: "occupied",
                session_in: new Date().toISOString(),
                session_out: new Date(Date.now() + parseInt(duration) * 60 * 60 * 1000).toISOString(),
                games: selectedGames, // Add selected games to session data
            };

            console.log('Submitting session data:', sessionData); // Debug log

            const record = await pb.collection('sessions').create(sessionData);

            // Update device status to booked instead of occupied
            if (record) {
                await pb.collection('inventory').update(device?.id, {
                    status: "booked",
                });

                // Update popularity score for each selected game
                for (const gameId of selectedGames) {
                    try {
                        // Get current game data
                        const game = await pb.collection('inventory').getOne(gameId);
                        
                        // Calculate new popularity score
                        // Current implementation: increment by 1 for each selection
                        const currentScore = game.popularity_score || 0;
                        await pb.collection('inventory').update(gameId, {
                            "popularity_score": currentScore + 1
                        });
                    } catch (error) {
                        console.error(`Failed to update popularity score for game ${gameId}:`, error);
                        // Continue with other games even if one fails
                    }
                }
            }
            
            toast({
                title: "Success",
                description: "Session booked successfully",
            });
            onSuccess?.(); // This will now trigger tab switch
            onOpenChange(false);

            // Switch to occupied tab
            const tabsElement = document.querySelector('[role="tablist"]');
            const occupiedTab = tabsElement?.querySelector('[value="occupied"]');
            occupiedTab?.click();
        } catch (error) {
            console.error('Error details:', error.response?.data || error); // More detailed error logging
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.message || "Failed to start session",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-[425px] p-4 sm:p-6">
                <DialogHeader className="space-y-2">
                    <DialogTitle className="text-lg sm:text-xl">New Session</DialogTitle>
                    <DialogDescription className="text-sm">
                        {device?.name}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                        <Label className="text-sm sm:text-base">Customer Name</Label>
                        <Input
                            className="h-9 sm:h-10"
                            list="customers"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            onInput={handleCustomerSelect}
                            placeholder="Enter customer name"
                            required
                        />
                        <datalist id="customers">
                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.customer_name}>
                                    {customer.customer_contact}
                                </option>
                            ))}
                        </datalist>
                    </div>

                    <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input
                            list="customers"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            onInput={handleCustomerSelect}
                            placeholder="Enter phone number"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Duration (hours)</Label>
                        <Select value={duration} onValueChange={setDuration}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4, 5, 6].map((hours) => (
                                    <SelectItem key={hours} value={hours.toString()}>
                                        {hours} {hours === 1 ? 'hour' : 'hours'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Number of Players</Label>
                        <Select value={players} onValueChange={setPlayers}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select players" />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4].map((num) => (
                                    <SelectItem key={num} value={num.toString()}>
                                        {num} {num === 1 ? 'player' : 'players'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Games</Label>
                        <Select 
                            value={selectedGames} 
                            onValueChange={setSelectedGames}
                            multiple={true}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select games" />
                            </SelectTrigger>
                            <SelectContent>
                                {games.map((game) => (
                                    <SelectItem 
                                        key={game.id} 
                                        value={game.id}
                                        className="flex items-center gap-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage 
                                                    src={`${API_URL}api/files/inventory/${game.id}/${game.avatar}`} 
                                                    alt={game.name} 
                                                />
                                                <AvatarFallback>{game.name[0]}</AvatarFallback>
                                            </Avatar>
                                            {game.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Select the games the customer wants to play
                        </p>
                    </div>

                    <DialogFooter className="flex flex-col gap-2 sm:gap-3 pt-2">
                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex justify-between items-center w-full px-3 py-2 sm:py-3 bg-secondary rounded-lg text-sm sm:text-base">
                                <span>Total Amount:</span>
                                <span className="text-lg sm:text-xl font-bold">₹{totalAmount}</span>
                            </div>
                            {/* Removed GG-Points display */}
                        </div>
                        <Button type="submit" className="w-full h-9 sm:h-10" disabled={loading}>
                            {loading ? "Starting..." : "Start Session"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}