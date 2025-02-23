'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchInventory, fetchSessions } from '@/app/lib/api__structure'; // Import fetchInventory function
import { ScreenShareIcon, TimerIcon } from 'lucide-react';
import BookingModal from "@/components/ui/BookingModal"; // Import the BookingModal component

export default function BookingPage() {
    const [stations, setStations] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStation, setSelectedStation] = useState(null);

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const deviceData = await fetchInventory(1, 50, 'device'); // Fetch devices
                const sessionsData = await fetchSessions();
                setStations(deviceData.items);
                setSessions(sessionsData.items);
            } catch (error) {
                console.error('Failed to fetch devices:', error);
                toast.error('Failed to load devices');
            } finally {
                setLoading(false);
            }
        };

        fetchStations();
    }, []);

    const getNextAvailableTime = (id, status) => {
        const session = sessions.find(s => id === s?.expand?.device_id?.id);
        if (session && session.status === 'Occupied' && status === 'booked') {
            return new Date(session.session_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return 'Now';
    };

    const handleBooking = (station) => {
        setSelectedStation(station);
        setIsModalOpen(true);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6">

            <Card>
                <CardHeader>
                    <CardTitle>Book a Station</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {stations.map(station => (
                            <div key={station.id} className={`p-4 border rounded-lg flex flex-col justify-between`}>
                                <div className='flex flex-col gap-4'>
                                    <div className='flex justify-between items-center'>
                                        <h3 className="text-lg font-semibold text-white">{station.name}</h3>
                                        <p className={`text-sm text-gray-200 px-4 py-1 rounded-full ${station.status === 'open' ? 'bg-green-300 bg-opacity-40 text-green-600' : station.status === 'booked' ? 'bg-red-300 bg-opacity-40 text-red-600' : 'bg-yellow-300 text-black'}`}>{station.status.charAt(0).toUpperCase() + station.status.slice(1)}</p>
                                    </div>
                                    <div className='inline-flex justify-start items-center gap-4'>
                                        <ScreenShareIcon />
                                        <p>4k Display</p>
                                    </div>
                                    <div className='inline-flex justify-start items-center gap-4'>
                                        <TimerIcon />
                                        <p className="text-sm text-gray-200">Next available: {getNextAvailableTime(station.id, station.status)}</p>
                                    </div>
                                </div>
                                <Button
                                    disabled={station.status !== 'open'}
                                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => handleBooking(station)}
                                >
                                    {station.status === 'open' ? 'Book Now' : 'Unavailable'}
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                station={selectedStation}
                onBookingSuccess={() => {
                    setIsModalOpen(false);
                    // Optionally refresh the booking page or show a success message
                }}
            />
        </div>
    );
}
