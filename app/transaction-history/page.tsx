"use client";

import { useState, useEffect } from "react";
import { getTransactionHistory } from "@/app/actions/getInvoices"; 

interface Transaction {
  id: string;
  customer: string;
  date: Date | null;
  description: string;
  type: string;
  amount: number;
  due: number;
  balance: number;
}

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

function TransactionHistoryPage() {
  const [startDate, setStartDate] = useState<string>(getTodayDateString());
  const [endDate, setEndDate] = useState<string>(getTodayDateString());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactionHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTransactionHistory(startDate, endDate);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    getTransactionHistory(startDate, endDate)
      .then((data) => {
        if (!ignore) setTransactions(data);
      })
      .catch((err) => {
        if (!ignore) setError(err instanceof Error ? err.message : "Something went wrong");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (date: Date | null) =>
    date ? new Date(date).toLocaleDateString() : "No Date";

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 space-y-3 sm:space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4 mb-2 print:hidden">
        <div className="flex gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-200 p-2 rounded-lg text-sm bg-gray-50 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">To Date</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-200 p-2 rounded-lg text-sm bg-gray-50 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={loadTransactionHistory}
          disabled={isLoading}
          className="bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-all self-end disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Filter"}
        </button>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl">{error}</div>
      )}

      {isLoading && (
        <div className="text-center text-gray-400 py-6">Loading transactions...</div>
      )}

      {!isLoading && transactions.length === 0 && (
        <div className="text-center text-gray-400 py-6">No transactions found for this date range.</div>
      )}

      {!isLoading &&
        transactions.map((tx) => (
          <div
            key={tx.id}
            className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 hover:shadow-md transition relative"
          >
            {/* Top row: id/date on the left */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md shrink-0">
                  #{tx.id}
                </span>
                <p className="text-[11px] text-gray-400 truncate">{formatDate(tx.date)}</p>
              </div>
            </div>

            {/* Body: figures + status. Stacks on mobile, sits in a row from sm up. */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3">
              <div className="grid grid-cols-3 gap-x-3 gap-y-1 sm:flex sm:items-center sm:gap-6">
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                    Customer
                  </p>
                  <p className="text-sm font-semibold text-gray-800 truncate max-w-[8rem]">
                    {tx.customer}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                    Amount
                  </p>
                  <p className="text-sm font-bold text-gray-800 whitespace-nowrap">
                    ৳ {Math.abs(tx.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                    Balance
                  </p>
                  <p className="text-sm font-bold text-gray-800 whitespace-nowrap">
                    ৳ {tx.balance}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-gray-50 sm:border-0">
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wider ${
                    tx.type === "debit" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                  }`}
                >
                  {tx.type === "debit" ? "DUE" : "PAID"}
                </span>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

export default TransactionHistoryPage;