'use client'

import { toast } from "@/app/hooks/use-toast";
import { MailOutline, VisibilityOutlined, VisibilityOffOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { LoginProps } from "@/app/lib/interface";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";

const SignIn = () => {
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

  const onSubmit = async (data: LoginProps) => {
    setIsLoading((prev) => ({ ...prev, form: true }));
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          variant: "destructive",
          description:
            "Sign in unsuccessful, please check your credentials.",
        });
        return;
      }
      router.push("/");
    } catch (error) {
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

  const { data: session } = useSession();
  
  useEffect(() => {
    if (session) {
      router.push("/chatText");
    }
  }, [session]);

  return (
    <Box className="flex flex-col items-center justify-center min-h-screen bg-[#000000] text-[#E2E2E2] max-md:w-full">

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
                }
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
              "Sign In"
            )}
          </Button>
        </form>

        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <Divider
            sx={{
              flex: 1,
              color: "#FFFFFF33",
              "&.MuiDivider-root": {
                borderColor: "#FFFFFF33",
              },
            }}
          />
          <Typography
            sx={{ mx: 2, whiteSpace: "nowrap", color: "#FFFFFF" }}
          >
            OR
          </Typography>
          <Divider
            sx={{
              flex: 1,
              color: "#FFFFFF33",
              "&.MuiDivider-root": {
                borderColor: "#FFFFFF33",
              },
            }}
          />
        </Box>

        {/* Social login */}
        <div className="space-y-6">
          {/* Google login */}
          <Button
            variant="contained"
            fullWidth
            disabled={isLoading.google}
            onClick={async () => {
              setIsLoading(prev => ({ ...prev, google: true }));
              const result = await signIn("google", {
                redirect: false,
              });
              setIsLoading(prev => ({ ...prev, google: false }));
              if (result?.error) {
                toast({
                  variant: "destructive",
                  description: result.error || "Sign in unsuccessful, please check your credentials.",
                });
                return;
              }
              router.push("/chatText");
            }}
            className="!bg-[#FAFAFA]/80 hover:!bg-[#FFFFFF] h-10 disabled:!bg-[#FAFAFA]/80 !text-[#000000] !text-sm"
          >
            {isLoading.google ? (
              <>
                <span className="flex items-center gap-2">
                  <Image src="/image/google.png" alt="google" className="w-6 h-6" width={24} height={24} />
                  Sign in with Google...
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
              </>
            ) : (
              <span className="flex items-center gap-2">
                <Image src="/image/google.png" alt="google" className="w-6 h-6" width={24} height={24} />
                Sign in with Google
              </span>
            )}
          </Button>
        </div>

        {/* Navigate sign in if you already have an account */}
        <Typography variant="body2" className="mt-4 text-center">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#4169E1] hover:text-[#87CEEB]">
            Sign Up
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default SignIn;
