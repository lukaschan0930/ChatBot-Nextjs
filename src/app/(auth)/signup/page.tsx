"use client"

import { toast } from "@/app/hooks/use-toast";
import { RegisterProps } from "@/app/lib/interface";
import { PersonOutline } from "@mui/icons-material";

import {
  Box,
  Divider,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import FormInput from "@/app/components/FormInput";
import FormBtn from "@/app/components/FormBtn";
import Loading from "@/app/assets/loading";
import EmailIcon from "@/app/assets/email";
import RockIcon from "@/app/assets/rock";
import { validateEmail, validatePassword } from "@/app/lib/utils";
import ShadowBtn from "@/app/components/ShadowBtn";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { Suspense } from "react";
import { useRecaptcha } from "@/app/hooks/useRecaptcha";

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

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    error: "",
  });
  
  const router = useRouter();
  const searchParams = useSearchParams();

  const offerId = searchParams.get("offer_id");
  const transactionId = searchParams.get("user.jumpTransactionId");
  const userId = searchParams.get("user.jumpUserId");

  const { executeRecaptcha } = useRecaptcha();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };
 

  const signUp = async () => {
    if (!validateEmail(formState.email)) {
      setFormState({ ...formState, error: "Invalid email address" });
      return;
    }
    if (!validatePassword(formState.password)) {
      setFormState({ ...formState, error: "Invalid password" });
      return;
    }
    if (formState.password !== formState.confirmPassword) {
      setFormState({ ...formState, error: "Passwords do not match" });
      return;
    }
    if (formState.name.length < 3) {
      setFormState({ ...formState, error: "Username must be at least 3 characters long" });
      return;
    }
    setIsLoading(prev => ({ ...prev, form: true }));
    try {
      // Execute reCAPTCHA
      const recaptchaToken = await executeRecaptcha('signup');

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-recaptcha-token": recaptchaToken
        },
        body: JSON.stringify(
          {
            ...formState,
            offerId,
            transactionId,
            userId
          }
        ),
      });
      const result = await response.json();
      if (result.success) {
        toast({
          variant: "default",
          title: "Verification Email Sent",
          description: "Please check your inbox.",
        });
        router.push("/verify");
      } else {
        setFormState({ ...formState, error: result.error || "Sign up unsuccessful, please try again." });
        return false;
      }
    } catch (error) {
      console.log("error", error);
      setFormState({ ...formState, error: "Sign up unsuccessful, please try again." });
      return false;
    } finally {
      setIsLoading(prev => ({ ...prev, form: false }));
    }
  }

  const googleSignIn = async () => {
    Cookies.set("jumpOfferId", offerId as string);
    Cookies.set("jumpUserId", userId as string);
    Cookies.set("jumpTransactionId", transactionId as string);

    try {
      setIsLoading(prev => ({ ...prev, google: true }));
      // Execute reCAPTCHA before Google sign in
      const recaptchaToken = await executeRecaptcha('google_signup');
      
      await signIn("google", {
        callbackUrl: "/chatText",
        recaptchaToken, // Pass the token to the signIn function
      });
      setIsLoading(prev => ({ ...prev, google: false }));
    } catch (error) {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
      console.log("error", error);
    }
  }

  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      router.push("/chatText");
    }
  }, [session]);

  return (
    <div className="relative h-screen w-screen flex flex-col items-center justify-center bg-[#0B0B0D]">
      <Box className="flex flex-col items-center justify-center shadow-signin bg-box-bg border-box-border border rounded-2xl px-6 py-7 max-w-full w-[438px] relative">
        {/* logo */}
        <Image src="/image/login/pixels.png" alt="pixels" className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[380px] h-auto" width={380} height={380} />
        <button
          className="flex items-end bg-transparent border-none outline-none focus:outline-none py-0"
          onClick={() => router.push("/")}
        >
          <Image
            src="/image/login/logo.png"
            alt="logo"
            width={300}
            height={300}
            className="h-[60px] w-auto"
          />
        </button>
        <div className="mt-6 text-white text-xl font-bold">Get Started</div>
        <div className="mt-4 text-box-fontSub text-sm">Decentralized SuperAI Ecosystem</div>
        <div
          className="w-full flex flex-col items-center gap-4 mt-8"
        >
          {
            formState.error && (
              <div className="text-red-500 text-sm p-3 border-[#FF5A5A99] border rounded-md bg-[#FF5A5A1F] w-full">
                {formState.error}
              </div>
            )
          }
          <FormInput
            placeholder="Username"
            type="text"
            name="name"
            value={formState.name}
            onChange={handleChange}
            icon={<PersonOutline className="text-[#FFFFFFB2]" />}
            className="shadow-input"
          />
          <FormInput
            placeholder="Email Address"
            type="email"
            name="email"
            value={formState.email}
            onChange={handleChange}
            icon={<EmailIcon />}
            className="shadow-input"
          />
          <FormInput
            placeholder="Password"
            type="password"
            name="password"
            value={formState.password}
            onChange={handleChange}
            icon={<RockIcon />}
            className="shadow-input"
          />
          <FormInput
            placeholder="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formState.confirmPassword}
            onChange={handleChange}
            icon={<RockIcon />}
            className="shadow-input"
          />
        </div>
        <FormBtn
          value="Sign Up"
          className="mt-6 shadow-btn-signin backdrop-blur-signin bg-btn-signin text-[#0A0A0A]"
          onClick={() => signUp()}
          loading={isLoading.form}
          loadingText="Sign up..."
          loadingIcon={<Loading />}
        />
        <Box sx={{ display: "flex", alignItems: "center", width: "100%", marginTop: "28px" }}>
          <Divider
            sx={{
              flex: 1,
              color: "#808080",
              "&.MuiDivider-root": {
                borderColor: "#808080",
              },
            }}
          />
          <Typography
            sx={{ mx: 2, whiteSpace: "nowrap", color: "#808080", fontSize: "12px" }}
          >
            OR
          </Typography>
          <Divider
            sx={{
              flex: 1,
              color: "#808080",
              "&.MuiDivider-root": {
                borderColor: "#808080",
              },
            }}
          />
        </Box>
        <ShadowBtn
          className="w-full mt-6 rounded-md"
          mainClassName="border-[#2C2B30] border bg-[#292929] rounded-md shadow-btn-google text-white flex items-center justify-center gap-2"
          onClick={googleSignIn}
          disabled={isLoading.google}
        >
          {isLoading.google ? <Loading /> : <Image src="/image/google.png" alt="google" className="w-6 h-6" width={24} height={24} />}
          <span>{isLoading.google ? "Signing up with Google..." : "Sign Up with Google"}</span>
        </ShadowBtn>
        <div className="flex items-center justify-center mt-4 gap-[2px]">
          <span className="text-box-fontSub text-sm">Already have an account?</span>
          <Link href="/signin" className="text-box-placeholder text-sm underline hover:text-box-placeholder">Sign In</Link>
        </div>
      </Box>
      <Image src="/image/login/login-left.png" alt="logo" className="absolute bottom-0 left-0 w-[453px] h-auto max-xl:hidden" width={1000} height={1000} />
      <Image src="/image/login/login-right.png" alt="logo" className="absolute bottom-0 right-0 w-[453px] h-auto max-xl:hidden" width={1000} height={1000} />
    </div>
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
          <SignUp />
      </Suspense>
  );
}