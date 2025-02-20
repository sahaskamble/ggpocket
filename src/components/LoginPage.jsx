"use client";

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import MenuToggle from '@/components/ThemeToggle';
import { useAuth } from "@/contexts/auth-context";
import { Label } from './ui/label';

export default function LoginPage() {
    const { toast } = useToast();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { theme } = useTheme();
    const { login } = useAuth();

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const response = await fetch(`${API_URL}api/collections/branches/records`);
            const data = await response.json();
            setBranches(data.items);
            console.log(data.items);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch branches",
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!selectedBranch) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Please select a branch",
                });
                setIsLoading(false);
                return;
            }

            const result = await login(username, password, selectedBranch);

            // console.log(result);
            if (!result.success) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to login",
                });
            }
        } catch (error) {
            console.error("Login error:", error); // Add this for debugging
            toast({
                variant: "destructive",
                title: "Error",
                description: "An unexpected error occurred",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // console.log(theme)

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className='fixed top-4 right-4'>
                <MenuToggle />
            </div>
            <Card className="w-full max-w-md p-8 space-y-6">
                <div className="text-center">
                    <div className='w-full flex justify-center items-center py-4 pb-6'>
                        <Image src={theme === 'light' ? '/dark-logo.png' : '/light-logo.png'} width={90} height={45} alt='GameGround' />
                    </div>
                    <h1 className="text-2xl font-bold">Welcome Game Ground</h1>
                    <p className="text-gray-500">Please sign in to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            type="username"
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="branch">Branch</Label>
                        <Select
                            value={selectedBranch}
                            onValueChange={setSelectedBranch}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Branch" />
                            </SelectTrigger>
                            <SelectContent>
                                {branches.map((branch) => (
                                    <SelectItem key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
