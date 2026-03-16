"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle, Calendar, CheckCircle2, XCircle, Clock, MapPin, Download, QrCode, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";

export default function StudentDashboard() {
  const { user, fetchUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/student/dashboard");
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-500 rounded-full mb-4"></div>
        <div className="text-slate-500">Loading your profile...</div>
      </div>
    </div>
  );

  const stats = data?.metrics || { total_classes: 0, present_count: 0, absent_count: 0 };
  const attendancePercentage = stats.total_classes > 0 
    ? Math.round((stats.present_count / stats.total_classes) * 100) 
    : 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full glass dark:glass-dark border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 rounded-md p-1">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">EduTrack</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {user.full_name} ({user.enrollment_id})
              </span>
              <UserCircle className="w-8 h-8 text-slate-400" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Here is an overview of your academic attendance.</p>
          </div>
          <Button variant="outline" className="gap-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
            <Download className="w-4 h-4" />
            Download Monthly Report
          </Button>
        </section>

        {/* Overview Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 shadow-sm glass dark:glass-dark">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Classes</CardTitle>
              <Calendar className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_classes}</div>
              <p className="text-xs text-slate-500 mt-1">This semester</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-teal-500 shadow-sm glass dark:glass-dark">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Attendance Rate</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{attendancePercentage}%</div>
              <p className="text-xs text-slate-500 mt-1">Overall percentage</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-sm glass dark:glass-dark">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Late Marks</CardTitle>
              <Clock className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-slate-500 mt-1">Requires review if &gt; 3</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-rose-500 shadow-sm glass dark:glass-dark">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Absences</CardTitle>
              <XCircle className="w-4 h-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.absent_count}</div>
              <p className="text-xs text-slate-500 mt-1">Days missed</p>
            </CardContent>
          </Card>
        </section>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Attendance List */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <Card className="shadow-md overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="h-1 w-full bg-gradient-to-r from-teal-400 to-blue-500"></div>
              <CardHeader>
                <CardTitle>Recent Attendance History</CardTitle>
                <CardDescription>Your log of the last 10 days</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium">Session ID</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium">Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {data?.attendances?.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                            No attendance records found yet.
                          </td>
                        </tr>
                      ) : (
                        data?.attendances?.map((record: any) => (
                          <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4 font-medium">
                              {format(new Date(record.timestamp), "MMM dd, yyyy HH:mm")}
                            </td>
                            <td className="px-6 py-4">Session #{record.session_id}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${record.status === 'PRESENT' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400' :
                                  record.status === 'LATE' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                                  'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                                }`}>
                                {record.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-slate-500 dark:text-slate-400 text-xs py-1 px-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800">
                                {record.method === "QR_FALLBACK" ? "QR Backup" : record.method}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fallback QR Panel */}
          <div className="col-span-1 space-y-6">
            <Card className="shadow-lg border-rose-100 dark:border-rose-900/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 dark:bg-rose-900/10 rounded-bl-full -z-10"></div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-rose-100 dark:bg-rose-900/50 p-2 rounded-lg">
                    <QrCode className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <CardTitle className="text-lg">Personal QR Fallback</CardTitle>
                </div>
                <CardDescription>
                  Your unique QR code is only valid when the teacher activates the fallback mechanism. DO NOT share this.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="w-48 h-48 bg-white p-2 rounded-xl shadow-inner border border-slate-100 flex items-center justify-center">
                  {/* Mock QR Code Visual */}
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${user.qr_code_id || 'DEMO_QR'}`} 
                    alt="Student QR Code" 
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-3 py-2 rounded-full font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Primary mode is Face Recognition
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
