import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminGetSubmissions, useAdminApproveSubmission, useAdminDeleteSubmission } from "@workspace/api-client-react";
import { withAuth } from "@/lib/auth";
import { Check, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function SubmissionsManager() {
  const queryClient = useQueryClient();
  const { data: submissions, isLoading } = useAdminGetSubmissions({ request: withAuth() });
  const approveSub = useAdminApproveSubmission({ request: withAuth() });
  const deleteSub = useAdminDeleteSubmission({ request: withAuth() });
  const { toast } = useToast();

  const handleToggleApprove = async (id: number, currentStatus: boolean) => {
    try {
      await approveSub.mutateAsync({ id, data: { approved: !currentStatus } });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      toast({ title: !currentStatus ? "Approved" : "Hidden", description: "Gallery updated." });
    } catch {
      toast({ title: "Error updating", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSub.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      toast({ title: "Deleted", description: "Submission removed." });
    } catch {
      toast({ title: "Error deleting", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display text-gray-900 tracking-wide">Love Gallery Submissions</h1>
        <p className="text-gray-500 font-medium mt-1">Approve photos and texts before they appear on the homepage.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Loading...</p>
        ) : submissions?.map(sub => (
          <div key={sub.id} className={`bg-white rounded-3xl border-2 transition-all p-6 shadow-sm ${sub.approved ? 'border-green-200 shadow-green-100' : 'border-gray-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{sub.userName}</h3>
                <p className="text-xs text-gray-400 font-medium">{format(new Date(sub.createdAt), 'MMM dd, yyyy - h:mm a')}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${sub.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {sub.approved ? 'PUBLIC' : 'PENDING'}
              </span>
            </div>

            {sub.imageUrl ? (
              <div className="w-full h-48 rounded-xl bg-gray-100 mb-4 overflow-hidden">
                <img src={sub.imageUrl} alt="Submission" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full h-24 rounded-xl bg-gray-50 mb-4 flex flex-col items-center justify-center border border-dashed border-gray-200 text-gray-400">
                <ImageIcon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">No Image</span>
              </div>
            )}

            <p className="text-gray-700 font-medium italic mb-6">"{sub.experienceText}"</p>

            <div className="flex flex-row gap-4 justify-between items-center">
            <Button
                onClick={() => handleDelete(sub.id)}
                variant="destructive"
                className="w-full rounded-xl h-12 font-bold"
            >
              <X className="w-4 h-4 mr-2" /> Delete
            </Button>

              <Button
                  onClick={() => handleToggleApprove(sub.id, sub.approved)}
                  variant={sub.approved ? "outline" : "default"}
                  className={`w-full rounded-xl h-12 font-bold ${!sub.approved ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
              >
                {sub.approved ? (
                    <><X className="w-4 h-4 mr-2" /> Hide from Gallery</>
                ) : (
                    <><Check className="w-4 h-4 mr-2" /> Approve & Publish</>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
