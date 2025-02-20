"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import pb from "@/lib/db";
import { API_URL } from "@/lib/constants";
import { fetchGames } from "@/lib/db_data_helper";

export function GamesList() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchGL = useCallback(async () => {
        try {
            const record = await fetchGames();
            setGames(record);
        } catch (error) {
            console.error('Error fetching games:', error); 
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        fetchGL();
    }, [fetchGL]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
                <Card key={game.id}>
                    <CardContent className="flex items-center space-x-4 p-6">
                        <Avatar className="h-12 w-12">
                            <AvatarImage 
                                src={`${API_URL}api/files/inventory/${game.id}/${game.avatar}`} 
                                alt={game.name} 
                            />
                            <AvatarFallback>{game.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="font-medium">{game.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                Popularity: {game.popularity_score}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
