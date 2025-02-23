'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { toast } from "sonner";
import { getPricingData, addSession, fetchInventory } from '@/app/lib/api__structure'; // Import fetchInventory function

export default function BookingPage() {
  const [date, setDate] = useState({
    from: new Date(),
    to: new Date(new Date().getTime() + 60 * 60 * 1000) // Default to 1 hour later
  });
  const [players, setPlayers] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);
  const [pricing, setPricing] = useState({ single: 0, multiplayer: 0, overThree: 0 });
  const [deviceId, setDeviceId] = useState('');
  const [gameId, setGameId] = useState('');
  const [devices, setDevices] = useState([]);
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const pricingData = await getPricingData();
        setPricing(pricingData);
      } catch (error) {
        console.error('Failed to fetch pricing data:', error);
        toast.error('Failed to load pricing data');
      }
    };

    const fetchInventoryData = async () => {
      try {
        const deviceData = await fetchInventory(1, 50, 'device');
        const gameData = await fetchInventory(1, 50, 'game');
        setDevices(deviceData.items);
        setGames(gameData.items);
      } catch (error) {
        console.error('Failed to fetch inventory data:', error);
        toast.error('Failed to load inventory data');
      }
    };

    fetchPricing();
    fetchInventoryData();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [players, pricing]);

  const calculateTotal = () => {
    let price = 0;
    if (players === 1) {
      price = pricing.single;
    } else if (players <= 3) {
      price = pricing.multiplayer;
    } else {
      price = pricing.overThree;
    }
    setTotalAmount(price);
  };

  const handleBooking = async () => {
    try {
      const sessionData = {
        customer_id: 'customer_id_here', // Replace with actual customer ID
        device_id: deviceId,
        game_id: gameId,
        no_of_players: players,
        session_in: date.from.toISOString(),
        session_out: date.to.toISOString(),
        duration_hours: (date.to - date.from) / (1000 * 60 * 60), // Calculate duration in hours
        total_amount: totalAmount,
        payment_mode: 'Cash', // Replace with actual payment mode
        status: 'active',
      };

      await addSession(sessionData); // Use the API helper function
      toast.success('Booking successful!');
    } catch (error) {
      console.error('Failed to book session:', error);
      toast.error('Failed to book session');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Book a Session</CardTitle>
        </CardHeader>
        <CardContent>
          <DatePickerWithRange date={date} setDate={setDate} />
          <div className="mt-4">
            <label htmlFor="device" className="block text-sm font-medium">Select Device</label>
            <select
              id="device"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Select a device</option>
              {devices.map(device => (
                <option key={device.id} value={device.id}>{device.name}</option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <label htmlFor="game" className="block text-sm font-medium">Select Game</label>
            <select
              id="game"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Select a game</option>
              {games.map(game => (
                <option key={game.id} value={game.id}>{game.name}</option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <label htmlFor="players" className="block text-sm font-medium">Number of Players</label>
            <input
              type="number"
              id="players"
              value={players}
              onChange={(e) => setPlayers(Math.max(1, Math.min(10, e.target.value)))}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              min="1"
              max="10"
            />
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-medium">Total Amount: ₹{totalAmount}</h3>
          </div>
          <Button onClick={handleBooking} className="mt-4">Book Now</Button>
        </CardContent>
      </Card>
    </div>
  );
} 