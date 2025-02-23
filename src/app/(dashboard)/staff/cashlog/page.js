'use client';

import { useSession } from "@/app/context/SessionContext";
import { fetchCashLog } from "@/app/lib/api__structure";
import { useEffect, useState } from "react";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

import { Separator } from "@/components/ui/separator";
import { BadgeIndianRupee, MonitorPlay } from "lucide-react";

export default function CashLog() {
	const { user } = useSession();
	const [openPopup, setOpenPopup] = useState(true);
	const [loading, setLoading] = useState(true);
	const [cashlog, setCashLog] = useState([]);
	const [totalwithdraw, setTotalWithdraw] = useState(0);
	const [totalexpense, setTotalExpense] = useState(0);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [cashlog] = await Promise.all([
					fetchCashLog(),
				])

				setCashLog(cashlog.items);
			} catch (error) {
				console.error('Error', error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, [])


	if (loading) {
		return (
			<div className="flex h-[calc(100vh-4rem)] items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		)
	}

	console.log(cashlog)

	return (
		<div>
			<div className="mb-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Withdrawal</CardTitle>
						<BadgeIndianRupee className="h-8 w-8 text-white p-2 bg-blue-500 rounded-md" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{}</div>
						<p className="text-xs text-muted-foreground">
							Currently active gaming sessions
						</p>
					</CardContent>
				</Card>
			</div>
			<Separator />
			<Table>
				<TableCaption>A list of your recent Cash Log.</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[200px]">Date</TableHead>
						<TableHead className="w-[200px]">Transaction Type</TableHead>
						<TableHead className="w-[200px]">Location</TableHead>
						<TableHead>Description</TableHead>
						<TableHead className="text-center">Amount</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{cashlog.map((log, index) => (
						<TableRow key={index}>
							<TableCell>{log.created}</TableCell>
							<TableCell>{log.withdraw_from_drawer.transaction_type}</TableCell>
							<TableCell>{log.expand.branch_id.name}</TableCell>
							<TableCell>{log.withdraw_from_drawer.description}</TableCell>
							<TableCell className="text-center">{log.withdraw_from_drawer.amount}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
