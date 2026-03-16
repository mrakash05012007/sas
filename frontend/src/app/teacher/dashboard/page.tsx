"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Camera, QrCode, ShieldAlert, CheckCircle2, UserCircle, PlayCircle, Clock } from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [qrReason, setQrReason] = useState("");
  const [isQrLoading, setIsQrLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/teacher/dashboard");
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const enableQr = async () => {
    if (!qrReason.trim() || !selectedSession) return;
    setIsQrLoading(true);
    try {
      const res = await api.post(`/teacher/session/${selectedSession.id}/enable_qr?reason=${encodeURIComponent(qrReason)}&duration_minutes=5`);
      setSelectedSession(res.data);
      // Restart internal fetch to update lists
      fetchDashboard();
    } catch (err) {
      alert("Failed to enable QR fallback");
    } finally {
      setIsQrLoading(false);
    }
  };

  // Timer effect for QR fallback
  useEffect(() => {
    if (selectedSession && selectedSession.qr_fallback_enabled && selectedSession.qr_expires_at) {
      const interval = setInterval(() => {
        const expiresAt = new Date(selectedSession.qr_expires_at + "Z").getTime();
        const now = new Date().getTime();
        const diff = Math.floor((expiresAt - now) / 1000);
        if (diff > 0) {
          setTimeLeft(diff);
        } else {
          setTimeLeft(0);
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
    }
  }, [selectedSession]);

  const mockFaceScan = async () => {
    alert("In a real environment, this opens the camera stream and continuously sends frames to the /face-recognition endpoint.");
  };

  if (loading || !user) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <nav className="sticky top-0 z-50 w-full glass dark:glass-dark border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-teal-600 rounded-md p-1">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">EduTrack Teacher</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {user.full_name}
              </span>
              <UserCircle className="w-8 h-8 text-slate-400" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Today's Classes</h1>
          <p className="text-slate-500 mt-1">Select a session to start tracking attendance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.sessions?.map((session: any) => (
            <Card 
              key={session.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${selectedSession?.id === session.id ? 'ring-2 ring-teal-500' : ''}`}
              onClick={() => setSelectedSession(session)}
            >
              <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Session #{session.id}</CardTitle>
                    <CardDescription className="mt-1">
                      Started: {format(new Date(session.start_time), "HH:mm")}
                    </CardDescription>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${session.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                    {session.is_active ? "LIVE" : "ENDED"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <PlayCircle className="w-4 h-4" /> Subject ID: {session.subject_id}
                </div>
                {session.qr_fallback_enabled && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                    <ShieldAlert className="w-3.5 h-3.5" /> QR Backup Active
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedSession && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Primary Face Recognition Panel */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-teal-100 dark:border-teal-900 overflow-hidden glass dark:glass-dark shadow-xl">
                <div className="h-1 bg-teal-500 w-full"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-6 h-6 text-teal-600" />
                    Face Recognition Terminal
                  </CardTitle>
                  <CardDescription>Primary method for attendance capturing. Students approach the camera one by one.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center relative shadow-inner overflow-hidden border-4 border-slate-800">
                    <Camera className="w-16 h-16 text-slate-700" />
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity">
                      <Button onClick={mockFaceScan} size="lg" className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                        <PlayCircle className="w-5 h-5" /> Start Camera Feed
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Status: <strong className="text-teal-600">Ready</strong></span>
                    <span className="text-slate-500">Confidence Threshold: <strong>85%</strong></span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* QR Fallback Controls */}
            <div className="space-y-6">
              <Card className={`shadow-lg transition-colors ${selectedSession.qr_fallback_enabled ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                    <QrCode className="w-5 h-5" />
                    Emergency QR Backup
                  </CardTitle>
                  <CardDescription>
                    Enable only if camera fails. Valid for 5 minutes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedSession.qr_fallback_enabled ? (
                    <div className="space-y-4 text-center">
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-rose-200 shadow-sm inline-block w-full">
                        <div className="text-3xl font-mono font-bold text-rose-600">
                          {timeLeft !== null && timeLeft > 0 ? (
                            `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`
                          ) : "0:00"}
                        </div>
                        <div className="text-sm text-slate-500 mt-1 uppercase tracking-wider font-semibold">Remaining</div>
                      </div>
                      <p className="text-sm text-rose-600 bg-rose-100 dark:bg-rose-900/30 py-2 rounded">
                        Students can scan their QR now.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reason">Reason for opening backup mode</Label>
                        <Input 
                          id="reason" 
                          placeholder="e.g., Camera broken, lighting bad" 
                          value={qrReason}
                          onChange={(e) => setQrReason(e.target.value)}
                        />
                      </div>
                      <Button 
                        variant="destructive" 
                        className="w-full gap-2" 
                        onClick={enableQr}
                        disabled={isQrLoading || !qrReason.trim()}
                      >
                        <ShieldAlert className="w-4 h-4" /> Activate Backup
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Attendance quick view */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex justify-between items-center">
                    Live Check-ins
                    <span className="bg-slate-100 text-slate-800 py-0.5 px-2 rounded-full text-xs">Recent</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-500 text-center py-8 border border-dashed rounded bg-slate-50 dark:bg-slate-900">
                    No students have checked in yet.
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
