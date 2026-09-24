// import React, { useState, useEffect } from "react";
// import { useAuth } from "../context/AuthContext";
// import axiosInstance from "../api/axiosInstance";
// import {
//   User,
//   Mail,
//   Phone,
//   MapPin,
//   Plus,
//   Trash2,
//   Check,
//   Shield,
//   Home,
//   Briefcase,
// } from "lucide-react";

// const Profile = () => {
//   const { user, setUser } = useAuth();
//   const [name, setName] = useState(user?.name || "");
//   const [phone, setPhone] = useState(user?.phone || "");
//   const [addresses, setAddresses] = useState([]);
//   const [newAddress, setNewAddress] = useState({
//     label: "",
//     line1: "",
//     city: "",
//     state: "",
//     pincode: "",
//   });
//   const [profileMsg, setProfileMsg] = useState("");
//   const [savingProfile, setSavingProfile] = useState(false);
//   const [addingAddress, setAddingAddress] = useState(false);

//   useEffect(() => {
//     axiosInstance
//       .get("/users/me/addresses")
//       .then(({ data }) => setAddresses(data.addresses || []))
//       .catch(console.error);
//   }, []);

//   const handleProfileUpdate = async (e) => {
//     e.preventDefault();
//     setSavingProfile(true);
//     setProfileMsg("");
//     try {
//       const { data } = await axiosInstance.patch("/users/me", { name, phone });
//       setUser(data.user);
//       localStorage.setItem("user", JSON.stringify(data.user));
//       setProfileMsg("Profile updated successfully!");
//       setTimeout(() => setProfileMsg(""), 3000);
//     } catch (err) {
//       setProfileMsg("Failed to update profile.");
//     } finally {
//       setSavingProfile(false);
//     }
//   };

//   const handleAddAddress = async (e) => {
//     e.preventDefault();
//     setAddingAddress(true);
//     try {
//       const { data } = await axiosInstance.post("/users/me/addresses", newAddress);
//       setAddresses(data.addresses || []);
//       setNewAddress({ label: "", line1: "", city: "", state: "", pincode: "" });
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setAddingAddress(false);
//     }
//   };

//   const handleDeleteAddress = async (id) => {
//     try {
//       const { data } = await axiosInstance.delete(`/users/me/addresses/${id}`);
//       setAddresses(data.addresses || []);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
//       {/* Profile Header Banner */}
//       <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
//         <div className="w-20 h-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center text-2xl font-bold uppercase shadow-md shadow-slate-900/10 shrink-0">
//           {user?.name ? user.name.charAt(0) : "U"}
//         </div>

//         <div className="space-y-1 text-center sm:text-left flex-1">
//           <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
//             <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
//             <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 capitalize">
//               {user?.role || "Customer"}
//             </span>
//           </div>
//           <p className="text-sm text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
//             <Mail className="w-3.5 h-3.5 text-slate-400" />
//             {user?.email}
//           </p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
//         {/* Card 1: Edit Profile Details */}
//         <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
//           <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
//             <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
//               <User className="w-4 h-4" />
//             </div>
//             <h2 className="text-lg font-bold text-slate-900">Personal Details</h2>
//           </div>

//           {profileMsg && (
//             <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
//               <Check className="w-4 h-4 text-emerald-600" />
//               <span>{profileMsg}</span>
//             </div>
//           )}

//           <form onSubmit={handleProfileUpdate} className="space-y-4">
//             <div>
//               <label className="block text-xs font-semibold text-slate-700 mb-1">
//                 Full Name
//               </label>
//               <div className="relative">
//                 <input
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   className="w-full bg-slate-50 text-slate-800 text-sm rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                 />
//                 <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
//               </div>
//             </div>

//             <div>
//               <label className="block text-xs font-semibold text-slate-700 mb-1">
//                 Phone Number
//               </label>
//               <div className="relative">
//                 <input
//                   type="tel"
//                   placeholder="e.g. 9876543210"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   className="w-full bg-slate-50 text-slate-800 text-sm rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                 />
//                 <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
//               </div>
//             </div>

//             <div>
//               <label className="block text-xs font-semibold text-slate-500 mb-1">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <input
//                   disabled
//                   value={user?.email || ""}
//                   className="w-full bg-slate-100 text-slate-500 text-sm rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 cursor-not-allowed"
//                 />
//                 <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
//               </div>
//               <p className="text-[11px] text-slate-400 mt-1">Email cannot be modified.</p>
//             </div>

//             <button
//               type="submit"
//               disabled={savingProfile}
//               className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors disabled:opacity-50"
//             >
//               {savingProfile ? "Saving..." : "Save Changes"}
//             </button>
//           </form>
//         </div>

//         {/* Card 2: Saved Delivery Addresses */}
//         <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
//           <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
//             <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
//               <MapPin className="w-4 h-4" />
//             </div>
//             <h2 className="text-lg font-bold text-slate-900">Saved Addresses</h2>
//           </div>

//           {/* List of existing addresses */}
//           <div className="space-y-3">
//             {addresses.length === 0 ? (
//               <p className="text-xs text-slate-400 py-2">No delivery addresses saved yet.</p>
//             ) : (
//               addresses.map((addr) => (
//                 <div
//                   key={addr._id}
//                   className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 flex items-start justify-between gap-3 text-xs"
//                 >
//                   <div className="space-y-1 min-w-0">
//                     <div className="flex items-center gap-2">
//                       <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] bg-slate-200/60 px-2 py-0.5 rounded-md">
//                         {addr.label || "Address"}
//                       </span>
//                       {addr.isDefault && (
//                         <span className="text-emerald-700 font-semibold text-[10px]">
//                           Default
//                         </span>
//                       )}
//                     </div>
//                     <p className="text-slate-600 leading-snug">{addr.line1}</p>
//                     <p className="text-slate-500">
//                       {addr.city}, {addr.state} - {addr.pincode}
//                     </p>
//                   </div>

