'use client'

import { useState, useRef, useEffect, useMemo } from "react";
import { MdCheck, MdOutlineContentCopy } from "react-icons/md";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useRouter } from "next/navigation";
import { toast } from "@/app/hooks/use-toast";
import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";
import ShadowBtn from "@/app/components/ShadowBtn";
import Camera from "@/app/assets/camera";
// import { useRecaptcha } from "@/app/hooks/useRecaptcha";
import { LABELS } from "@/app/lib/utils";
// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWalletMultiButton } from "@solana/wallet-adapter-base-ui";
import Loading from "@/app/components/Loading";
import { Divider, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { format, differenceInDays } from "date-fns";
import { formatNumber } from "@/app/lib/utils";
import { CreditCard, AlertTriangle, Loader2 } from "lucide-react";
import { Separator } from "@radix-ui/react-dropdown-menu";
import PaymentMethodUpdate from "@/app/components/PaymentMethodUpdate";

const UserSetting = () => {
    const { user, setUser, setRequestPlanId } = useAuth();
    // const { executeRecaptcha } = useRecaptcha();
    const { publicKey, buttonState } = useWalletMultiButton({ onSelectWallet() { }, });

    const [copyStatus, setCopyStatus] = useState<boolean>(false);
    const [avatar, setAvatar] = useState<string>(user?.avatar || "");
    const [name, setName] = useState<string>(user?.name || "");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isCancelLoading, setIsCancelLoading] = useState<boolean>(false);
    const [percent, setPercent] = useState<number>(0);
    const [confirmCancelDialog, setConfirmCancelDialog] = useState({
        open: false
    });
    const [paymentMethodDialog, setPaymentMethodDialog] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const radius = 40;
    const stroke = 8;
    const circumference = 2 * Math.PI * radius;

    const content = useMemo(() => {
        if (publicKey) {
            const base58 = publicKey.toBase58();
            return base58.slice(0, 3) + '..' + base58.slice(-3);
        } else if (buttonState === 'connecting' || buttonState === 'has-wallet') {
            return LABELS[buttonState];
        } else {
            return LABELS['no-wallet'];
        }
    }, [buttonState, publicKey]);

    const router = useRouter();

    const handleCopyClick = () => {
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000);
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new window.Image() as HTMLImageElement;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Reduced maximum dimensions
                    const MAX_SIZE = 200; // Reduced from 500 to 200
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height = Math.round((height * MAX_SIZE) / width);
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width = Math.round((width * MAX_SIZE) / height);
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // More aggressive compression
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.3); // Reduced quality to 30%

                    // Remove the data URL prefix to save some bytes
                    const base64Data = compressedBase64.split(',')[1];
                    resolve(base64Data);
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                // Add size check
                if (file.size > 5000000) { // 5MB
                    toast({
                        variant: "destructive",
                        title: "File too large",
                        description: "Please select an image under 5MB"
                    });
                    return;
                }

                const compressedBase64 = await compressImage(file);
                setAvatar('data:image/jpeg;base64,' + compressedBase64); // Add prefix back for display
            } catch (error) {
                console.error('Error compressing image:', error);
                toast({
                    variant: "destructive",
                    title: "Error processing image",
                });
            }
        }
    };

    const handleClickUpdate = async () => {
        setIsLoading(true);
        try {
            // Execute reCAPTCHA before updating profile
            // const recaptchaToken = await executeRecaptcha('update_profile');

            const res = await fetch(`/api/user/profile`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        // "x-recaptcha-token": recaptchaToken
                    },
                    body: JSON.stringify({
                        name,
                        avatar,
                        wallet: publicKey ? publicKey.toBase58() : user?.wallet
                    })
                })
            const data = await res.json();
            if (data.success) {
                setUser(user ? { ...user, name, avatar, wallet: user?.wallet } : null);
                toast({
                    variant: "default",
                    title: "Update Success",
                })
            } else {
                toast({
                    variant: "destructive",
                    title: data.message || "Update Failed",
                })
            }
        } catch (err) {
            console.error(err);
            toast({
                variant: "destructive",
                title: "Update Failed",
            })
        } finally {
            setIsLoading(false);
        }
    }

    const handleClickCancel = () => {
        router.back();
    }

    useEffect(() => {
        setAvatar(user?.avatar || '');
        setName(user?.name || '');
        if (user) {
            const usedPoints = user.pointsUsed ?? 0;
            const availablePoints = user.currentplan.points + user.currentplan.bonusPoints;
            setPercent((usedPoints / availablePoints) * circumference);
        }
    }, [user])

    const cancelSubscription = () => {
        // Show confirmation dialog
        setConfirmCancelDialog({
            open: true
        });
    };

    const handleConfirmCancelSubscription = async () => {
        setConfirmCancelDialog({ open: false });
        setIsCancelLoading(true);
        
        try {
            const freePlanId = "680f11c0d44970f933ae5e54";
            const response = await fetch("/api/user/subscription/downgrade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId: freePlanId })
            });
            const data = await response.json();
            if (data.success) {
                toast({
                    variant: "default",
                    title: "Subscription will be canceled at the end of current billing period",
                });
                setRequestPlanId(freePlanId);
            } else {
                throw new Error(data.error || "Failed to cancel subscription");
            }
        } catch (error) {
            console.error("Error canceling subscription:", error);
            toast({
                description: error instanceof Error ? error.message : "Failed to cancel subscription",
                variant: "destructive"
            });
        } finally {
            setIsCancelLoading(false);
        }
    };

    const handleCancelCancelSubscription = () => {
        setConfirmCancelDialog({ open: false });
    };

    const changePaymentMethod = () => {
        setPaymentMethodDialog(true);
    };

    const handlePaymentMethodSuccess = async () => {
        // Refresh user data to get updated payment method
        try {
            const response = await fetch("/api/user/profile");
            const data = await response.json();
            if (data.success && data.user) {
                setUser(data.user);
            }
        } catch (error) {
            console.error("Error refreshing user data:", error);
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen text-[#E2E2E2] px-4 w-screen md:pt-[80px] pt-[50px] pb-10">
            {/* <h1 className="text-2xl font-medium text-left text-[#FFFFFF] max-sm:hidden">Profile</h1> */}
            <div
                className="mt-7 bg-[#FFFFFF05] border border-[#25252799] rounded-3xl md:!w-[640px] w-full flex flex-col"
            >
                <div className="flex flex-col w-full items-center justify-center py-[52px] mx-auto bg-[url('/image/text-bg.png')]">
                    <Image
                        src="/image/logo-chat.png"
                        alt="Edith Logo"
                        className="w-auto h-16"
                        width={240}
                        height={240}
                    />
                </div>
                <div className="border-t border-[#25252799] p-6">
                    <div className="flex flex-col -mt-[64px]">
                        <div className="relative w-fit">
                            {
                                avatar ? (
                                    <Image src={avatar} alt="avatar" className="h-[80px] w-[80px] rounded-full" width={80} height={80} />
                                ) : (
                                    <Image src="/image/default-avatar.png" alt="avatar" className="!h-[80px] !w-auto max-w-[80px]" width={80} height={80} />
                                )
                            }
                            <div className="absolute right-0 bottom-0">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <ShadowBtn
                                    className="bg-btn-new-chat mt-6 rounded-full"
                                    mainClassName="bg-gradient-to-b from-[#DFDFDF] to-[#BFBFBF] rounded-full p-[6px]"
                                    onClick={handleAvatarClick}
                                >
                                    <Camera />
                                </ShadowBtn>
                            </div>
                        </div>
                        <div className="text-[16px] text-mainFont mt-4">{name}</div>
                        <div className="flex gap-3 flex-col md:flex-row">
                            <div className="w-full md:w-1/2 flex flex-col gap-3 mt-9 md:pr-14">
                                <div className="flex items-start bg-[#FFFFFF05] border border-[#FFFFFF14] text-[14px] rounded-md max-md:w-full">
                                    <div className="bg-[#292929] px-6 md:px-2 py-2 border-r border-[#FFFFFF14] text-[#808080] !w-[120px] md:!w-[90px] text-center">Username</div>
                                    <input
                                        className="px-3 py-2 text-white bg-[#FFFFFF05] w-full"
                                        placeholder={`${user?.name}`}
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-start bg-[#FFFFFF05] border border-[#FFFFFF14] text-[14px] rounded-md max-md:w-full">
                                    <div className="bg-[#292929] px-6 md:px-1 py-2 border-r border-[#FFFFFF14] text-[#808080] text-nowrap !w-[120px] md:!w-[90px] text-center">Invite Code</div>
                                    <div className="relative max-md:flex-auto">
                                        <input
                                            type="text"
                                            className="px-3 py-2 text-white bg-[#FFFFFF05] w-full"
                                            value={user?.inviteCode}
                                            disabled
                                        />
                                        <CopyToClipboard text={user?.inviteCode || ""} onCopy={handleCopyClick}>
                                            <button
                                                className="absolute right-[1px] -translate-y-1/2 bg-transparent top-1/2 focus:outline-none px-3 border-none group"
                                                onClick={handleCopyClick}
                                            >
                                                {copyStatus ? <MdCheck className="w-5 h-auto" /> : <MdOutlineContentCopy className="w-5 h-auto transition-all duration-300 ease-out group-hover:scale-110" />}
                                            </button>
                                        </CopyToClipboard>
                                    </div>
                                </div>
                                {/* <div className="mt-4">
                                    <WalletMultiButton style={{ backgroundImage: "linear-gradient(rgb(38, 210, 160), rgb(2, 126, 90))" }} endIcon={
                                        publicKey ? <img className="rounded-full" src={`https://i.pravatar.cc/150?u=${publicKey}`} alt="Logo" /> : undefined
                                    }>
                                        {content}
                                    </WalletMultiButton>
                                </div> */}
                            </div>
                            <Divider orientation="vertical" sx={{ backgroundColor: "#FFFFFF14" }} flexItem />
                            <Divider sx={{ backgroundColor: "#FFFFFF14" }} flexItem />
                            <div className="md:w-1/2 w-full md:pl-8 pb-3">
                                <div className="flex w-full justify-between">
                                    <div className="flex flex-col">
                                        <div className="text-[12px] text-[#808080]">Current Plan</div>
                                        <div className="text-[14px] text-white">{user?.currentplan?.name}</div>
                                        <div className="mt-3 text-[12px] text-[#808080]">Point Left</div>
                                        <div className="text-[14px] text-white">{formatNumber(user?.pointsUsed ?? 0)}/{formatNumber(user?.currentplan?.points ?? 0)}</div>
                                    </div>
                                    <div className="">
                                        <div className="relative w-[85px] h-[85px]">
                                            <svg
                                                className="absolute transform"
                                                width="85"
                                                height="85"
                                                viewBox="0 0 100 100"
                                            >
                                                {/* Define a Drop Shadow Filter */}
                                                <defs>
                                                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                                                        <feDropShadow
                                                            dx="0"
                                                            dy="0"
                                                            stdDeviation="6"
                                                            floodColor="#FFFFFF" /* Shadow color (semi-transparent black) */
                                                        />
                                                    </filter>
                                                </defs>
                                                {/* Background Circle */}
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r={radius}
                                                    fill="none"
                                                    stroke="#FFFFFF36"
                                                    strokeWidth={stroke}
                                                    strokeLinecap="round"
                                                />
                                                {/* Foreground Circle (Animated with Shadow) */}
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r={radius}
                                                    fill="none"
                                                    stroke="#FFFFFF"
                                                    strokeWidth={stroke}
                                                    strokeLinecap="round"
                                                    strokeDasharray={circumference}
                                                    strokeDashoffset={circumference - (percent)}
                                                    filter="url(#shadow)" /* Apply shadow filter */
                                                    className="transition-all duration-500 ease-out"
                                                />
                                            </svg>
                                            <div className="absolute text-xs font-bold text-[#FFFFFF] transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                                                {((percent / circumference) * 100).toFixed(0)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <div className="text-[12px] text-[#808080]">Resets on</div>
                                    <div className="text-[14px] text-white">{user?.pointsResetDate ? format(user?.pointsResetDate, 'MMM d, yyyy') : 'N/A'} <span className="text-[#808080]">({user?.pointsResetDate ? differenceInDays(user?.pointsResetDate, new Date()) : 'N/A'} days left)</span></div>
                                </div>
                                <div className="flex gap-3 mt-5 text-[12px] max-sm:flex-col">
                                    <button
                                        className="w-full h-[32px] flex items-center justify-center bg-[#FAFAFA]/80 border border-transparent focus:outline-none text-[#000000] hover:border-transparent transition-transform duration-300 ease-linear"
                                        onClick={() => router.push('/subscription')}
                                    >
                                        Upgrade Plan
                                    </button>
                                    <button
                                        className="w-full h-[32px] flex items-center justify-center text-white bg-[#00000040] border border-[#FFFFFF80] focus:outline-none hover:border-[#FFFFFF80] transition-transform duration-300 ease-linear"
                                        onClick={() => router.push('/billingHistory')}
                                    >
                                        Billing History
                                    </button>
                                </div>
                            </div>
                        </div>
                        {
                            user?.paymentMethod && (
                                <div className="mt-5 border bg-[#FFFFFF05] text-white border-[#FFFFFF1A] rounded-md p-4 flex flex-col gap-2 w-full">
                                    <div className="text-[16px] text-white">Payment Method</div>
                                    <div className="w-full flex justify-between items-center max-sm:flex-col max-sm:items-start">
                                        <div className="flex items-center gap-3">
                                            {
                                                user?.paymentMethod && (
                                                    <PaymentMethodImage paymentMethod={user?.paymentMethod} />
                                                )
                                            }
                                            <div className="flex flex-col">
                                                {
                                                    (user?.paymentMethod as any)?.type === 'card' ? (
                                                        <>
                                                            <div className="text-[16px]">**** **** **** {(user?.paymentMethod as any)?.card?.last4}</div>
                                                            <div className="text-[#808080] text-[10px]">Expires {(user?.paymentMethod as any)?.card?.exp_month}/{(user?.paymentMethod as any)?.card?.exp_year}</div>
                                                        </>
                                                    ) : (user?.paymentMethod as any)?.type === 'link' ? (
                                                        <>
                                                            <div className="text-[16px]">{(user?.paymentMethod as any)?.link?.email}</div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="text-[16px]">unknown</div>
                                                        </>
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="text-[14px] cursor-pointer" onClick={changePaymentMethod}>Change</div>
                                    </div>
                                </div>
                            )
                        }
                        {
                            user?.currentplan && user?.currentplan?.type !== 'free' && (
                                <div className="mt-4 border bg-[#FFFFFF05] text-white border-[#FFFFFF1A] rounded-md p-4 flex flex-col gap-2 w-full">
                                    <div className="text-[16px] text-white">Cancel Subscription</div>
                                    <div className="w-full flex justify-between items-center mt-7 max-sm:flex-col max-sm:items-start">
                                        <div className="flex flex-col text-[12px]">
                                            <div>{user?.currentplan?.name} - {user?.currentplan?.isYearlyPlan ? 'Yearly' : 'Monthly'}</div>
                                            <div className="text-[#808080]">Next billing: {user?.planEndDate ? format(user?.planEndDate, 'MMM d, yyyy') : 'N/A'}</div>
                                        </div>
                                        <div className="text-[20px]">${user?.currentplan?.price} <span className="text-[#808080] text-[12px]">/{user?.currentplan?.isYearlyPlan ? 'year' : 'month'}</span></div>
                                    </div>
                                    <Separator className="my-2 w-full h-[1px] bg-[#FFFFFF1A]" />
                                    <button
                                        className="w-[157px] text-[12px] h-9 flex items-center justify-center text-[#C55252] bg-[#00000040] border border-[#C55252] focus:outline-none hover:border-[#C55252] transition-transform duration-300 ease-linear"
                                        onClick={handleConfirmCancelSubscription}
                                        disabled={isCancelLoading}
                                    >
                                        {isCancelLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Cancel Subscription"}
                                    </button>
                                </div>
                            )
                        }
                    </div>
                </div>
                <div className="flex justify-end gap-3 border-t border-[#25252799] p-3 w-full max-sm:justify-between">
                    <button
                        onClick={handleClickCancel}
                        className="sm:w-[78px] w-full h-[39px] flex items-center justify-center bg-transparent border border-[#FAFAFA]/80 focus:outline-none text-[14px] text-[#FAFAFA]/80 hover:border-[#FAFAFA]/80 transition-transform duration-300 ease-linear"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleClickUpdate}
                        className="sm:w-[78px] w-full h-[39px] flex items-center justify-center bg-[#FAFAFA]/80 border border-transparent focus:outline-none text-[14px] text-[#000000] hover:border-transparent transition-transform duration-300 ease-linear"
                    >
                        {isLoading ? <Loading /> : "Update"}
                    </button>
                </div>

                {/* Cancel Subscription Confirmation Dialog */}
                <Dialog
                    open={confirmCancelDialog.open}
                    onClose={handleCancelCancelSubscription}
                    PaperProps={{
                        sx: {
                            backgroundColor: '#020202',
                            border: '1px solid #FFFFFF1F',
                            borderRadius: '20px',
                            color: 'white',
                            minWidth: '400px',
                            maxWidth: '500px'
                        }
                    }}
                    BackdropProps={{
                        sx: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(8px)'
                        }
                    }}
                >
                    <DialogTitle sx={{ 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        fontSize: '18px',
                        fontWeight: 600
                    }}>
                        <AlertTriangle className="text-red-500" size={24} />
                        Cancel Subscription
                    </DialogTitle>
                    <DialogContent sx={{ color: '#AEB0B9', paddingBottom: 2 }}>
                        Are you sure you want to cancel your <strong className="text-white">{user?.currentplan?.name}</strong> subscription?
                        <br /><br />
                        This action will:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Downgrade you to the Free plan</li>
                            <li>Remove all premium features</li>
                            <li>Take effect at the end of your current billing cycle</li>
                            <li>Cannot be undone immediately</li>
                        </ul>
                    </DialogContent>
                    <DialogActions sx={{ padding: '16px 24px', gap: 1 }}>
                        <Button
                            onClick={handleCancelCancelSubscription}
                            sx={{
                                color: '#AEB0B9',
                                border: '1px solid #FFFFFF26',
                                borderRadius: '8px',
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: '#FFFFFF14',
                                    border: '1px solid #FFFFFF40'
                                }
                            }}
                        >
                            Keep Subscription
                        </Button>
                        <Button
                            onClick={handleConfirmCancelSubscription}
                            disabled={isLoading}
                            sx={{
                                background: 'linear-gradient(to bottom, #C55252, #A03333)',
                                color: 'white',
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 500,
                                '&:hover': {
                                    opacity: 0.9
                                },
                                '&:disabled': {
                                    opacity: 0.5
                                }
                            }}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Cancel Subscription
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Payment Method Update Dialog */}
                <PaymentMethodUpdate
                    open={paymentMethodDialog}
                    onClose={() => setPaymentMethodDialog(false)}
                    onSuccess={handlePaymentMethodSuccess}
                />
            </div>
        </div>
    )
}

const PaymentMethodImage = ({ paymentMethod }: { paymentMethod: any }) => {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        paymentMethod?.type === 'card' ? (
            !imageError ? (
                <div className="w-8 h-8 bg-white rounded-sm flex flex-col items-center justify-center">
                    <Image
                        src={`/image/payment-method/${paymentMethod.card.brand}.png`}
                        alt={`${paymentMethod.card.brand} card`}
                        width={20}
                        height={20}
                        onError={handleImageError}
                    />
                </div>
            ) : (
                <div className="w-8 h-8 bg-[#292929] rounded-sm flex flex-col items-center justify-center">
                    <CreditCard className="w-5 h-5 text-[#808080]" />
                </div>
            )
        ) : paymentMethod?.type === 'link' ? (
            !imageError ? (
                <div className="w-8 h-8 bg-white rounded-sm flex flex-col items-center justify-center">
                    <Image
                        src={`/image/payment-method/link.png`}
                        alt="Link payment method"
                        width={20}
                        height={20}
                        onError={handleImageError}
                    />
                </div>
            ) : (
                <div className="w-8 h-8 bg-[#292929] rounded-sm flex flex-col items-center justify-center">
                    <CreditCard className="w-5 h-5 text-[#808080]" />
                </div>
            )
        ) : (
            <div className="w-8 h-8 bg-[#292929] rounded-sm flex flex-col items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#808080]" />
            </div>
        )
    )
}

export default UserSetting;