"use client";
import React, { useState } from "react";
import PasswordInput from "@/app/components/inputFields/PasswordInput";
import EmailInput from "@/app/components/inputFields/EmailInput";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoginSchema } from "@/schemas/auth";

const LoginPage: React.FC = () => {
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
        router.push("/");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">
          Login
        </h1>
        <form onSubmit={handleSubmit}>
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

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full mt-4 px-4 py-2 bg-[#94BBFF] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#94BBFF] focus:ring-opacity-50 ${
              !isFormValid || loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-600"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Additional login options */}
        <div className="mt-6 text-center">
          <p className="text-white text-sm">
            Don&apos;t have an account?{" "}
            <a href="/auth/sign-up" className="text-[#94BBFF] hover:underline">
              Sign up
            </a>
          </p>
          <div className="mt-4">
            <button
              //Will Implement in Later Stages
              // onClick={() => signIn("google")}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
