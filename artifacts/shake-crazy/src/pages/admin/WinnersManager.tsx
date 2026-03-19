import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminGetWinners } from "@workspace/api-client-react";
import { withAuth } from "@/lib/auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Trophy } from "lucide-react";

export default function WinnersManager() {
  const { data: winners, isLoading } = useAdminGetWinners({ request: withAuth() });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display text-gray-900 tracking-wide">Stopwatch Winners</h1>
        <p className="text-gray-500 font-medium mt-1">History of all exact 10.000s attempts.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-bold text-gray-600">ID</TableHead>
              <TableHead className="font-bold text-gray-600">Name</TableHead>
              <TableHead className="font-bold text-gray-600">Time Logged</TableHead>
              <TableHead className="font-bold text-gray-600">Prize Won</TableHead>
              <TableHead className="font-bold text-gray-600 text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : winners?.length === 0 ? (
               <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No winners yet.</TableCell></TableRow>
            ) : winners?.map(w => (
              <TableRow key={w.id}>
                <TableCell className="font-mono text-gray-500">#{w.id}</TableCell>
                <TableCell className="font-bold text-gray-900 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-secondary" /> {w.userName}
                </TableCell>
                <TableCell className="font-mono font-bold text-green-600">{w.timeStopped.toFixed(3)}s</TableCell>
                <TableCell><span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-bold">{w.prize}</span></TableCell>
                <TableCell className="text-right text-gray-500">{format(new Date(w.createdAt), 'PPpp')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
