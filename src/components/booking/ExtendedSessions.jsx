"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import pb from "@/lib/db";
import { API_URL } from "@/lib/constants";
import { Timer, History, StopCircle } from "lucide-react";

export function ExtendedSessions() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchExtendedSessions = async () => {
        try {
            const branchId = localStorage.getItem('branchid');
            const records = await pb.collection('sessions').getList(1, 50, {
                filter: `branch_id = "${branchId}" && status = "extended"`,
                expand: 'device_id',
                sort: '-created'
            });
            setSessions(records.items);
        } catch (error) {
            console.error('Error fetching extended sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEndSession = async (session) => {
        try {
            // Update session status to closed
            await pb.collection('sessions').update(session.id, {
                status: "closed",
                session_out: new Date().toISOString()
            });

            // Update device status to available
            await pb.collection('inventory').update(session.device_id, {
                status: "open"
            });

            toast({
                title: "Success",
                description: "Session ended successfully"
            });

            fetchExtendedSessions();
        } catch (error) {
            console.error('Error ending session:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to end session"
            });
        }
    };

    useEffect(() => {
        fetchExtendedSessions();
        // Set up real-time updates
        const interval = setInterval(fetchExtendedSessions, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
                <Card key={session.id}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage 
                                    src={`${API_URL}api/files/inventory/${session.device_id}/${session.expand?.device_id?.avatar}`} 
                                    alt={session.expand?.device_id?.name} 
                                />
                                <AvatarFallback>{session.expand?.device_id?.name[0]}</AvatarFallback>
                            </Avatar>
                            {session.expand?.device_id?.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Timer className="h-4 w-4" />
                            <span>Original Duration: {session.duration} hours</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <History className="h-4 w-4" />
                            <span>Extended Time: +{session.extended_duration} hours</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Timer className="h-4 w-4" />
                            <span>New End Time: {new Date(session.end_time).toLocaleTimeString()}</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            variant="destructive" 
                            className="w-full"
                            onClick={() => handleEndSession(session)}
                        >
                            <StopCircle className="mr-2 h-4 w-4" />
                            End Session
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
