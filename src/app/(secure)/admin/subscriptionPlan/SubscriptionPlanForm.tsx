'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@mui/material';
import { Input } from '@mui/material';
import { toast } from '@/app/hooks/use-toast';
import { Loader2, Plus, Trash2, CreditCard, Gift, Calendar, Tag, Package, CheckCircle2 } from 'lucide-react';
import { CircularProgress } from '@mui/material';
import { useAdmin } from '@/app/context/AdminContext';
import { IAI } from '@/app/lib/interface';

const subscriptionPlanSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    type: z.string().min(1, 'Type is required'),
    price: z.number().min(0, 'Price must be greater than or equal to 0'),
    points: z.number().min(0, 'Points must be greater than or equal to 0'),
    bonusPoints: z.number().min(0, 'Bonus points must be greater than or equal to 0'),
    isYearlyPlan: z.boolean(),
    priceId: z.string().min(0, 'Stripe Price ID is required'),
    productId: z.string().min(0, 'Stripe Product ID is required'),
    features: z.array(z.string()),
    activeModels: z.array(z.string())
});

type SubscriptionPlanFormData = z.infer<typeof subscriptionPlanSchema>;

interface SubscriptionPlanFormProps {
    id?: string;
}

const SubscriptionPlanForm = ({ id }: SubscriptionPlanFormProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [features, setFeatures] = useState<string[]>([]);
    const [availableModels, setAvailableModels] = useState<IAI[]>([]);
    const [newFeature, setNewFeature] = useState('');
    const { useFetch } = useAdmin();
    const fetch = useFetch();

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors },
    } = useForm<SubscriptionPlanFormData>({
        resolver: zodResolver(subscriptionPlanSchema),
        defaultValues: {
            name: '',
            description: '',
            type: '',
            price: 0,
            points: 0,
            bonusPoints: 0,
            isYearlyPlan: false,
            priceId: '',
            productId: '',
            features: [],
            activeModels: []
        },
    });

    useEffect(() => {
        if (id) {
            const fetchSubscriptionPlan = async () => {
                try {
                    const response = await fetch.get(`/api/admin/subscription-plans/${id}`);
                    if (!response.success) throw new Error('Failed to fetch subscription plan');
                    const data = response.data;
                    reset({
                        name: data.name,
                        description: data.description,
                        type: data.type,
                        price: data.price,
                        points: data.points,
                        bonusPoints: data.bonusPoints,
                        isYearlyPlan: data.isYearlyPlan,
                        priceId: data.priceId,
                        productId: data.productId,
                        features: data.features,
                        activeModels: data.activeModels
                    });
                    setFeatures(data.features);
                } catch (error) {
                    console.error('Error fetching subscription plan:', error);
                    toast({
                        description: 'Failed to load subscription plan',
                        variant: 'destructive'
                    });
                }
            };
            fetchSubscriptionPlan();
        }
    }, [id, reset]);

    useEffect(() => {
        const fetchAvailableModels = async () => {
            try {
                const response = await fetch.get('/api/admin/aiModel');
                if (!response.status) throw new Error('Failed to fetch available models');
                setAvailableModels(response.data);
            } catch (error) {
                console.error('Error fetching available models:', error);
                toast({
                    description: 'Failed to load available models',
                    variant: 'destructive'
                });
            }
        };
        fetchAvailableModels();
    }, []);

    const onSubmit = async (data: SubscriptionPlanFormData) => {
        setIsLoading(true);
        try {
            const url = id ? `/api/admin/subscription-plans/${id}` : '/api/admin/subscription-plans';
            const response = id ? await fetch.put(url, data) : await fetch.post(url, data);

            if (!response.success) throw new Error('Failed to save subscription plan');

            toast({
                description: `Subscription plan ${id ? 'updated' : 'created'} successfully`,
                variant: 'default'
            });
            router.push('/admin/subscriptionPlan');
        } catch (error) {
            console.error('Error saving subscription plan:', error);
            toast({
                description: 'Failed to save subscription plan',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            const updatedFeatures = [...features, newFeature.trim()];
            setFeatures(updatedFeatures);
            setValue('features', updatedFeatures);
            setNewFeature('');
        }
    };

    const removeFeature = (index: number) => {
        const updatedFeatures = features.filter((_, i) => i !== index);
        setFeatures(updatedFeatures);
        setValue('features', updatedFeatures);
    };

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] px-4 mt-10 lg:mt-4">
            <div className="border-2 border-secondaryBorder rounded-[8px] px-10 lg:px-[74px] py-10 lg:py-[60px] max-w-[900px] w-full bg-[#FFFFFF05] overflow-y-auto">
                <div className="flex flex-col gap-7">
                    <div className="text-mainFont text-2xl">
                        {id ? 'Edit Subscription Plan' : 'Add Subscription Plan'}
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
                        <div className="flex w-full gap-5 justify-between lg:flex-row flex-col">
                            <div className="flex flex-col gap-5 w-full">
                                <div className="text-mainFont text-[18px]">Name</div>
                                <Input
                                    {...register('name')}
                                    placeholder="Enter plan name"
                                    className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-5 w-full">
                                <div className="text-mainFont text-[18px]">Type</div>
                                <Input
                                    {...register('type')}
                                    placeholder="Enter type"
                                    className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont"
                                />
                                {errors.type && (
                                    <p className="text-sm text-red-500">{errors.type.message}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-5 w-full">
                                <div className="text-mainFont text-[18px]">Price</div>
                                <Input
                                    type="number"
                                    {...register('price', { valueAsNumber: true })}
                                    placeholder="Enter price"
                                    className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont"
                                />
                                {errors.price && (
                                    <p className="text-sm text-red-500">{errors.price.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-5 w-full">
                            <div className="text-mainFont text-[18px]">Description</div>
                            <Input
                                {...register('description')}
                                placeholder="Enter plan description"
                                multiline
                                rows={4}
                                className="!px-4 !py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont"
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500">{errors.description.message}</p>
                            )}
                        </div>

                        <div className="flex w-full gap-5 justify-between lg:flex-row flex-col">
                            <div className="flex flex-col gap-5 w-full">
                                <div className="text-mainFont text-[18px]">Points</div>
                                <Input
                                    type="number"
                                    {...register('points', { valueAsNumber: true })}
                                    placeholder="Enter points"
                                    className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont"
                                />
                                {errors.points && (
                                    <p className="text-sm text-red-500">{errors.points.message}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-5 w-full">
                                <div className="text-mainFont text-[18px]">Bonus Points</div>
                                <Input
                                    type="number"
                                    {...register('bonusPoints', { valueAsNumber: true })}
                                    placeholder="Enter bonus points"
                                    className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont"
                                />
                                {errors.bonusPoints && (
                                    <p className="text-sm text-red-500">{errors.bonusPoints.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex w-full gap-5 justify-between lg:flex-row flex-col">
                            <div className="flex flex-col gap-5 w-full">
                                <div className="text-mainFont text-[18px]">Stripe Price ID</div>
                                <Input
                                    {...register('priceId')}
                                    placeholder="Enter Stripe Price ID"
                                    className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont"
                                />
                                {errors.priceId && (
                                    <p className="text-sm text-red-500">{errors.priceId.message}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-5 w-full">
                                <div className="text-mainFont text-[18px]">Stripe Product ID</div>
                                <Input
                                    {...register('productId')}
                                    placeholder="Enter Stripe Product ID"
                                    className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont"
                                />
                                {errors.productId && (
                                    <p className="text-sm text-red-500">{errors.productId.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="text-mainFont text-[18px]">Yearly Plan</div>
                            <input
                                type="checkbox"
                                {...register('isYearlyPlan')}
                                onChange={(e) => setValue('isYearlyPlan', e.target.checked)}
                                className="w-4 h-4 rounded border-secondaryBorder"
                            />
                        </div>

                        <div className="flex flex-col gap-5 w-full">
                            <div className="text-mainFont text-[18px]">Features</div>
                            {
                                features && features.length > 0 &&
                                <div className="flex flex-wrap gap-2">
                                    {features.map((feature, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 px-3 py-1 bg-[#FFFFFF05] border border-secondaryBorder rounded-[8px]"
                                        >
                                            <span className="text-mainFont">{feature}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeFeature(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            }
                            <div className="flex gap-2 items-center">
                                <Input
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    placeholder="Add a feature"
                                    className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont"
                                />
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={addFeature}
                                    disabled={!newFeature.trim()}
                                    className="bg-inherit hover:!bg-[#FFFFFF] h-10 disabled:!bg-[#FAFAFA]/80 !text-mainFont !text-sm !border !border-secondaryBorder"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-5 w-full">
                            <div className="text-mainFont text-[18px]">Model Setting</div>
                            <div className="grid grid-cols-2 gap-5">
                                {
                                    availableModels && availableModels.length > 0 &&
                                    availableModels.map((model) => (
                                        <div key={model._id} className="flex items-center gap-2">
                                            <span className="text-mainFont">{model.name}</span>
                                            <input
                                                type="checkbox"
                                                checked={watch('activeModels')?.includes(model._id)}
                                                onChange={(e) => {
                                                    const currentModels = watch('activeModels') || [];
                                                    const newModels = e.target.checked
                                                        ? [...currentModels, model._id]
                                                        : currentModels.filter(id => id !== model._id);
                                                    setValue('activeModels', newModels);
                                                }}
                                            />
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        <div className="flex justify-end gap-5">
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={() => router.push('/admin/subscriptionPlan')}
                                className="bg-inherit hover:!bg-[#FFFFFF] h-10 disabled:!bg-[#FAFAFA]/80 !text-mainFont !text-sm !border !border-secondaryBorder"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isLoading}
                                className="!bg-[#FAFAFA]/80 hover:!bg-[#FFFFFF] h-10 disabled:!bg-[#FAFAFA]/80 !text-[#000000] !text-sm"
                            >
                                {isLoading ? <CircularProgress size={20} /> : (id ? 'Update Plan' : 'Create Plan')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPlanForm; 