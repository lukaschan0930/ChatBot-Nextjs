"use client";

import { Button, Input } from "@mui/material";
import { useAdmin } from "@/app/context/AdminContext";
import { useState } from "react";
import { toast } from "@/app/hooks/use-toast";
import CircularProgress from "@mui/material/CircularProgress";

const AdminProfile = () => {
    const { user, setUser, useFetch } = useAdmin();
    const [oldPassword, setOldPassword] = useState("*******");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const fetch = useFetch();

    const updateAdminProfile = async () => {
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(user?.email || "")) {
            toast({
                variant: "destructive",
                description: "Invalid email format"
            });
            return;
        }
        if (newPassword !== confirmPassword) {
            toast({
                variant: "destructive",
                description: "New password and confirm password do not match"
            });
            return;
        }
        if (newPassword === "") {
            toast({
                variant: "destructive",
                description: "New password cannot be empty"
            });
            return;
        }
        if (!passwordPattern.test(newPassword)) {
            toast({
                variant: "destructive",
                description: "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character"
            });
            return;
        }
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch.put("/api/admin/profile", {
                email: user?.email,
                password: oldPassword,
                newPassword: newPassword,
                confirmPassword: confirmPassword
            });

            if (res.success) {
                toast({
                    variant: "default",
                    description: "Profile updated successfully"
                });
            } else {
                toast({
                    variant: "destructive",
                    description: res.message
                });
            }
        } catch (error) {
            console.log(error);
            toast({
                variant: "destructive",
                description: "Failed to update profile"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] px-4 max-md:mt-10">
            <div className="border-2 border-secondaryBorder rounded-[8px] px-10 lg:px-[74px] py-10 lg:pt-[74px] lg:pb-[60px] max-w-[900px] w-full bg-[#FFFFFF05]">
                <div className="flex flex-col gap-7">
                    <div className="text-mainFont text-2xl">Admin Profile</div>
                    <div className="flex flex-col gap-5 lg:w-1/2">
                        <div className="text-mainFont text-[18px]">Admin Email</div>
                        <Input 
                            type="text" 
                            value={user?.email} 
                            placeholder="jone.doe@gmail.com" 
                            className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont" 
                            onChange={(e) => setUser({ 
                                ...user, 
                                email: e.target.value,
                                name: user?.name || "",
                                avatar: user?.avatar || "",
                                inviteCode: user?.inviteCode || ""
                            })}
                        />
                    </div>
                    <div className="flex flex-col gap-5 lg:w-1/2">
                        <div className="text-mainFont text-[18px]">Old Password</div>
                        <Input type="password" onChange={(e) => setOldPassword(e.target.value)} value={oldPassword} placeholder="********" className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont" />
                    </div>
                    <div className="flex w-full gap-5 justify-between lg:flex-row flex-col">
                        <div className="flex flex-col gap-5 w-full">
                            <div className="text-mainFont text-[18px]">New Password</div>
                            <Input type="password" onChange={(e) => setNewPassword(e.target.value)} value={newPassword} placeholder="********" className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont" />
                        </div>
                        <div className="flex flex-col gap-5 w-full">
                            <div className="text-mainFont text-[18px]">Confirm Password</div>
                            <Input type="password" onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} placeholder="********" className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none !text-mainFont" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-5">
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setOldPassword("*******");
                                setNewPassword("");
                                setConfirmPassword("");
                            }}
                            className="bg-inherit hover:!bg-[#FFFFFF] h-10 disabled:!bg-[#FAFAFA]/80 !text-mainFont !text-sm !border !border-secondaryBorder"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            className="!bg-[#FAFAFA]/80 hover:!bg-[#FFFFFF] h-10 disabled:!bg-[#FAFAFA]/80 !text-[#000000] !text-sm"
                            onClick={updateAdminProfile}
                        >
                            {isLoading ? <CircularProgress size={20} /> : "Update"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminProfile;