import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import Loader from "../../components/common/Loader";

const ManageStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      // admin-only endpoint — returns every store regardless of status
      const { data } = await axiosInstance.get("/stores/admin/all");
      setStores(data.stores);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axiosInstance.patch(`/stores/${id}/status`, { status });
      fetchStores();
    } catch (err) {
      alert(err.response?.data?.message || "Could not update store");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Stores</h1>

      {stores.length === 0 ? (
        <p className="text-gray-500">No stores found.</p>
      ) : (
        <div className="space-y-3">
          {stores.map((store) => (
            <div key={store._id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{store.storeName}</p>
                <p className="text-sm text-gray-500">
                  {store.seller?.name} · {store.contactEmail || store.seller?.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full capitalize">{store.status}</span>
                {store.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(store._id, "approved")}
                      className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-md hover:bg-green-200"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(store._id, "rejected")}
                      className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-md hover:bg-red-200"
                    >
                      Reject
                    </button>
                  </>
                )}
                {store.status === "approved" && (
                  <button
                    onClick={() => handleStatusChange(store._id, "suspended")}
                    className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-md hover:bg-red-200"
                  >
                    Suspend
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageStores;