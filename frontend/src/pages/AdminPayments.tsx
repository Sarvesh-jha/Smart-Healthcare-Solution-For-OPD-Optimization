import { useState, useEffect } from "react";
import { IndianRupee, TrendingUp, CreditCard, AlertCircle, CheckCircle, Clock, Search, Download, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { formatINR } from "../utils/currency";
import { api } from "../services/ApiService";

interface PaymentTransaction {
  id: string;
  appointmentId?: string;
  patient: string;
  doctor: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  date: string;
  method: string;
}

interface PaymentStats {
  totalRevenue: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
}

export function AdminPayments() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    completedCount: 0,
    pendingCount: 0,
    failedCount: 0,
  });
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    let isMounted = true;
    async function fetchPayments() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.get<{
          success: boolean;
          stats: PaymentStats;
          transactions: PaymentTransaction[];
        }>("/dashboard/admin/payments");

        if (!isMounted) return;

        if (res.stats) {
          setStats(res.stats);
        }
        if (Array.isArray(res.transactions)) {
          setTransactions(res.transactions);
        }
      } catch (err: any) {
        console.error("Failed to fetch admin payments:", err);
        if (isMounted) {
          setError(err.message || "Failed to load payment transactions.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchPayments();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.doctor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || txn.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = "Transaction ID,Patient,Doctor,Amount (INR),Payment Method,Date,Status\n";
    const rows = transactions
      .map(
        (t) =>
          `"${t.id}","${t.patient}","${t.doctor}",${t.amount},"${t.method}","${t.date}","${t.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `medirxcare_payments_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Payments & Revenue</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Live financial transactions, payment gateway logs, and revenue metrics</p>
        </div>
        {transactions.length > 0 && (
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-12 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-center rounded-2xl">
          <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400 text-sm">Loading financial data...</p>
        </Card>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <Card className="p-6 border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="text-rose-700 dark:text-rose-400 font-medium text-sm">{error}</p>
        </Card>
      )}

      {/* Metric Cards */}
      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="p-6 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-lg">
                  Live Total
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Settled Revenue</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{formatINR(stats.totalRevenue)}</p>
            </Card>

            <Card className="p-6 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-1 rounded-lg">
                  Settled
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Successful Payments</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{stats.completedCount}</p>
            </Card>

            <Card className="p-6 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded-lg">
                  Pending
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Pending Confirmation</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{stats.pendingCount}</p>
            </Card>

            <Card className="p-6 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-1 rounded-lg">
                  Failed
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Failed / Cancelled</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{stats.failedCount}</p>
            </Card>
          </div>

          {/* Controls: Search & Filter */}
          {transactions.length > 0 && (
            <Card className="p-4 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by transaction ID, patient, or doctor..."
                    className="pl-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {(["all", "completed", "pending", "failed"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                        filterStatus === status
                          ? "bg-cyan-600 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Transactions Table or High-Contrast Empty State */}
          {transactions.length > 0 ? (
            <Card className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transaction Logs</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Showing {filteredTransactions.length} of {transactions.length} total records
                  </p>
                </div>
              </div>

              {filteredTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Transaction ID
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Doctor
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                              {transaction.id}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{transaction.patient}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-600 dark:text-slate-300">{transaction.doctor}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{formatINR(transaction.amount)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-xs text-slate-600 dark:text-slate-300">{transaction.method}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-slate-500 dark:text-slate-400">{transaction.date}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                                transaction.status === "completed"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : transaction.status === "pending"
                                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                              }`}
                            >
                              {transaction.status === "completed" && <CheckCircle className="w-3 h-3" />}
                              {transaction.status === "pending" && <Clock className="w-3 h-3" />}
                              {transaction.status === "failed" && <AlertCircle className="w-3 h-3" />}
                              {transaction.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Search className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No matching transactions found</p>
                  <p className="text-xs text-slate-500 mt-1">Try clearing your filters or search query</p>
                </div>
              )}
            </Card>
          ) : (
            /* High-Contrast Clean Empty State */
            <Card className="p-12 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/60 dark:border-cyan-800/60 rounded-2xl flex items-center justify-center mx-auto mb-4 text-cyan-600 dark:text-cyan-400">
                <IndianRupee className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Financial Transactions Recorded</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                There are currently no recorded payment transactions or consultation billings in the database. When patients book appointments or complete checkups, transaction records will populate here automatically.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button
                  onClick={() => navigate("/admin/appointments")}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-sm px-5 text-sm"
                >
                  Manage Appointments
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/doctors")}
                  className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-5 text-sm"
                >
                  View Doctors Roster
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
