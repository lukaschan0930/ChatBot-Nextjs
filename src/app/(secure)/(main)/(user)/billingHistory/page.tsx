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

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'text-green-400';
            case 'pending':
                return 'text-orange-400';
            case 'failed':
                return 'text-red-400';
            default:
                return 'text-gray-400';
        }
    }

    if (isLoading) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-black">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen text-white p-4 sm:p-6 lg:p-8 !pt-[120px] sm:!pt-[100px]">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-xl sm:text-2xl font-semibold text-white mb-6 sm:mb-8">Billing History</h1>
                
                {/* Desktop Table View */}
                <div className="hidden md:block bg-transparent rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="bg-transparent border-b border-gray-700">
                                    <th className="text-left py-4 px-4 lg:px-6 text-gray-300 font-medium text-sm lg:text-base">Date</th>
                                    <th className="text-left py-4 px-4 lg:px-6 text-gray-300 font-medium text-sm lg:text-base">Type</th>
                                    <th className="text-left py-4 px-4 lg:px-6 text-gray-300 font-medium text-sm lg:text-base">Amount</th>
                                    <th className="text-left py-4 px-4 lg:px-6 text-gray-300 font-medium text-sm lg:text-base">Status</th>
                                    <th className="text-left py-4 px-4 lg:px-6 text-gray-300 font-medium text-sm lg:text-base">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {planHistory.length > 0 ? planHistory.map((history, index) => (
                                    <tr key={history._id} className="bg-transparent border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                        <td className="py-4 px-4 lg:px-6 text-gray-200 text-sm lg:text-base">
                                            {format(new Date(history.createdAt), "yyyy/MM/dd")}
                                        </td>
                                        <td className="py-4 px-4 lg:px-6 text-gray-200 text-sm lg:text-base">{history.type}</td>
                                        <td className="py-4 px-4 lg:px-6 text-gray-200 text-sm lg:text-base">${history.price}</td>
                                        <td className="py-4 px-4 lg:px-6 capitalize">
                                            <span className={`font-medium text-sm lg:text-base ${getStatusColor(history.status)}`}>
                                                {history.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 lg:px-6">
                                            {
                                                history.invoicePdfUrl && (
                                                    <a href={history.invoicePdfUrl} target="_blank" rel="noopener noreferrer">
                                                        <button className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer bg-gray-800 rounded-md">
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    </a>
                                                )
                                            }
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-400">
                                            No billing history found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {planHistory.length > 0 ? planHistory.map((history, index) => (
                        <div key={history._id} className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-600/30 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-gray-500/50">
                            {/* Header with Date and Status */}
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex flex-col">
                                    <span className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Transaction Date</span>
                                    <span className="text-white font-semibold text-base">
                                        {format(new Date(history.createdAt), "MMM dd, yyyy")}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Status</span>
                                    <span className={`font-semibold capitalize px-3 py-1 rounded-full text-xs ${
                                        history.status.toLowerCase() === 'paid' 
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : history.status.toLowerCase() === 'pending'
                                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    }`}>
                                        {history.status}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Amount Section - Featured */}
                            <div className="bg-gray-700/30 rounded-lg p-4 mb-4 border border-gray-600/20">
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm font-medium mb-1">Amount Charged</p>
                                    <p className="text-white text-2xl font-bold">${history.price}</p>
                                    <p className="text-gray-300 text-sm mt-1 capitalize">{history.type}</p>
                                </div>
                            </div>

                            {/* Action Button */}
                            {history.invoicePdfUrl && (
                                <a href={history.invoicePdfUrl} target="_blank" rel="noopener noreferrer" className="block">
                                    <button className="flex items-center justify-center space-x-3 w-full bg-gradient-to-r from-blue-600/80 to-blue-700/80 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] border border-blue-500/30">
                                        <Download className="w-4 h-4" />
                                        <span>Download Invoice</span>
                                    </button>
                                </a>
                            )}
                        </div>
                    )) : (
                        <div className="text-center py-12 text-gray-400 bg-gray-800/30 border border-gray-700 rounded-lg">
                            <p>No billing history found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BillingHistory;