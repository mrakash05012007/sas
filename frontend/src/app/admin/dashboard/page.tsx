"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users, Server, ShieldCheck, Activity, Search, ListFilter, Download, Settings } from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [dashRes, logsRes] = await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/admin/audit_logs")
        ]);
        setData(dashRes.data);
        setLogs(logsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-8 h-8 rounded-full border-t-2 border-slate-900 border-solid"></div></div>;

  const metrics = data?.metrics || { total_users: 0, total_sessions: 0, qr_fallbacks_used: 0 };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <nav className="sticky top-0 z-50 w-full glass dark:glass-dark border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-slate-800 dark:bg-slate-200 rounded-md p-1">
                <ShieldCheck className="w-6 h-6 text-white dark:text-slate-900" />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">EduTrack Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {user?.full_name} (System Admin)
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
            <p className="text-slate-500 mt-1">Global monitoring and platform analytics.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
               <Download className="w-4 h-4"/> Export Full Report
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-medium rounded-md shadow-md hover:bg-slate-800 transition-colors">
               <Settings className="w-4 h-4"/> Platform Settings
            </button>
          </div>
        </div>

        {/* Top level metrics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass dark:glass-dark">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Registered Users</CardTitle>
              <Users className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.total_users}</div>
              <p className="text-xs text-slate-500 mt-1">Students, Teachers, Admins</p>
            </CardContent>
          </Card>
          
          <Card className="glass dark:glass-dark">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Sessions Tracked</CardTitle>
              <Server className="w-4 h-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.total_sessions}</div>
              <p className="text-xs text-slate-500 mt-1">Across all departments</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-rose-500 glass dark:glass-dark">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">QR Fallback Activations</CardTitle>
              <Activity className="w-4 h-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.qr_fallbacks_used}</div>
              <p className="text-xs text-rose-600 mt-1 font-medium">System exceptions logged</p>
            </CardContent>
          </Card>
        </section>

        {/* Security Audit Trail */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">System Security & Audit Log</h2>
            <div className="flex gap-2">
               <div className="relative">
                 <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
                 <input type="text" placeholder="Search logs..." className="pl-9 pr-3 py-1.5 text-sm rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-64"/>
               </div>
               <button className="p-1.5 rounded border border-slate-200 bg-white shadow-sm hover:bg-slate-50"><ListFilter className="w-4 h-4"/></button>
            </div>
          </div>
          
          <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-medium">Timestamp (UTC)</th>
                    <th className="px-6 py-4 font-medium">Actor User ID</th>
                    <th className="px-6 py-4 font-medium">Action type</th>
                    <th className="px-6 py-4 font-medium w-1/2">Specific Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        No auditable events logged yet.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-3 whitespace-nowrap text-slate-500">
                          {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
                        </td>
                        <td className="px-6 py-3 font-mono">{log.user_id || "System"}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold
                            ${log.action === 'ENABLED_QR' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30' : 
                              log.action === 'MARKED_ATTENDANCE_QR' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30' : 
                              'bg-slate-100 text-slate-800 dark:bg-slate-800'}
                          `}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-slate-600 dark:text-slate-300 break-words">{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

      </main>
    </div>
  );
}