//                   <button
//                     onClick={() => handleDeleteAddress(addr._id)}
//                     className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
//                     title="Delete address"
//                   >
//                     <Trash2 className="w-3.5 h-3.5" />
//                   </button>
//                 </div>
//               ))
//             )}
//           </div>

//           {/* Add Address Sub-form */}
//           <form
//             onSubmit={handleAddAddress}
//             className="pt-4 border-t border-slate-100 space-y-3"
//           >
//             <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
//               Add New Address
//             </p>

//             <input
//               placeholder="Address Label (e.g. Home, Work)"
//               value={newAddress.label}
//               onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
//               className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//             />

//             <input
//               required
//               placeholder="Street address line"
//               value={newAddress.line1}
//               onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
//               className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//             />

//             <div className="grid grid-cols-3 gap-2">
//               <input
//                 required
//                 placeholder="City"
//                 value={newAddress.city}
//                 onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
//                 className="bg-slate-50 text-slate-800 text-xs rounded-xl px-2.5 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//               />
//               <input
//                 required
//                 placeholder="State"
//                 value={newAddress.state}
//                 onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
//                 className="bg-slate-50 text-slate-800 text-xs rounded-xl px-2.5 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//               />
//               <input
//                 required
//                 placeholder="Pincode"
//                 value={newAddress.pincode}
//                 onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
//                 className="bg-slate-50 text-slate-800 text-xs rounded-xl px-2.5 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={addingAddress}
//               className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
//             >
//               <Plus className="w-3.5 h-3.5" />
//               {addingAddress ? "Saving Address..." : "Add Address"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;



import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // <-- Added Link for navigation
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Check,
  Shield,
  Home,
  Briefcase,
  LifeBuoy, // <-- Added LifeBuoy icon
  ChevronRight, // <-- Added ChevronRight icon
  ShoppingBag,
  Heart,
} from "lucide-react";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    label: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [profileMsg, setProfileMsg] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);

  useEffect(() => {
    axiosInstance
      .get("/users/me/addresses")
      .then(({ data }) => setAddresses(data.addresses || []))
      .catch(console.error);
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg("");
    try {
      const { data } = await axiosInstance.patch("/users/me", { name, phone });
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      setProfileMsg("Profile updated successfully!");
      setTimeout(() => setProfileMsg(""), 3000);
    } catch (err) {
      setProfileMsg("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddingAddress(true);
    try {
      const { data } = await axiosInstance.post("/users/me/addresses", newAddress);
      setAddresses(data.addresses || []);
      setNewAddress({ label: "", line1: "", city: "", state: "", pincode: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setAddingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const { data } = await axiosInstance.delete(`/users/me/addresses/${id}`);
      setAddresses(data.addresses || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center text-2xl font-bold uppercase shadow-md shadow-slate-900/10 shrink-0">
          {user?.name ? user.name.charAt(0) : "U"}
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 capitalize">
              {user?.role || "Customer"}
            </span>
          </div>
          <p className="text-sm text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            {user?.email}
          </p>
        </div>
      </div>

      {/* Quick Navigation / Support Tickets Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/orders"
          className="bg-white border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between hover:border-emerald-500 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">My Orders</h3>
              <p className="text-[11px] text-slate-500">View order status</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
        </Link>

        <Link
          to="/wishlist"
          className="bg-white border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between hover:border-emerald-500 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Wishlist</h3>
              <p className="text-[11px] text-slate-500">Saved items</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
        </Link>

        {/* CUSTOMER SUPPORT TICKETS CARD */}
        <Link
          to="/dashboard/tickets"
          className="bg-white border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between hover:border-emerald-500 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Support Tickets</h3>
              <p className="text-[11px] text-slate-500">View history & replies</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Card 1: Edit Profile Details */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Personal Details</h2>
          </div>

          {profileMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{profileMsg}</span>
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 text-sm rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 text-sm rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  disabled
                  value={user?.email || ""}
                  className="w-full bg-slate-100 text-slate-500 text-sm rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Email cannot be modified.</p>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Card 2: Saved Delivery Addresses */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Saved Addresses</h2>
          </div>

          {/* List of existing addresses */}
          <div className="space-y-3">
            {addresses.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No delivery addresses saved yet.</p>
            ) : (
              addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] bg-slate-200/60 px-2 py-0.5 rounded-md">
                        {addr.label || "Address"}
                      </span>
                      {addr.isDefault && (
                        <span className="text-emerald-700 font-semibold text-[10px]">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 leading-snug">{addr.line1}</p>
                    <p className="text-slate-500">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteAddress(addr._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                    title="Delete address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Address Sub-form */}
          <form
            onSubmit={handleAddAddress}
            className="pt-4 border-t border-slate-100 space-y-3"
          >
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Add New Address
            </p>

            <input
              placeholder="Address Label (e.g. Home, Work)"
              value={newAddress.label}
              onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
              className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <input
              required
              placeholder="Street address line"
              value={newAddress.line1}
              onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
              className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <div className="grid grid-cols-3 gap-2">
              <input
                required
                placeholder="City"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="bg-slate-50 text-slate-800 text-xs rounded-xl px-2.5 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                required
                placeholder="State"
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="bg-slate-50 text-slate-800 text-xs rounded-xl px-2.5 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                required
                placeholder="Pincode"
                value={newAddress.pincode}
                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                className="bg-slate-50 text-slate-800 text-xs rounded-xl px-2.5 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={addingAddress}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              {addingAddress ? "Saving Address..." : "Add Address"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;