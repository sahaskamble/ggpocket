"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import pb from "@/lib/db";
import { API_URL } from "@/lib/constants";
import { Timer, StopCircle } from "lucide-react";
import { ExtendSessionDialog } from "./ExtendSessionDialog";

export function OccupiedStations() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [selectedSession, setSelectedSession] = useState(null);

    const fetchOccupiedSessions = async () => {
        try {
            const branchId = localStorage.getItem('branchid');
            const records = await pb.collection('sessions').getList(1, 50, {
                filter: `branch_id = "${branchId}" && (status = "occupied" || status = "booked")`,
                expand: 'device_id',
                sort: '-created'
            });
            setSessions(records.items);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEndSession = async (session) => {
        try {
            // Update session status to closed
            await pb.collection('sessions').update(session.id, {
                status: "closed",
                end_time: new Date().toISOString()
            });

            // Update device status to available
            await pb.collection('inventory').update(session.device_id, {
                status: "open"
            });

            toast({
                title: "Success",
                description: "Session ended successfully"
            });

            fetchOccupiedSessions();
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
        fetchOccupiedSessions();
        // Set up real-time updates
        const interval = setInterval(fetchOccupiedSessions, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
                <Card key={session.id} className="flex flex-col justify-between">
                    <CardHeader className="p-3 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                                <AvatarImage 
                                    src={`${API_URL}api/files/inventory/${session.device_id}/${session.expand?.device_id?.avatar}`} 
                                    alt={session.expand?.device_id?.name} 
                                />
                                <AvatarFallback>{session.expand?.device_id?.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="truncate">{session.expand?.device_id?.name}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 p-3 sm:p-4">
                        <div className="flex flex-col sm:justify-between gap-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Timer className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">Started: {new Date(session.session_in).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Timer className="h-4 w-4 flex-shrink-0" />
                                <span>Duration: {session.duration_hours}h</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="grid grid-cols-2 gap-2 p-3 sm:p-6">
                        <Button 
                            variant="secondary"
                            onClick={() => setSelectedSession(session)}
                            className="w-full text-sm sm:text-base"
                        >
                            <Timer className="mr-2 h-4 w-4" />
                            Extend
                        </Button>
                        <Button 
                            variant="destructive"
                            onClick={() => handleEndSession(session)}
                            className="w-full text-sm sm:text-base"
                        >
                            <StopCircle className="mr-2 h-4 w-4" />
                            End
                        </Button>
                    </CardFooter>
                </Card>
            ))}

            <ExtendSessionDialog 
                open={!!selectedSession}
                onOpenChange={() => setSelectedSession(null)}
                session={selectedSession}
                onSuccess={fetchOccupiedSessions}
            />
        </div>
    );
}
