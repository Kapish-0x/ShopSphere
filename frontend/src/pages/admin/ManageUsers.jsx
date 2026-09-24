import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import Loader from "../../components/common/Loader";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/users", { params: roleFilter ? { role: roleFilter } : {} });
      setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    await axiosInstance.patch(`/users/${id}/status`, { isActive: !isActive });
    fetchUsers();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm"
        >
          <option value="">All roles</option>
          <option value="customer">Customer</option>
          <option value="seller">Seller</option>
          <option value="delivery">Delivery</option>
          <option value="support">Support</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u._id} className="bg-white border rounded-lg p-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">
                  {u.name} <span className="text-xs text-gray-400 capitalize">({u.role})</span>
                </p>
                <p className="text-sm text-gray-500">{u.email}</p>
              </div>
              <button
                onClick={() => handleToggleActive(u._id, u.isActive)}
                className={`text-xs px-3 py-1.5 rounded-md ${
                  u.isActive ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {u.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
