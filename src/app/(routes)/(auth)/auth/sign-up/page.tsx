"use client";
import React, { useState } from "react";
import PasswordInput from "@/app/components/inputFields/PasswordInput";
import EmailInput from "@/app/components/inputFields/EmailInput";
import PhoneNumberInput from "@/app/components/inputFields/PhoneNumberInput";
import TextInput from "@/app/components/inputFields/TextInput";
import api from "@/lib/api";
import Image from "next/image";
import Logo from '@/assets/logo-colored.png'
import Link from "next/link";

import { useRouter } from "next/navigation";
import Button from "@/app/components/Button";
import { signIn } from "next-auth/react";

const SignupPage: React.FC = () => {
  const router = useRouter(); // Initialize router
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUserName] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErrors((prev) => ({ ...prev, email: "" }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrors((prev) => ({ ...prev, password: "" }));
  };

  const handlePhoneNumberChange = (value: string) => {
    const formattedPhoneNumber = value.startsWith("+") ? value : `+${value}`;
    setPhoneNumber(formattedPhoneNumber);
    setErrors((prev) => ({ ...prev, phone: "" }));
  };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUserName(e.target.value);
    setErrors((prev) => ({ ...prev, username: "" }));
  };

  const isFormValid =
    email.trim() !== "" && password.trim() !== "" && username.trim() !== "";
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setErrors({ form: "Please fill out all fields." });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const payload = {
        email,
        password,
        username: username,
        phone: phoneNumber.trim() === "" ? undefined : phoneNumber,
      };

      // Axios implementation
      const { data } = await api.post("/auth/sign-up", payload);

      console.log("Signup successful:", data);
      router.push("/auth/sign-in");
    } catch (error: any) {
      console.error("Error during signup:", error);

      // Axios error handling

      if (error.response) {
        // Server responded with error status (4xx/5xx)
        if (error.response.data.errors) {
          const fieldErrors: { [key: string]: string } = {};
          error.response.data.errors.forEach(
            (err: { field: string; message: string }) => {
              fieldErrors[err.field] = err.message;
            }
          );
          setErrors(fieldErrors);
        } else {
          setErrors({ form: error.response.data.message });
        }
      } else {
        // Network or other errors
        setErrors({
          form: "An error occurred during signup. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };
  //   <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
  //     <path
  //       d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
  //       fill="#4285F4"
  //     />
  //     <path
  //       d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
  //       fill="#34A853"
  //     />
  //     <path
  //       d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
  //       fill="#FBBC05"
  //     />
  //     <path
  //       d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
  //       fill="#EA4335"
  //     />
  //   </svg>
  // );

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", {
        redirect: true,
        callbackUrl: "/dashboard",
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      setErrors({
        form: "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#1A1A1A] items-center justify-center px-4">
      <div className="w-full max-w-md px-8 py-2 rounded-lg shadow-boxShadow">
        <Image
          src={Logo}
          alt="Company Logo"
          width={80}
          height={80}
          className="mx-auto"
        />

        <p className="text-center text-gray-300 text-sm mb-4">
          Join us today! Create your account.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <TextInput
            label="Userame"
            placeholder="Enter your Username"
            value={username}
            onChange={handleUserNameChange}
            id="name"
            name="name"
          />
          <EmailInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            id="email"
            name="email"
            error={errors.email}
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={handlePasswordChange}
            showStrength={true}
            id="password"
            name="password"
            error={errors.password}
          />
          <PhoneNumberInput
            label="Phone Number"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            id="phone"
            name="phone"
            error={errors.phone}
          />

          {errors.form && (
            <p className="text-red-500 text-sm mt-4 text-center">
              {errors.form}
            </p>
          )}
          <Button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full mt-2 px-4 py-2"
            variant="custom-blue" // or your preferred variant
            size="md"
          >
            {loading ? "Signing up..." : "Submit"}
          </Button>
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full mt-3 px-4 py-2"
            variant="google-oauth" // Google OAuth style variant
            size="md"
          >
            {/* {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </>
            ) : (
              <>Continue with Google</>
            )} */}

            {/* <GoogleIcon /> */}

            Continue with Google
          </Button>
        </form>
        <div className="my-2 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{" "}
            <Link
              href="/auth/sign-in"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
