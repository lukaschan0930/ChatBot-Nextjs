"use client"

import { toast } from "@/app/hooks/use-toast";
import { RegisterProps } from "@/app/lib/interface";
import { MailOutline, PersonOutline, VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";

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
import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signIn } from "next-auth/react";

const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterProps>({});

  const [isLoading, setIsLoading] = useState({
    google: false,
    twitter: false,
    form: false,
  })

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  const signUp = async (data: RegisterProps) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        return true;
      }
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  const onSubmit = async (data: RegisterProps) => {
    if (data.password !== data.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "Please check your passwords and try again."
      })
      return;
    }
    setIsLoading(prev => ({ ...prev, form: true }));
    try {
      const success = await signUp(data);
      if (success) {
        router.push("/verify");
        toast({
          variant: "default",
          title: "Verification email sent!",
          description: "Please check your inbox."
        })
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Registration error",
          description: error.message
        })
      } else {
        toast({
          variant: "destructive",
          title: "Registration error",
          description: "An unexpected error occurred"
        })
      }
    } finally {
      setIsLoading(prev => ({ ...prev, form: false }));
    }
  };

  return (
    <Box className="flex flex-col items-center justify-center min-h-screen bg-[#000000] text-[#E2E2E2]">
      {/* logo */}
      <button
        className="flex items-end bg-transparent border-none outline-none focus:outline-none py-0 !mb-5 px-[120px]"
        onClick={() => router.push("/")}
      >
        <Image
          src="/image/EDITH_logo_png.png"
          alt="logo"
          className="h-16 w-auto"
          width={300}
          height={300}
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
              Name
            </InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              type="text"
              error={!!errors.name}
              endAdornment={
                <InputAdornment position="end">
                  <PersonOutline sx={{ color: "#FFFFFF" }} />
                </InputAdornment>
              }
              label="Name"
              sx={{
                color: "#FFFFFF", // Change input text color
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
              {...register("name", {
                required: "Name is required",
                pattern: {
                  value: /^[A-Za-z\s.]+$/,
                  message: "Invalid name",
                },
              })}
            />
            {errors.name && (
              <Typography
                variant="caption"
                color="error"
                sx={{ pt: 1, color: "#FF0000", bgcolor: "#000000" }}
              >
                {errors.name.message}
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
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message: "Weak Password",
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
              Confirm Password
            </InputLabel>
            <OutlinedInput

              id="outlined-adornment-password"
              type={showConfirmPassword ? "text" : "password"}
              error={!!errors.confirmPassword}
              endAdornment={
                <InputAdornment position="end">
                  <Button

                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    sx={{ minWidth: 0, padding: 0 }}
                  >
                    {showConfirmPassword ? (
                      <VisibilityOffOutlined sx={{ color: "#FFFFFF" }} />
                    ) : (
                      <VisibilityOutlined sx={{ color: "#FFFFFF" }} />
                    )}
                  </Button>
                </InputAdornment>
              }
              label="Confirm Password"
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
              {...register("confirmPassword", {
                required: "Confirm Password is required",
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message: "Weak password",
                },

              })}
            />

            {errors.confirmPassword && (
              <Typography
                variant="caption"
                color="error"
                sx={{ pt: 1, color: "#FF0000", bgcolor: "#000000" }}
              >
                {errors.confirmPassword.message}
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
                Signing up...
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
              "Sign Up"
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
              await signIn("google", {
                redirect: false,
              });
              setIsLoading(prev => ({ ...prev, google: false }));
            }}
            className="!bg-[#FAFAFA]/80 hover:!bg-[#FFFFFF] h-10 disabled:!bg-[#FAFAFA]/80 !text-[#000000] !text-sm"
          >
            {isLoading.google ? (
              <>
                <span className="flex items-center gap-2">
                  <Image src="/image/google.png" alt="google" className="w-6 h-6" width={24} height={24} />
                  Continue with Google...
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
                Continue with Google
              </span>

            )}
          </Button>
        </div>

        {/* Navigate sign in if you already have an account */}
        <Typography
          variant="body2"
          className="mt-4 text-center "
        >
          Already have an account?{" "}
          <Link href="/signin" className="text-[#4169E1] hover:text-[#87CEEB]">
            Sign In
          </Link>
        </Typography>

      </Box>
    </Box>
  );
};

export default SignUp;
