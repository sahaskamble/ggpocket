"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import pb from "@/lib/db";
import { API_URL } from "@/lib/constants";
import { fetchDevices } from "@/lib/db_data_helper";

export function DevicesList() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPS = useCallback(async () => {
        try {
            const record = await fetchDevices();
            setDevices(record);
        } catch (error) {
            console.error('Error fetching devices:', error);
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        fetchPS();
    }, [fetchPS]);


    if (loading) return <div>Loading...</div>;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {devices.map((device) => (
                <Card key={device.id}>
                    <CardContent className="flex items-center space-x-4 p-6">
                        <Avatar className="h-12 w-12">
                            <AvatarImage
                                src={`${API_URL}api/files/inventory/${device.id}/${device.avatar}`}
                                alt={device.name}
                            />
                            <AvatarFallback>{device.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-medium">{device.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                Added {new Date(device.created).toLocaleDateString()}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
