'use client';

import { toast } from "@/app/hooks/use-toast";
import { Button, Typography, Box, FormControl, InputLabel, OutlinedInput } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface CodeProps {
  code: string;
}

const Verify = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [id, setId] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      if (!token) {
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`/api/auth/verify?token=${token}`);
        const data = await response.json();
        if (data.error) {
          toast({
            title: "Error",
            description: data.error,
          });
        } else {
          setIsVerified(true);
          setId(data.id);
        }
      } catch (error) {
        console.log(error);
        if (error instanceof Error && error.message === "Access forbidden - your token is expired") {
          toast({
            variant: "destructive",
            description: "Access forbidden - your token is expired",
          });
        } else {
          toast({
            variant: "destructive",
            description: "An unexpected error occurred",
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
    verifyEmail();
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CodeProps>();

  const onSubmit = async (code: CodeProps) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/auth/verify`, {
        method: "POST",
        body: JSON.stringify({ code: code.code, id: id }),
      });

      if (res.status === 200) {
        const data = await res.json();
        if (data.token) {
          const result = await signIn("token", {
            token: data.token,
            redirect: false,
          });
          if (result?.error) {
            toast({
              variant: "destructive",
              description: "Access forbidden - your token is expired",
            });
            return;
          }
          router.push("/");
        }
      } else {
        const data = await res.json();
        toast({
          variant: "destructive",
          description: data.message || "Verification failed",
        });
      }
    } catch (error) {
      if (error instanceof Error && error.message === "Access forbidden - your token is expired") {
        toast({
          variant: "destructive",
          description: "Access forbidden - your token is expired",
        });
      } else {
        toast({
          variant: "destructive",
          description: "An unexpected error occurred",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      router.push("/chatText");
    }
  }, [session]);

  return (
    <>
      {isVerified ? (
        <Box className="flex flex-col items-center justify-center min-h-screen bg-mainBg text-buttonFont">
          <div className="flex items-end border-none outline-none focus:outline-none py-0 !mb-5 px-[120px]">
            <Image
              src="/image/EDITH_logo_png.png"
              alt="logo"
              className="h-16 w-auto"
              width={300}
              height={300}
            />
          </div>

          {/* form */}
          <Box className="w-full max-w-sm p-6 space-y-4">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col items-start space-y-10"
            >
              <FormControl
                sx={{
                  width: "100%",
                  backgroundColor: "var(--bg-input)",
                }}
                variant="outlined"
              >
                <InputLabel
                  htmlFor="outlined-adornment-code"
                  sx={{
                    color: "var(--font-button)",
                    "&.Mui-focused": {
                      color: "var(--font-button)",
                    },
                  }}
                >
                  Code
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-code"
                  type="code"
                  error={!!errors.code}
                  label="Code"
                  sx={{
                    color: "white", // Change input text color
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "var(--border-primary)", // Change border color
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "var(--border-secondary)", // Optional: Change border color on hover
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "var(--border-secondary)", // Optional: Change border color when focused
                    },
                  }}
                  {...register("code", {
                    required: "Code is required",
                    pattern: {
                      value: /^[A-Za-z0-9]{6}$/,
                      message: "Code must be exactly 6 characters and contain only numbers and letters"
                    }

                  })}
                />
                {errors.code && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 1, color: "red" }}
                  >
                    {errors.code.message}
                  </Typography>
                )}
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isLoading}
                className="!bg-buttonFont hover:!bg-buttonHoverBg h-10 disabled:!bg-buttonHoverBg !text-hoverFont"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    Check Code...
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
                  "Check Code"
                )}
              </Button>
            </form>
          </Box>
        </Box>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Typography variant="h5" className="!mb-10 !text-[#E2E2E2]">
            {isLoading ? "Verifying email..." : "Verify your email to continue."}
          </Typography>
          <Button
            type="button"
            variant="contained"
            onClick={() => router.push("/signin")}
            className="h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
            disabled={isLoading}
          >
            Back to Login
          </Button>
        </div>
      )}
    </>
  );
};

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4 text-gray-600">Loading...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
        </div>
      </div>
    }>
      <Verify />
    </Suspense>
  );
}
