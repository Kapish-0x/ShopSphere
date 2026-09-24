import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance"; // Import your configured axios instance
import { LifeBuoy, Search, Clock, AlertCircle, MessageSquare, User, Send } from "lucide-react";

const SupportDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);

  const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const loadTicketDetails = async (ticketId) => {
    try {
      const res = await axiosInstance.get(`/support/${ticketId}`, getAuthHeader());
      setSelectedTicket(res.data.ticket);
    } catch (err) {
      console.error("Could not fetch details", err);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await axiosInstance.get("/support", getAuthHeader());
      const fetched = res.data.tickets || [];
      setTickets(fetched);
      if (fetched.length > 0 && !selectedTicket) {
        loadTicketDetails(fetched[0]._id);
      }
    } catch (err) {
      console.error("Could not fetch support tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    try {
      await axiosInstance.post(
        `/support/${selectedTicket._id}/messages`,
        { text: replyText.trim() },
        getAuthHeader()
      );

      setReplyText("");
      await loadTicketDetails(selectedTicket._id);
      fetchTickets();
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      await axiosInstance.patch(
        `/support/${selectedTicket._id}/status`,
        { status: newStatus },
        getAuthHeader()
      );

      await loadTicketDetails(selectedTicket._id);
      fetchTickets();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesFilter = filterStatus === "all" ? true : t.status === filterStatus;
    const matchesSearch =
      t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t._id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Support Operations</h1>
            <p className="text-xs text-slate-500">Live MongoDB Ticket Queue</p>
          </div>
        </div>

        <div className="hidden md:flex gap-3">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Open</p>
              <p className="text-sm font-bold text-slate-800">
                {tickets.filter((t) => t.status === "open").length}
              </p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">In Progress</p>
              <p className="text-sm font-bold text-slate-800">
                {tickets.filter((t) => t.status === "in_progress").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-4 flex flex-col h-[700px]">
          <div className="space-y-3 mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search subject, customer, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
              {["all", "open", "in_progress", "resolved", "closed"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl font-medium capitalize whitespace-nowrap transition-colors ${
                    filterStatus === st
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {loading ? (
              <p className="text-center text-xs text-slate-400 py-12">Loading tickets...</p>
            ) : filteredTickets.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-12">No matching tickets.</p>
            ) : (
              filteredTickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => loadTicketDetails(t._id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedTicket?._id === t._id
                      ? "border-emerald-500 bg-emerald-50/30 shadow-sm"
                      : "border-slate-100 hover:border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-emerald-600 font-mono">
                      #{t._id.slice(-6)}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        t.status === "open"
                          ? "bg-amber-100 text-amber-700"
                          : t.status === "in_progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{t.subject}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{t.customer?.name || "Customer"}</span>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Chat View */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col h-[700px]">
          {selectedTicket ? (
            <>
              <div className="border-b border-slate-100 pb-4 mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-600 font-mono">
                      #{selectedTicket._id}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold capitalize text-slate-500">
                      {selectedTicket.category?.replace("_", " ")}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1">
                    {selectedTicket.subject}
                  </h2>
                </div>

                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
                >
                  <option value="open">Status: Open</option>
                  <option value="in_progress">Status: In Progress</option>
                  <option value="resolved">Status: Resolved</option>
                  <option value="closed">Status: Closed</option>
                </select>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 mb-4 flex items-center gap-2 text-xs text-slate-600">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-800">
                  {selectedTicket.customer?.name || "Customer"}
                </span>
                <span className="text-slate-400">({selectedTicket.customer?.email})</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                {selectedTicket.messages?.map((msg, idx) => {
                  const isCustomer = msg.sender?._id === selectedTicket.customer?._id;
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl max-w-[85%] text-xs ${
                        isCustomer
                          ? "bg-slate-100 text-slate-800"
                          : "ml-auto bg-emerald-600 text-white"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1 text-[10px] opacity-80">
                        <span className="font-bold">{msg.sender?.name || "User"}</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSendReply} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type message to customer..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MessageSquare className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-xs">Select a support ticket to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;