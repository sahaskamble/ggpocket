'use client';

import { useState, useEffect } from 'react';
import { fetchCashInHand, addCashInHand } from '@/app/lib/api__structure'; // Import necessary functions
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CashLogPage() {
    const [cashEntries, setCashEntries] = useState([]);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const entries = await fetchCashInHand();
                setCashEntries(entries);
            } catch (error) {
                console.error('Failed to fetch cash entries:', error);
                toast.error('Failed to load cash entries');
            }
        };

        fetchEntries();
    }, []);

    const handleAddCashEntry = async () => {
        const cashData = {
            amount: parseFloat(amount),
            description,
            date: new Date().toISOString().split('T')[0], // Current date
        };

        try {
            await addCashInHand(cashData);
            setCashEntries([...cashEntries, cashData]); // Update state with new entry
            setAmount('');
            setDescription('');
            toast.success('Cash entry added successfully!');
        } catch (error) {
            console.error('Failed to add cash entry:', error);
            toast.error('Failed to add cash entry');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Cash Log</h1>
            <div className="mb-4">
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border rounded p-2 mr-2"
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border rounded p-2 mr-2"
                />
                <Button onClick={handleAddCashEntry} className="bg-blue-600 hover:bg-blue-700">Add Cash Entry</Button>
            </div>
            <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th className="border border-gray-300 p-2">Date</th>
                        <th className="border border-gray-300 p-2">Amount</th>
                        <th className="border border-gray-300 p-2">Description</th>
                    </tr>
                </thead>
                <tbody>
                    {cashEntries.map((entry, index) => (
                        <tr key={index}>
                            <td className="border border-gray-300 p-2">{entry.date}</td>
                            <td className="border border-gray-300 p-2">₹{entry.amount}</td>
                            <td className="border border-gray-300 p-2">{entry.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 
