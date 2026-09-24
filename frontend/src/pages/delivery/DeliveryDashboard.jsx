import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

export default function DeliveryDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedDeliveries();
  }, []);

  const fetchAssignedDeliveries = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/delivery/assigned");
      setDeliveries(res.data.deliveries || res.data || []);
      if (res.data.isAvailable !== undefined) {
        setIsAvailable(res.data.isAvailable);
      }
    } catch (err) {
      console.error("Failed to fetch assigned deliveries:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (subOrderId, newStatus) => {
    try {
      await axiosInstance.patch(`/delivery/orders/${subOrderId}/status`, {
        status: newStatus,
      });
      fetchAssignedDeliveries();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const toggleAvailability = async () => {
    try {
      const res = await axiosInstance.patch("/delivery/availability", {
        isAvailable: !isAvailable,
      });
      setIsAvailable(res.data.isAvailable ?? !isAvailable);
    } catch (err) {
      alert("Failed to update availability");
    }
  };

  if (loading) return <div className="p-6">Loading delivery assignments...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Delivery Partner Dashboard</h1>
        <button
          onClick={toggleAvailability}
          className={`px-4 py-2 rounded font-semibold text-white ${
            isAvailable ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          Status: {isAvailable ? "Online / Available" : "Offline / Busy"}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Assigned Shipments</h2>
        {deliveries.length === 0 ? (
          <p className="text-gray-500">No active delivery assignments found.</p>
        ) : (
          <div className="space-y-4">
            {deliveries.map((item) => (
              <div key={item._id} className="border p-4 rounded flex justify-between items-center">
                <div>
                  <p className="font-bold">Suborder ID: {item._id}</p>
                  <p className="text-sm text-gray-600">Address: {item.shippingAddress?.line1}, {item.shippingAddress?.city}</p>
                  <p className="text-sm">Current Status: <span className="font-semibold uppercase">{item.status}</span></p>
                </div>
                <div className="space-x-2">
                  {item.status === "packed" && (
                    <button
                      onClick={() => handleStatusUpdate(item._id, "shipped")}
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                      Mark Shipped
                    </button>
                  )}
                  {item.status === "shipped" && (
                    <button
                      onClick={() => handleStatusUpdate(item._id, "delivered")}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}