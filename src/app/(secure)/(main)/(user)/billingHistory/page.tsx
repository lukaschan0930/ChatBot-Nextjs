'use client';
import { useState, useEffect } from "react";
import { Download, Loader2 } from "lucide-react";
import { format } from "date-fns";

const BillingHistory = () => {

    const [planHistory, setPlanHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchPlanHistory = async () => {
            setIsLoading(true);
            try {
                const response = await fetch("/api/user/billingHistory");
                const data = await response.json();
                if (data.success) {
                    setPlanHistory(data.planHistory);
                }
            } catch (error) {
                console.error("Error fetching plan history:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchPlanHistory();
    }, []);

    if (isLoading) {
        return <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
        </div>
    }
    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="text-[16px] text-white">Billing History</div>
            <div className="mt-9">
                <table className="w-full">
                    <thead>
                        <tr>
                            <td>Date</td>
                            <td>Type</td>
                            <td>Amount</td>
                            <td>Status</td>
                            <td>Action</td>
                        </tr>
                    </thead>
                    <tbody>
                        {planHistory.map((history) => (
                            <tr key={history._id}>
                                <td>{format(history.createdAt, "MM/dd/yyyy")}</td>
                                <td>{history.plan.name}</td>
                                <td>{history.price}</td>
                                <td>{history.status}</td>
                                <td>
                                    <Download />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default BillingHistory;