"use client";
import React, { useState } from "react";
import Link from "next/link";
import PasswordInput from "@/app/components/inputFields/PasswordInput";
import EmailInput from "@/app/components/inputFields/EmailInput";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoginSchema } from "@/schemas/auth";
import Button from "@/app/components/Button";
import Image from "next/image";

import Logo from "@/assets/logo-colored.png";

const LoginPage: React.FC = () => {
  //For Test

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setErrors({ form: "Please fill out all fields." });
      return;
    }

    // Validate with Zod schema
    const validation = LoginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: { [key: string]: string } = {};
      validation.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        // Parse the error message from NextAuth
        const errorData = JSON.parse(result.error);

        setErrors({
          form: errorData.message || "Invalid credentials. Please try again.",
        });
      } else {
        // Successful login
        const session = await getSession();
        if (session?.user?.emailVerified === true) {
          router.push("/dashboard");
        } else {
          router.push("/auth/verify-email");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        form: "An unexpected error occurred. Please try again.",
      });
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
    <div className="w-full min-h-screen flex flex-col bg-[#1A1A1A] flex items-center justify-center px-4">
      <div className="w-full max-w-md px-8 py-4 rounded-lg shadow-boxShadow">
        
        <Image
          src={Logo}
          alt="Company Logo"
          width={80}
          height={80}
          className="m-auto"
        />

        <p className="text-center text-gray-300 text-sm mb-6">
          Glad to see you again! Log in to continue.
        </p>
        <form onSubmit={handleSubmit} noValidate>
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
            id="password"
            name="password"
            error={errors.password}
          />

          {errors.form && (
            <p className="text-red-500 text-sm mt-4 text-center">
              {errors.form}
            </p>
          )}

          <Button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full mt-2"
            variant="custom-blue"
            size="md"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        {/* Additional login options */}
        <div className="mt-6 text-center">
          
          <div className="relative flex items-center mt-2">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-sm text-gray-400 bg-gray-800/40">
              or continue with
            </span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          <Button
            type="button"           
            onClick={handleGoogleSignIn}
            variant="google-oauth"
            size="md"
            className="w-full mt-4 px-4 py-2"
          >
            Continue with Google
          </Button>

          <div className="mt-3 text-center">
            <p className="text-gray-400 text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/*Footer-Sign-up page*/}
      <div className="mt-6 text-center">
        <p className="text-gray-500 text-xs">
          By signing in, you agree to our{" "}
          <a
            href="/terms"
            className="text-gray-400 hover:text-gray-300 underline"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="text-gray-400 hover:text-gray-300 underline"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
