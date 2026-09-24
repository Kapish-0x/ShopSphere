import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { MessageSquare, Clock, AlertCircle, CheckCircle2, ChevronRight, Send, LifeBuoy } from "lucide-react";

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // Fetch all tickets owned by this customer
  const fetchMyTickets = async () => {
    try {
      const res = await axiosInstance.get("/support", getAuthHeader());
      const fetched = res.data.tickets || [];
      setTickets(fetched);
    } catch (err) {
      console.error("Could not load your support tickets", err);
    } finally {
      setLoading(false);
    }
  };

  // Load single ticket detail with messages
  const loadTicketDetails = async (ticketId) => {
    try {
      const res = await axiosInstance.get(`/support/${ticketId}`, getAuthHeader());
      setSelectedTicket(res.data.ticket);
    } catch (err) {
      console.error("Could not fetch ticket conversation", err);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setSending(true);
    try {
      await axiosInstance.post(
        `/support/${selectedTicket._id}/messages`,
        { text: replyText.trim() },
        getAuthHeader()
      );

      setReplyText("");
      await loadTicketDetails(selectedTicket._id);
      fetchMyTickets();
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">Open</span>;
      case "in_progress":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">In Progress</span>;
      case "resolved":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Resolved</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">Closed</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Loading support history...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">My Support Tickets</h1>
            <p className="text-xs text-slate-500">Track and reply to support inquiries</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Ticket List */}
        <div className="md:col-span-5 space-y-3">
          {tickets.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">No support tickets found</p>
              <p className="text-[11px] text-slate-400">
                You can create a ticket anytime using the support widget at the bottom right.
              </p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket._id}
                onClick={() => loadTicketDetails(ticket._id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                  selectedTicket?._id === ticket._id
                    ? "border-emerald-500 shadow-sm ring-1 ring-emerald-500/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    #{ticket._id.slice(-6)}
                  </span>
                  {getStatusBadge(ticket.status)}
                </div>
                <h3 className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">
                  {ticket.subject}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="capitalize">{ticket.category?.replace("_", " ")}</span>
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Conversation View */}
        <div className="md:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col min-h-[480px]">
          {selectedTicket ? (
            <>
              {/* Ticket Top Info */}
              <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-emerald-600">
                      #{selectedTicket._id}
                    </span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs font-medium text-slate-500 capitalize">
                      {selectedTicket.category?.replace("_", " ")}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 mt-0.5">
                    {selectedTicket.subject}
                  </h2>
                </div>
                <div>{getStatusBadge(selectedTicket.status)}</div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
                {selectedTicket.messages?.map((msg, idx) => {
                  const isAgent = msg.sender?.role === "support" || msg.sender?.role === "admin";
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl text-xs max-w-[88%] ${
                        isAgent
                          ? "bg-slate-100 text-slate-800 mr-auto border border-slate-200"
                          : "bg-emerald-600 text-white ml-auto"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1 text-[10px] opacity-80 gap-4">
                        <span className="font-bold">
                          {isAgent ? "Support Agent" : "You"}
                        </span>
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box (disabled if ticket closed) */}
              {selectedTicket.status === "closed" ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 font-medium">
                  This ticket is closed. Open a new ticket if you need further help.
                </div>
              ) : (
                <form onSubmit={handleSendReply} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                  <button
                    type="submit"
                    disabled={sending || !replyText.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {sending ? "Sending..." : "Reply"}
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center p-6">
              <MessageSquare className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-xs font-medium">Select a ticket to view the conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTickets;