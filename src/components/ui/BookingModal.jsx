'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog"; // Import necessary components from Shadcn
import { Button } from "@/components/ui/button";
import { fetchCustomers, fetchInventory, fetchPricings, getPricingData } from '@/app/lib/api__structure'; // Import necessary functions
import { Label } from "@/components/ui/label"
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function BookingModal({ isOpen, onClose, station, onBookingSuccess, Data }) {
    const [customerName, setCustomerName] = useState('');
    const [customerContact, setCustomerContact] = useState('');
    const [existingCustomer, setExistingCustomer] = useState(null);
    const [customers, setCustomers] = useState([]); // State to hold fetched customers
    const [games, setGames] = useState([]);
    const [snacks, setSnacks] = useState([]);
    const [selectedGame, setSelectedGame] = useState('');
    const [selectedSnack, setSelectedSnack] = useState('');
    const [noOfPlayers, setNoOfPlayers] = useState(1);
    const [durationHours, setDurationHours] = useState(1);
    const [totalAmount, setTotalAmount] = useState(0);
    const [rewardPoints, setRewardPoints] = useState(0);
    const [pricing, setPricing] = useState({
        single: 0,
        multiplayer: 0,
        overThree: 0,
        creditRate: 0.0,
        rupeeConversion: 0,
        redeemLimitMinPoints: 0,
        redeemLimitMaxRate: 0.0
    });

    useEffect(() => {
        const fetchData = async () => {
            const gamesData = await fetchInventory(1, 50, 'game');
            const snacksData = await fetchInventory(1, 50, 'snack');
            const pricingData = await fetchPricings({ branch_id: Data.BranchId })
            console.log('Pricing Data', pricingData)
            setGames(gamesData.items);
            setSnacks(snacksData.items);
            setPricing({
                single: pricingData.items[0].single_player,
                multiplayer: pricingData.items[0].multi_player,
                overThree: pricingData.items[0].over_three_player,
                creditRate: pricingData.items[0].credit_rate / 100,
                rupeeConversion: pricingData.items[0].rupee_conversion,
                redeemLimitMinPoints: pricingData.items[0].reedem_limit_min_points / (pricingData.items[0].rupee_conversion),
                redeemLimitMaxRate: pricingData.items[0].redeem_limit_max_rate / 100,
            });
        };

        fetchData();
    }, []);

    useEffect(() => {
        const calculateTotal = () => {
            let price = 0;
            if (noOfPlayers === 1) {
                console.log(pricing)
                price = pricing.single;
            } else if (noOfPlayers <= 3) {
                price = pricing.multiplayer;
            } else {
                price = pricing.overThree;
            }
            console.log('Price', price)
            console.log('No of Players', noOfPlayers);
            setTotalAmount(price * noOfPlayers);
            setRewardPoints((price * noOfPlayers * pricing.creditRate).toFixed(0)); // Example: 10% of total amount as reward points
        };

        calculateTotal();
    }, [noOfPlayers, pricing]);

    const handleCustomerSearch = async () => {
        if (customerName.trim() === '') {
            setCustomers([]); // Clear customers if input is empty
            return;
        }
        const fetchedCustomers = await fetchCustomers(customerName);
        console.log(fetchedCustomers);
        setCustomers(fetchedCustomers); // Set the fetched customers
    };

    const handleCustomerSelect = (customer) => {
        setExistingCustomer(customer);
        setCustomerName(customer.name); // Set the input to the selected customer's name
        setCustomerContact(customer.contact); // Assuming contact is a field
        setCustomers([]); // Clear the customer list after selection
    };

    const handleGameSelect = (gameId) => {
        setSelectedGame(gameId);
    };

    const handleSnackSelect = (snackId) => {
        setSelectedSnack(snackId);
    };

    const handleSubmit = async () => {
        const sessionData = {
            customer_id: existingCustomer ? existingCustomer.id : null, // Use existing customer ID if found
            device_id: station.id,
            game_id: selectedGame,
            no_of_players: noOfPlayers,
            session_in: new Date().toISOString(),
            duration_hours: durationHours,
            total_amount: totalAmount,
            reward_points_earned: rewardPoints,
            snack_id: selectedSnack,
            status: 'active',
        };

        try {
            await addSession(sessionData);
            onBookingSuccess(); // Callback to refresh the booking page or show success
            onClose(); // Close the dialog
        } catch (error) {
            console.error('Failed to book session:', error);
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-gray-800 text-white rounded-lg p-6">
                <DialogHeader>
                    <DialogTitle>Book a Session</DialogTitle>
                    <DialogDescription>
                        Please fill in the details below to book a session.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col space-y-4 mt-8">
                    <div className='grid gap-2'>
                        <Label>Customer Name</Label>
                        <Input
                            type="text"
                            placeholder="Customer Name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            onBlur={handleCustomerSearch}
                            className="border rounded p-2 w-full bg-gray-700 text-white"
                            required
                        />
                    </div>
                    {customers.length > 0 && (
                        <datalist className="border rounded bg-gray-700 text-white">
                            {customers.map(customer => (
                                <option
                                    key={customer.id}
                                    onClick={() => handleCustomerSelect(customer)}
                                    className="p-2 hover:bg-gray-600 cursor-pointer"
                                >
                                    {customer.name} - {customer.contact}
                                </option>
                            ))}
                        </datalist>
                    )}
                    <div className='grid gap-2'>
                        <Label>Customer Contact</Label>
                        <Input
                            type="text"
                            placeholder="Contact"
                            value={customerContact}
                            onChange={(e) => setCustomerContact(e.target.value)}
                            className="border rounded p-2 w-full bg-gray-700 text-white"
                            required
                        />
                    </div>
                    <div className='grid gap-2'>
                        <Label>Select Game</Label>
                        <Select
                            onChange={(e) => handleGameSelect(e.target.value)}
                        >
                            <SelectTrigger className='bg-gray-600 cursor-pointer'>
                                <SelectValue placeholder="Select Game" className="border rounded p-2 w-full bg-gray-700 text-white" />
                            </SelectTrigger>
                            <SelectContent className='bg-gray-600 cursor-pointer'>
                                {games.map(game => (
                                    <SelectItem key={game.id} value={game.id}>{game.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='grid gap-2'>
                        <Label>Snacks</Label>
                        <Select
                            onChange={(e) => handleSnackSelect(e.target.value)}
                        >
                            <SelectTrigger className='bg-gray-600 cursor-pointer'>
                                <SelectValue placeholder="Snacks Consumed" className="border rounded p-2 w-full bg-gray-700 text-white" />
                            </SelectTrigger>
                            <SelectContent className='bg-gray-600 cursor-pointer'>
                                {snacks.map(snack => (
                                    <SelectItem key={snack.id} value={snack.id}>{snack.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='grid gap-2'>
                        <Label>No of Players</Label>
                        <Input
                            type="number"
                            value={noOfPlayers}
                            onChange={(e) => setNoOfPlayers(Math.max(1, e.target.value))}
                            className="border rounded p-2 w-full bg-gray-700 text-white"
                            min="1"
                            required
                        />
                    </div>
                    <div className='grid gap-2'>
                        <Label>Customer Contact</Label>
                        <Input
                            type="number"
                            value={durationHours}
                            onChange={(e) => setDurationHours(Math.max(1, e.target.value))}
                            className="border rounded p-2 w-full bg-gray-700 text-white"
                            min="1"
                            required
                        />
                    </div>
                    <div className="flex justify-between">
                        <span>Total Amount: ₹{totalAmount}</span>
                        <span>Reward Points: {rewardPoints}</span>
                    </div>
                    <Button onClick={handleSubmit} className="mt-4 bg-blue-600 hover:bg-blue-700">Confirm Booking</Button>
                </div>
                <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none">
                    <span className="sr-only">Close</span>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
} 
