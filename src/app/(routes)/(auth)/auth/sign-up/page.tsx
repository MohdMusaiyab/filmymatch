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
