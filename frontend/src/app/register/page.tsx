"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, Mail, AlertCircle, User, UserPlus, BookOpen } from "lucide-react";
import api from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");
  
  // Base fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Student specific fields
  const [enrollmentId, setEnrollmentId] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload: any = {
        full_name: fullName,
        email: email,
        password: password,
        role: role
      };

      if (role === "student") {
        payload.enrollment_id = enrollmentId;
        payload.department = department;
        payload.year = parseInt(year);
        payload.section = section;
      }

      await api.post("/auth/register", payload);
      // On success, redirect to login
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 py-12">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-teal-400/20 blur-3xl"></div>
      </div>

      <Card className="w-full max-w-xl z-10 glass dark:glass-dark border-0 shadow-2xl rounded-2xl overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-teal-400 to-blue-600"></div>
        <CardHeader className="space-y-2 pb-6 pt-8 text-center">
          <div className="mx-auto w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mb-2 shadow-inner">
            <UserPlus className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Create Account</CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 text-base">
            Join the EduTrack Platform
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-slate-700 dark:text-slate-300">I am a...</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    role === "student" 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500" 
                      : "border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="text-sm font-medium">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("teacher")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    role === "teacher" 
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 ring-1 ring-teal-500" 
                      : "border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">Teacher</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    role === "admin" 
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500" 
                      : "border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  <span className="text-sm font-medium">Admin</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="fullName" 
                      placeholder="John Doe" 
                      className="pl-10 bg-white/50 dark:bg-slate-800/50"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="john@school.edu" 
                      className="pl-10 bg-white/50 dark:bg-slate-800/50"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Create a strong password" 
                    className="pl-10 bg-white/50 dark:bg-slate-800/50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>

              {/* Conditional Student Fields */}
              {role === "student" && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Student Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="enrollmentId" className="text-slate-700 dark:text-slate-300">Enrollment ID</Label>
                      <Input 
                        id="enrollmentId" 
                        placeholder="CS-2026-001" 
                        className="bg-white/50 dark:bg-slate-800/50"
                        value={enrollmentId}
                        onChange={(e) => setEnrollmentId(e.target.value)}
                        required={role === "student"} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-slate-700 dark:text-slate-300">Department</Label>
                      <Input 
                        id="department" 
                        placeholder="Computer Science" 
                        className="bg-white/50 dark:bg-slate-800/50"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        required={role === "student"} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year" className="text-slate-700 dark:text-slate-300">Year (1-4)</Label>
                      <Input 
                        id="year" 
                        type="number" 
                        min="1" max="4"
                        placeholder="3" 
                        className="bg-white/50 dark:bg-slate-800/50"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        required={role === "student"} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="section" className="text-slate-700 dark:text-slate-300">Section</Label>
                      <Input 
                        id="section" 
                        placeholder="A" 
                        className="bg-white/50 dark:bg-slate-800/50"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        required={role === "student"} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all" size="lg" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800 pt-6 pb-6 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <a href="/login" className="text-teal-600 dark:text-teal-400 font-medium hover:underline">
              Sign in here
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
