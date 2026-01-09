// app/not-found.tsx
"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft, AlertCircle, Compass, FolderOpen } from "lucide-react";
import Button from "@/app/components/Button";
import Link from "next/link";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header - Same as your Layout */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#5865F2] to-[#94BBFF] rounded-lg flex items-center justify-center">
                  <Compass className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">Snippit</span>
              </Link>
            </div>
            <Button
              variant="theme-primary"
              size="sm"
              icon={<Home className="w-4 h-4" />}
              onClick={() => router.push("/dashboard")}
            >
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Animated 404 Illustration */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              delay: 0.1
            }}
            className="relative w-64 h-64 mx-auto mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#5865F2]/10 to-[#94BBFF]/10 rounded-full blur-2xl"></div>
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-48 h-48 bg-gradient-to-br from-[#5865F2] to-[#94BBFF] rounded-full flex items-center justify-center shadow-2xl">
                <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-[#5865F2] mb-2">404</div>
                    <div className="w-12 h-1 bg-[#94BBFF] mx-auto rounded-full"></div>
                  </div>
                </div>
              </div>
              <AlertCircle className="absolute w-12 h-12 text-white top-8 right-8 animate-pulse" />
            </div>
          </motion.div>

          {/* Main Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              Oops! The page you&apos;re looking for seems to have wandered off into 
              the digital void. It might have been moved, deleted, or never existed.
            </p>

            {/* Decorative Elements */}
            <div className="flex items-center justify-center gap-6 mb-10">
              <div className="w-16 h-1 bg-gradient-to-r from-[#5865F2] to-[#94BBFF] rounded-full"></div>
              <AlertCircle className="w-5 h-5 text-[#5865F2]" />
              <div className="w-16 h-1 bg-gradient-to-r from-[#94BBFF] to-[#5865F2] rounded-full"></div>
            </div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Button
                variant="theme-primary"
                size="lg"
                icon={<Home className="w-5 h-5" />}
                onClick={() => router.push("/dashboard")}
                className="min-w-[200px]"
              >
                Go to Dashboard
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                icon={<ArrowLeft className="w-5 h-5" />}
                onClick={() => router.back()}
                className="min-w-[200px]"
              >
                Go Back
              </Button>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl border border-gray-200 p-6 max-w-md mx-auto"
            >
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-[#5865F2]" />
                Quick Links
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/explore"
                  className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-[#5865F2] hover:bg-[#5865F2]/5 transition-colors group"
                >
                  <Compass className="w-4 h-4 text-gray-400 group-hover:text-[#5865F2]" />
                  <span className="text-gray-700 group-hover:text-[#5865F2] font-medium">
                    Explore
                  </span>
                </Link>
                <Link
                  href="/dashboard/my-collection"
                  className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-[#94BBFF] hover:bg-[#94BBFF]/5 transition-colors group"
                >
                  <FolderOpen className="w-4 h-4 text-gray-400 group-hover:text-[#94BBFF]" />
                  <span className="text-gray-700 group-hover:text-[#94BBFF] font-medium">
                    My-Collections
                  </span>
                </Link>
                <Link
                  href="/dashboard/create-post"
                  className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-[#5865F2] hover:bg-[#5865F2]/5 transition-colors group sm:col-span-2"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-400 group-hover:bg-[#5865F2] rounded-full"></div>
                  </div>
                  <span className="text-gray-700 group-hover:text-[#5865F2] font-medium">
                    Create New Snippet
                  </span>
                </Link>
              </div>
            </motion.div>

            {/* Help Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-500 text-sm mt-8"
            >
              If you believe this is an error, please{" "}
              <button
                onClick={() => router.push("/contact")}
                className="text-[#5865F2] hover:text-[#4854e0] font-medium underline"
              >
                contact support
              </button>
            </motion.p>
          </motion.div>
        </div>
      </main>

      {/* Footer matching your theme */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-br from-[#5865F2] to-[#94BBFF] rounded"></div>
              <span className="text-gray-700 font-medium">Snippit</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500 text-sm">404 Not Found</span>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.push("/privacy")}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Privacy
              </button>
              <button
                onClick={() => router.push("/terms")}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Terms
              </button>
              <button
                onClick={() => router.push("/help")}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Help
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}