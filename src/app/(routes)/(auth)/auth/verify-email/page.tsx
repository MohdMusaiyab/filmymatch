"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  sendVerificationToken,
  verifyToken,
  checkVerificationToken,
} from "@/actions/auth/authActions";
import { useRouter } from "next/navigation";

const EmailVerificationPage = () => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      checkTokenStatus();
    } else {
      setInitialLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (expiresAt) {
      interval = setInterval(() => {
        const now = new Date();
        const diffMs = expiresAt.getTime() - now.getTime();

        if (diffMs <= 0) {
          setTimeRemaining("Expired");
          setExpiresAt(null);
          clearInterval(interval);
        } else {
          const minutes = Math.floor(diffMs / (1000 * 60));
          const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [expiresAt]);

  const checkTokenStatus = async () => {
    try {
      const result = await checkVerificationToken(session!.user!.email);

      if (result.success && result.exists) {
        // setExpiresAt(new Date(result.expiresAt));
        if (result.expiresAt) {
          setExpiresAt(new Date(result.expiresAt));
        } else {
          setExpiresAt(null);
        }

        setShowVerification(true);
      }

      setInitialLoading(false);
    } catch (error) {
      console.error("Error checking token status:", error);
      setInitialLoading(false);
    }
  };

  const handleSendVerification = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const result = await sendVerificationToken(session!.user!.email);

      if (result.success) {
        setMessage(result.message);
        setExpiresAt(new Date(result.data!.expiresAt));
        setShowVerification(true);
      } else {
        setError(result.message);

        // If there's an existing token, show verification screen with remaining time
        if (
          result.code === "TOKEN_ALREADY_SENT" &&
          result.message.includes("minutes")
        ) {
          const match = result.message.match(/in (\d+) minutes/);
          if (match && match[1]) {
            const minutes = parseInt(match[1], 10);
            setExpiresAt(new Date(Date.now() + minutes * 60 * 1000));
            setShowVerification(true);
          }
        }
      }
    } catch (error: any) {
      setError("An unexpected error occurred. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      setError("Please enter the verification code");
      return;
    }

    try {
      setVerifying(true);
      setError("");
      setMessage("");

      const result = await verifyToken(session!.user!.email, otp);

      if (result.success) {
        setSuccess(true);
        setMessage(result.message);

        // Force session update and wait for it to complete
        await update();

        // Redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      setError("Failed to verify email. Please try again.");
      console.error(error);
    } finally {
      setVerifying(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session || !session.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
            Sign In Required
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Please sign in to verify your email address.
          </p>
          <button
            onClick={() => router.push("/auth/sign-in")}
            className="w-full py-3 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
          Email Verification
        </h1>

        {success ? (
          <div className="text-center space-y-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">{message}</h3>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        ) : !showVerification ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600">
                To access all features, please verify your email address:
              </p>
              <p className="font-medium text-gray-800 mt-1">
                {session.user.email}
              </p>
            </div>

            {message && (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{message}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSendVerification}
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? (
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                "Send Verification Code"
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600">
                We've sent a verification code to:
              </p>
              <p className="font-medium text-gray-800 mt-1">
                {session.user.email}
              </p>

              {timeRemaining && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-500">
                    Code expires in
                  </div>
                  <div
                    className={`text-xl font-semibold mt-1 ${
                      timeRemaining === "Expired"
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {timeRemaining}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    autoComplete="one-time-code"
                    required
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                </div>
              </div>

              {message && (
                <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{message}</p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={verifying || timeRemaining === "Expired"}
                  className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {verifying ? (
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowVerification(false);
                    setOtp("");
                    setError("");
                    setMessage("");
                  }}
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSendVerification}
                  // disabled={loading || (timeRemaining && timeRemaining !== "Expired")}
                  disabled={
                    loading ||
                    (timeRemaining !== null && timeRemaining !== "Expired")
                  }
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150"
                >
                  {loading
                    ? "Sending..."
                    : timeRemaining && timeRemaining !== "Expired"
                    ? "Code already sent"
                    : "Resend verification code"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
