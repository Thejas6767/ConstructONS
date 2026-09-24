import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2 } from "lucide-react";
import axios from "axios";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";

export default function PortalProjectAdvisorModal({ project, onClose }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hello! I'm your **ConstructONS Project Advisor** for **${project.title}**. I have live access to your construction progress, pending approvals, quality checks, and forecast completion. What can I help you with today?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    const newHistory = [...messages, { role: "user", content: userMsg }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/ai/chat/portal`, {
        message: userMsg,
        history: newHistory.map(m => ({ role: m.role, content: m.content }))
      }, { withCredentials: true });
      
      setMessages([...newHistory, { role: "assistant", content: res.data.reply }]);
    } catch (err) {
      setMessages([...newHistory, { role: "assistant", content: "I encountered an error accessing your live project data. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#000F1B]/80 backdrop-blur-sm z-[70] grid place-items-center p-4 font-['Poppins']">
      <div className="bg-white rounded-3xl w-full max-w-xl h-[600px] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#000F1B] p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5A00] grid place-items-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-1.5">
                ConstructONS Project Advisor 
              </div>
              <div className="text-xs text-white/60">Linked to Project: {project.project_code || project.title}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8F9FA] text-xs leading-relaxed">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] p-3.5 rounded-2xl ${
                m.role === "user"
                  ? "bg-[#FF5A00] text-white font-medium rounded-br-none"
                  : "bg-white text-[#000F1B] border border-black/10 shadow-sm rounded-bl-none"
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl border border-black/10 shadow-sm flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin text-[#FF5A00]" /> Analyzing live project data...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Form */}
        <form onSubmit={send} className="p-3 bg-white border-t border-black/5 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about your project stage, approvals, timeline..."
            className="flex-1 px-4 py-3 bg-[#F5F6F8] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A00]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-xl bg-[#000F1B] hover:bg-[#FF5A00] text-white grid place-items-center transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}