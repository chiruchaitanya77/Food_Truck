import { AdminLayout } from "@/components/layout/AdminLayout";
import { withAuth, getAuthToken } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/api";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Eye, Users, TrendingUp, Globe, MapPin, Clock, Monitor } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import {useAdminAnalytics} from "@workspace/api-client-react";

const COLORS = ["#FF3B3B", "#FFD700", "#4F9EF0", "#56C27A", "#F97316", "#A855F7", "#EC4899", "#14B8A6"];

function StatCard({ label, value, icon: Icon, color, sub }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-bold mb-0.5">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value?.toLocaleString() ?? "—"}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Analytics() {
  const { data, isLoading } = useAdminAnalytics({
    request: {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    },
  });

  const dailyData = (data?.dailyVisits || []).map((d: any) => ({
    date: format(parseISO(d.date), "d MMM"),
    Visits: d.count,
  }));

  const cityData = (data?.topCities || []).slice(0, 7).map((d: any) => ({
    name: d.city + (d.country ? ` (${d.country})` : ""),
    value: d.count,
  }));

  const countryData = (data?.topCountries || []).slice(0, 8).map((d: any) => ({
    name: d.country || "Unknown",
    Visitors: d.count,
  }));

  const pageData = (data?.topPages || []).slice(0, 6).map((d: any) => ({
    name: d.page || "/",
    Visits: d.count,
  }));

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display text-gray-900 tracking-wide">Website Analytics</h1>
        <p className="text-gray-500 font-medium mt-1">Track visitor trends and grow your customer base.</p>
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Visits" value={data?.totalVisits} icon={Eye} color="bg-blue-500" />
          <StatCard label="Unique Visitors" value={data?.uniqueVisitors} icon={Users} color="bg-purple-500" />
          <StatCard label="Visits Today" value={data?.todayVisits} icon={TrendingUp} color="bg-green-500" />
          <StatCard label="This Week" value={data?.weekVisits} icon={Clock} color="bg-orange-500" />
        </div>
      )}

      {/* Daily visits chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-1">Daily Visits — Last 30 Days</h2>
        <p className="text-sm text-gray-400 mb-5">See which days drive the most traffic. Use this to plan posts and offers.</p>
        {isLoading ? <Skeleton className="h-56 rounded-xl" /> : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF3B3B" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#FF3B3B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="Visits" stroke="#FF3B3B" strokeWidth={2.5} fill="url(#visitGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Countries */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-gray-800">Top Countries</h2>
          </div>
          <p className="text-sm text-gray-400 mb-5">Know your audience's home region to target the right area.</p>
          {isLoading ? <Skeleton className="h-52 rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={countryData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={80} />
                <Tooltip />
                <Bar dataKey="Visitors" fill="#FF3B3B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Cities Pie */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-gray-800">Top Cities</h2>
          </div>
          <p className="text-sm text-gray-400 mb-5">Focus your promotions on the cities with most visitors.</p>
          {isLoading ? <Skeleton className="h-52 rounded-xl" /> : cityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={cityData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {cityData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400">No city data yet</div>
          )}
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Monitor className="w-5 h-5 text-green-500" />
          <h2 className="text-lg font-bold text-gray-800">Most Visited Pages</h2>
        </div>
        <p className="text-sm text-gray-400 mb-5">Discover what customers look at most — improve those sections for more conversions.</p>
        {isLoading ? <Skeleton className="h-44 rounded-xl" /> : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={pageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="Visits" fill="#FFD700" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Visits table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center justify-between gap-2">
          Recent Visitor Log
          <span className="text-md font-medium text-gray-500">
            ({data?.recentVisits?.length || 0} visitors)
          </span>
        </h2>
        {isLoading ? <Skeleton className="h-40 rounded-xl" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">IP Address</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">City</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Country</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Page</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentVisits || []).map((v: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-gray-600 text-xs">{v.visitorIp}</td>
                    <td className="py-2.5 px-3 text-gray-700">{v.city || "—"}</td>
                    <td className="py-2.5 px-3 text-gray-700">{v.country || "—"}</td>
                    <td className="py-2.5 px-3 text-gray-500">{v.page || "/"}</td>
                    <td className="py-2.5 px-3 text-gray-400 text-xs whitespace-nowrap">
                      {format(new Date(v.visitedAt), "d MMM, h:mm a")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!data?.recentVisits || data.recentVisits.length === 0) && (
              <div className="py-10 text-center text-gray-400">No visits tracked yet.</div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
