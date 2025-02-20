"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Timer } from "lucide-react";
import { AddSessionDialog } from "./AddSessionDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import pb from "@/lib/db";
import { API_URL } from "@/lib/constants";

export function OpenStations({ onSessionCreated }) {
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAvailableDevices = async () => {
        try {
            const branchId = localStorage.getItem('branchid');
            pb.autoCancellation(false);
            const records = await pb.collection('inventory').getList(1, 50, {
                filter: `branch_id = "${branchId}" && type = "device"`,
            });
            setDevices(records.items);
        } catch (error) {
            console.error('Error fetching devices:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailableDevices();
    }, []);

    const handleDeviceClick = (device) => {
        if (device.status === "booked") {
            onSessionCreated("occupied"); // Switch to occupied tab
        } else {
            setSelectedDevice(device);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {devices.map((device) => (
                    <Card key={device.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage 
                                        src={`${API_URL}api/files/inventory/${device.id}/${device.avatar}`} 
                                        alt={device.name} 
                                    />
                                    <AvatarFallback>{device.name[0]}</AvatarFallback>
                                </Avatar>
                                {device.name}
                            </CardTitle>
                        </CardHeader>
                        <CardFooter>
                            <Button 
                                className="w-full"
                                variant={device.status === "booked" ? "secondary" : "default"}
                                onClick={() => handleDeviceClick(device)}
                            >
                                {device.status === "booked" ? (
                                    <>
                                        <Timer className="mr-2 h-4 w-4" />
                                        View Session
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Start Session
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <AddSessionDialog 
                open={!!selectedDevice} 
                onOpenChange={() => setSelectedDevice(null)}
                device={selectedDevice}
                onSuccess={() => {
                    fetchAvailableDevices();
                    onSessionCreated(); // Switch to occupied tab after session creation
                }}
            />
        </>
    );
}
