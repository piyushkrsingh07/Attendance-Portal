"use client";

import React, { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";


export default function SignupFormDemo() {
  // const { data : session } = useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isBigScreen, setIsBigScreen] = useState(false);

  // console.log(session);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const studentNo = formData.get("studentNo") as string;
    const password = formData.get("password") as string;

    if (!studentNo || !password) {
      toast("Please fill in all fields");
      return;
    }

    console.log(studentNo, password);

    try {
      setIsLoading(true);
      const result = await signIn("credentials", {
        studentNo,
        password,
        redirect: false,
      });

      // console.log(result)

      if (result?.ok) {
        toast("Signed in successfully");
        
       router.push('/components/students')

        setIsLoading(false);
        // console.log("first")
      } else {
        // console.error(result?.error);
        // console.log("firshjht")
        toast("Invalid credentials");
        setIsLoading(false);
      }
    } catch (error) {
      // console.log(error)
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsBigScreen(window.innerWidth >= 768); // Adjust the breakpoint as necessary
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
          Welcome to BDCOE
        </h2>
        {/* <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
      Login to aceternity if you can because we don&apos;t have a login flow
      yet
    </p> */}

        <form className="my-8" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4"></div>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="studentNo">Student Number</Label>
            <Input
              id="studentNo"
              placeholder="Enter your Student No."
              type="text"
              name="studentNo"
              required
            />
          </LabelInputContainer>
          <LabelInputContainer className="relative mb-6">
            <Input
              id="password"
              name="password"
              placeholder="Enter your password"
              required
              type={showPassword ? "text" : "password"}
              className="w-full px-3 py-2 border rounded-md pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? (
                <EyeOff className="h-5 mb-1 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 mb-1 text-gray-400" />
              )}
            </button>
          </LabelInputContainer>

          <button
            className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)inset,0px-1px_0px_0px_var(--zinc-800)_inset]"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="loader border-t-white border-4 border-solid border-opacity-30 rounded-full w-5 h-5 animate-spin"></div>
              </div>
            ) : (
              <>
                Sign in &rarr;
                <BottomGradient />
              </>
            )}
          </button>

          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
        </form>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
