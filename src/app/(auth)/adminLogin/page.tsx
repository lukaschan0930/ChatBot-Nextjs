'use client'

import { toast } from "@/app/hooks/use-toast";
import { MailOutline, VisibilityOutlined, VisibilityOffOutlined } from "@mui/icons-material";
import {
    Box,
    Button,
    FormControl,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Typography,
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { LoginProps } from "@/app/lib/interface";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAdmin } from "@/app/context/AdminContext";

const AdminLogin = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginProps>({});

    const [isLoading, setIsLoading] = useState({
        google: false,
        twitter: false,
        form: false,
    });
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const { setLogined, setUser, setToken } = useAdmin();

    const onSubmit = async (data: LoginProps) => {
        setIsLoading((prev) => ({ ...prev, form: true }));
        try {
            const res = await fetch("/api/auth/adminLogin", {
                method: "POST",
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (!result.status) {
                toast({
                    variant: "destructive",
                    description:
                        "Sign in unsuccessful, please check your credentials.",
                });
                return;
            }
            setLogined(true);
            setUser(result.user);
            setToken(result.token);
            router.push("/admin");
        } catch (error) {
            console.log(error);
            toast({
                variant: "destructive",
                description:
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred.",
            });
        } finally {
            setIsLoading((prev) => ({ ...prev, form: false }));
        }
    };

    return (
        <Box className="flex flex-col items-center justify-center min-h-screen text-[#E2E2E2] max-md:w-full">
            {/* logo */}
            <button
                className="flex items-end bg-transparent border-none outline-none focus:outline-none py-0 !mb-5 md:px-[120px]"
                onClick={() => router.push("/")}
            >
                <Image
                    src="/image/EDITH_logo_png.png"
                    alt="logo"
                    width={300}
                    height={300}
                    className="h-16 w-auto"
                />
            </button>

            {/* form */}
            <Box className="w-full max-w-sm p-6 space-y-6">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col items-start space-y-6"
                >
                    <FormControl
                        sx={{
                            width: "100%",
                            backgroundColor: "#FFFFFF0D",
                        }}
                        variant="outlined"
                    >
                        <InputLabel
                            htmlFor="outlined-adornment-password"
                            sx={{
                                color: "#E2E2E2",
                                "&.Mui-focused": {
                                    color: "#E2E2E2",
                                },
                            }}
                        >
                            Email
                        </InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-email"
                            type="email"
                            error={!!errors.email}
                            endAdornment={
                                <InputAdornment position="end">
                                    <MailOutline sx={{ color: "#FFFFFF" }} />
                                </InputAdornment>
                            }
                            label="Email"
                            sx={{
                                color: "#E2E2E2", // Change input text color
                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#FFFFFF33", // Change border color
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#FFFFFF66", // Optional: Change border color on hover
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#FFFFFF66", // Optional: Change border color when focused
                                },
                            }}
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i,
                                    message: "Invalid email address",
                                },
                            })}
                        />
                        {errors.email && (
                            <Typography
                                variant="caption"
                                color="error"
                                sx={{ pt: 1, color: "#FF0000", bgcolor: "#000000" }}
                            >
                                {errors.email.message}
                            </Typography>
                        )}
                    </FormControl>
                    <FormControl
                        sx={{
                            width: "100%",
                            backgroundColor: "#FFFFFF0D",
                        }}
                        variant="outlined"
                    >
                        <InputLabel
                            htmlFor="outlined-adornment-password"
                            sx={{
                                color: "#E2E2E2",
                                "&.Mui-focused": {
                                    color: "#E2E2E2",
                                },
                            }}
                        >
                            Password
                        </InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-password"
                            type={showPassword ? "text" : "password"}
                            error={!!errors.password}
                            endAdornment={
                                <InputAdornment position="end">
                                    <Button
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        sx={{ minWidth: 0, padding: 0 }}
                                    >
                                        {showPassword ? (
                                            <VisibilityOffOutlined sx={{ color: "#FFFFFF" }} />
                                        ) : (
                                            <VisibilityOutlined sx={{ color: "#FFFFFF" }} />
                                        )}
                                    </Button>
                                </InputAdornment>
                            }
                            label="Password"
                            sx={{
                                color: "#E2E2E2",
                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#FFFFFF33",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#FFFFFF66",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#FFFFFF66",
                                },
                                "&:-webkit-autofill": {
                                    WebkitBoxShadow: "0 0 0 1000px #000000 inset !important",
                                    WebkitTextFillColor: "#E2E2E2 !important",
                                    transition: "background-color 5000s ease-in-out 0s !important",
                                },
                            }}
                            {...register("password", {
                                required: "Password is required",
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
                                    message: "Weak password",
                                },
                            })}
                        />

                        {errors.password && (
                            <Typography
                                variant="caption"
                                color="error"
                                sx={{ pt: 1, color: "#FF0000", bgcolor: "#000000" }}

                            >
                                {errors.password.message}
                            </Typography>
                        )}
                    </FormControl>

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={isLoading.form}
                        className="!bg-[#FAFAFA]/80 hover:!bg-[#FFFFFF] h-10 disabled:!bg-[#FAFAFA]/80 !text-[#000000] !text-sm"
                    >
                        {isLoading.form ? (
                            <span className="flex items-center gap-2">
                                Signing In...
                                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                            </span>
                        ) : (
                            "Login to Admin panel"
                        )}
                    </Button>
                </form>
            </Box>
        </Box>
    );
};

export default AdminLogin;