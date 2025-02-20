"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import pb from "@/lib/db";
import { API_URL } from "@/lib/constants";
import { fetchSnacks } from "@/lib/db_data_helper";

export function SnacksList() {
    const [snacks, setSnacks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSn = useCallback(async () => {
        try {
            const record = await fetchSnacks();
            setSnacks(record);
        } catch (error) {
            console.error('Error fetching snacks:', error);
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        fetchSn();
    }, [fetchSn]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {snacks.map((snack) => (
                <Card key={snack.id}>
                    <CardContent className="flex items-center space-x-4 p-6">
                        <Avatar className="h-12 w-12">
                            <AvatarImage 
                                src={`${API_URL}api/files/inventory/${snack.id}/${snack.avatar}`} 
                                alt={snack.name} 
                            />
                            <AvatarFallback>{snack.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium">{snack.name}</h3>
                                <Badge variant="secondary">
                                    Stock: {snack.stock}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {snack.category}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
