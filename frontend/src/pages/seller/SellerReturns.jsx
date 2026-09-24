import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

export default function SellerReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/returns");
      setReturns(res.data.returns || []);
    } catch (err) {
      console.error("Failed to fetch store returns:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (returnId, status) => {
    try {
      await axiosInstance.patch(`/returns/${returnId}/status`, { status });
      alert(`Return status set to ${status}`);
      fetchReturns();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update return request");
    }
  };

  if (loading) return <div className="p-6">Loading return requests...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Product Returns</h1>
      {returns.length === 0 ? (
        <p className="text-gray-500">No return requests found for your store.</p>
      ) : (
        <div className="space-y-4">
          {returns.map((ret) => (
            <div key={ret._id} className="bg-white p-5 rounded-lg shadow border flex justify-between items-center">
              <div>
                <p className="font-bold">Return ID: {ret._id}</p>
                <p className="text-sm text-gray-600">Customer: {ret.customer?.name} ({ret.customer?.email})</p>
                <p className="text-sm mt-1"><span className="font-semibold">Reason:</span> {ret.reason}</p>
                <p className="text-xs text-gray-400 mt-1">Status: <span className="uppercase font-bold">{ret.status}</span></p>
              </div>
              <div className="space-x-2">
                {ret.status === "requested" && (
                  <>
                    <button
                      onClick={() => handleAction(ret._id, "approved")}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(ret._id, "rejected")}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                    >
                      Reject
                    </button>
                  </>
                )}
                {ret.status === "approved" && (
                  <button
                    onClick={() => handleAction(ret._id, "picked_up")}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                  >
                    Mark Picked Up
                  </button>
                )}
                {ret.status === "picked_up" && (
                  <button
                    onClick={() => handleAction(ret._id, "refunded")}
                    className="px-3 py-1 bg-purple-600 text-white rounded text-sm"
                  >
                    Issue Refund & Restock
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}