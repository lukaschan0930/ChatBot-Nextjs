'use client'

import { ISubscriptionPlan, IAI } from '@/app/lib/interface';
import { useState, useEffect } from 'react';
import { useAdmin } from '@/app/context/AdminContext';
import { Button } from '@/app/components/ui/button';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from '@/app/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Input } from '@mui/material';
import { FaSearch } from 'react-icons/fa';

const SubscriptionPlan = () => {
    const [loading, setLoading] = useState(false);
    const [subscriptionPlans, setSubscriptionPlans] = useState<ISubscriptionPlan[]>([]);
    const [availableModels, setAvailableModels] = useState<IAI[]>([]);
    const { useFetch } = useAdmin();
    const fetch = useFetch();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchSubscriptionPlans();
    }, []);

    const fetchSubscriptionPlans = async () => {
        setLoading(true);
        try {
            const response = await fetch.get('/api/admin/subscription-plans');
            if (response.success) {
                setSubscriptionPlans(response.data.plans);
                setAvailableModels(response.data.availableModels);
            } else {
                toast({
                    description: response.message,
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error fetching subscription plans:', error);
            toast({
                description: "Failed to fetch subscription plans",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;
        
        setLoading(true);
        try {
            const response = await fetch.delete(`/api/admin/subscription-plans/${id}`);
            if (response.success) {
                toast({
                    description: "Subscription plan deleted successfully"
                });
                fetchSubscriptionPlans();
            } else {
                toast({
                    description: response.message,
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error deleting subscription plan:', error);
            toast({
                description: "Failed to delete subscription plan",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredPlans = subscriptionPlans.filter(plan => 
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center min-h-screen px-4 py-8">
            <div className="w-full max-w-[1000px]">
                <div className="flex flex-col lg:flex-row justify-between gap-4 mb-8">
                    <div className="relative w-full lg:w-[280px]">
                        <Input 
                            type="text" 
                            placeholder="Search plans..." 
                            className="w-full px-4 py-2 border border-secondaryBorder rounded-lg focus:outline-none !text-mainFont" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-subButtonFont" />
                    </div>
                    <Button
                        variant="default"
                        className="w-full lg:w-auto !bg-[#FAFAFA]/80 hover:!bg-[#FFFFFF] h-10 disabled:!bg-[#FAFAFA]/80 !text-[#000000] !text-sm"
                        onClick={() => router.push("/admin/subscriptionPlan/add")}
                    >
                        Add New Plan
                    </Button>
                </div>
                
                <div className="w-full overflow-x-auto rounded-lg border border-secondaryBorder">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-secondaryBorder">
                                <th className="text-mainFont text-base lg:text-lg font-bold p-3 text-left">Name</th>
                                <th className="text-mainFont text-base lg:text-lg font-bold p-3 text-left">Type</th>
                                <th className="text-mainFont text-base lg:text-lg font-bold p-3 text-left">Price</th>
                                <th className="text-mainFont text-base lg:text-lg font-bold p-3 text-left">Points</th>
                                <th className="text-mainFont text-base lg:text-lg font-bold p-3 text-left">Annual Plan</th>
                                <th className="text-mainFont text-base lg:text-lg font-bold p-3 text-left">Price ID</th>
                                <th className="text-mainFont text-base lg:text-lg font-bold p-3 text-left">Product ID</th>
                                <th className="text-mainFont text-base lg:text-lg font-bold p-3 text-left">Active Models</th>
                                <th className="text-mainFont text-base lg:text-lg font-bold p-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPlans.map((plan, index) => (
                                <tr key={plan._id} className={`hover:bg-[#FFFFFF05] ${index % 2 === 0 ? "bg-[#FFFFFF05]" : "bg-inherit"}`}>
                                    <td className="text-mainFont text-sm lg:text-base p-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{plan.name}</span>
                                            <span className="text-gray-600 text-xs lg:text-sm">{plan.description}</span>
                                        </div>
                                    </td>
                                    <td className="text-mainFont text-sm lg:text-base p-3">
                                        {plan.type}
                                    </td>
                                    <td className="text-mainFont text-sm lg:text-base p-3">
                                        ${plan.price}
                                        <span className="text-gray-600 text-xs lg:text-sm ml-1">
                                            /{plan.isYearlyPlan ? 'year' : 'month'}
                                        </span>
                                    </td>
                                    <td className="text-mainFont text-sm lg:text-base p-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{plan.points} points</span>
                                            <span className="text-gray-600 text-xs lg:text-sm">+ {plan.bonusPoints} bonus</span>
                                        </div>
                                    </td>
                                    <td className="text-mainFont text-sm lg:text-base p-3">
                                        {plan.isYearlyPlan ? 'Yes' : 'No'}
                                    </td>
                                    <td className="text-mainFont text-sm lg:text-base p-3 break-all max-w-[150px]">
                                        {plan.priceId}
                                    </td>
                                    <td className="text-mainFont text-sm lg:text-base p-3 break-all max-w-[150px]">
                                        {plan.productId}
                                    </td>
                                    <td className="text-mainFont text-sm lg:text-base p-3">
                                        {availableModels.length}/{plan.activeModels.length} models
                                    </td>
                                    <td className="flex gap-2 p-3">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="border-secondaryBorder hover:bg-[#FFFFFF10] bg-[#FFFFFF05] w-8 h-8 p-0"
                                            onClick={() => router.push(`/admin/subscriptionPlan/edit/${plan._id}`)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="border-secondaryBorder hover:bg-[#FFFFFF10] bg-[#FFFFFF05] w-8 h-8 p-0"
                                            onClick={() => handleDelete(plan._id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPlan;