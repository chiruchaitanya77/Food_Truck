import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetAdminStats } from "@workspace/api-client-react";
import { withAuth } from "@/lib/auth";
import { Eye, Utensils, Trophy, Camera, Tag, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetAdminStats({ request: withAuth() });

  const statCards = [
    { label: "Total Page Visits", value: stats?.totalVisits, icon: Eye, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Menu Items", value: stats?.totalMenuItems, icon: Utensils, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Stopwatch Winners", value: stats?.totalWinners, icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-50" },
    { label: "Total Submissions", value: stats?.totalSubmissions, icon: Camera, color: "text-pink-500", bg: "bg-pink-50" },
    { label: "Pending Approvals", value: stats?.pendingSubmissions, icon: Activity, color: "text-red-500", bg: "bg-red-50" },
    { label: "Active Discounts", value: stats?.activeDiscounts, icon: Tag, color: "text-green-500", bg: "bg-green-50" },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display text-gray-900 tracking-wide">Dashboard Overview</h1>
        <p className="text-gray-500 font-medium mt-1">Welcome back. Here's what's happening with the truck today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({length: 6}).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))
        ) : (
          statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-7 h-7 ${card.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-bold mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value || 0}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </AdminLayout>
  );
}
