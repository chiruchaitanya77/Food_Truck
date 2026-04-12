import { AdminLayout } from "@/components/layout/AdminLayout";
import {useAdminAnalytics, useGetAdminStats} from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { withAuth, getAuthToken } from "@/lib/auth";
import { getApiUrl } from "@/lib/api";
import { Eye, Utensils, Trophy, Camera, Tag, Activity, Users, TrendingUp, MapPin, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetAdminStats({ request: withAuth() });
// \  const { data: analytics } = useAdminAnalytics({ request: withAuth() });
  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics({ request: withAuth() });

  // const { data: analytics } = useQuery({
  //   queryKey: ["/api/admin/analytics/summary"],
  //   queryFn: async () => {
  //     const res = await fetch(getApiUrl("/api/admin/analytics"), {
  //       headers: { Authorization: `Bearer ${getAuthToken()}` },
  //     });
  //     if (!res.ok) return null;
  //     return res.json();
  //   },
  // });


  const statCards = [
    { label: "Total Page Visits", value: stats?.totalVisits, icon: Eye, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Menu Items", value: stats?.totalMenuItems, icon: Utensils, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Stopwatch Winners", value: stats?.totalWinners, icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-50" },
    { label: "Total Submissions", value: stats?.totalSubmissions, icon: Camera, color: "text-pink-500", bg: "bg-pink-50" },
    { label: "Pending Approvals", value: stats?.pendingSubmissions, icon: Activity, color: "text-red-500", bg: "bg-red-50" },
    { label: "Active Discounts", value: stats?.activeDiscounts, icon: Tag, color: "text-green-500", bg: "bg-green-50" },
  ];

  const dailyData = (analytics?.dailyVisits || []).slice(-14).map((d: any) => ({
    date: format(parseISO(d.date), "d MMM"),
    Visits: d.count,
  }));

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display text-gray-900 tracking-wide">Dashboard</h1>
        <p className="text-gray-500 font-medium mt-1">Welcome back! Here's what's happening with Shake Crazy today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : (
          statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`w-13 h-13 w-14 h-14 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-7 h-7 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{(card.value ?? 0).toLocaleString()}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Visit trend mini chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-gray-800">Visitor Trend (Last 14 Days)</h2>
          </div>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="dash-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3B3B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FF3B3B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Visits" stroke="#FF3B3B" strokeWidth={2} fill="url(#dash-grad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No visit data yet</div>
          )}
        </div>

        {/* Quick location + geo summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-blue-500" />
            <h2 className="text-base font-bold text-gray-800">Top Visitors</h2>
          </div>
          {analytics?.topCities?.length > 0 ? (
            <div className="space-y-3">
              {analytics.topCities.slice(0, 5).map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-sm font-medium text-gray-700 truncate">{c.city || "Unknown"}</span>
                    {c.country && <span className="text-xs text-gray-400">{c.country}</span>}
                  </div>
                  <span className="text-sm font-bold text-gray-900 ml-2">{c.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400 text-center py-8">No geo data yet</div>
          )}
          {analytics?.todayVisits !== undefined && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Today</span>
                <span className="font-bold text-gray-900">{analytics.todayVisits} visits</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-500 font-medium flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Unique</span>
                <span className="font-bold text-gray-900">{analytics.uniqueVisitors?.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Growth tips */}
      <div className="bg-gradient-to-r from-primary/5 to-yellow-50 rounded-2xl border border-primary/20 p-6">
        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> Growth Tips for Today
        </h2>
        <ul className="space-y-2 text-sm text-gray-600">
          {stats?.pendingSubmissions > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>You have <strong>{stats.pendingSubmissions} pending submission{stats.pendingSubmissions > 1 ? "s" : ""}</strong> in the gallery. Approving them boosts social proof and encourages more visitors.</span>
            </li>
          )}
          {stats?.activeDiscounts === 0 && (
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 font-bold">•</span>
              <span>No active discounts right now. Add a festival offer to attract more customers during the week.</span>
            </li>
          )}
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">•</span>
            <span>Check the <strong>Analytics tab</strong> to see which cities your visitors are coming from — perfect for choosing parking spots.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Share your website link on Instagram <strong>@shakecrazyofficial</strong> to drive more traffic and game entries.</span>
          </li>
        </ul>
      </div>
    </AdminLayout>
  );
}
