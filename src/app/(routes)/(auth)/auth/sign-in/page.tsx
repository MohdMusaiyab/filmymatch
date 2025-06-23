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

  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );

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
              Don't have an account?{" "}
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
