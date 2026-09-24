import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2, HardHat } from "lucide-react";
import axios from "axios";
import { usePortal } from "../context/PortalContext";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";

export default function PortalAIChatWidget() {
  const portalContext = usePortal();
  const project = portalContext?.project;
  
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Initialize Greeting
  useEffect(() => {
    if (messages.length === 0) {
      if (project) {
        setMessages([
          { 
            role: "assistant", 
            content: `Hello! I am your **ConstructONS AI Project Advisor** for **${project.title}**. Ask me about your current stage, completion forecast, approvals, or quality checks!` 
          }
        ]);
      } else {
        setMessages([
          { 
            role: "assistant", 
            content: "Namaste! 🙏 I am your **ConstructONS AI Advisor**. Ask me any question about your home construction process, materials, or timelines!" 
          }
        ]);
      }
    }
  }, [project, messages.length]);

  useEffect(() => {
    if (open) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    const newHistory = [...messages, { role: "user", content: userMsg }];
    setMessages(newHistory);
    setLoading(true);

    try {
      // If project exists, use portal chat with live context; otherwise use public chat
      const endpoint = project ? `${API_BASE}/ai/chat/portal` : `${API_BASE}/ai/chat/public`;
      
      const res = await axios.post(endpoint, {
        message: userMsg,
        history: newHistory.map(m => ({ role: m.role, content: m.content }))
      }, { withCredentials: true });
      
      setMessages([...newHistory, { role: "assistant", content: res.data.reply }]);
    } catch {
      setMessages([...newHistory, { role: "assistant", content: "I encountered an issue retrieving data. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ALWAYS VISIBLE FLOATING ROBOT BUTTON ON BOTTOM RIGHT OF PORTAL
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 font-['Poppins']">
      
      {/* Construction Robot AI Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-[#000F1B] hover:bg-[#FF5A00] text-white h-14 px-4 rounded-full shadow-[0_8px_30px_rgba(0,15,27,0.4)] flex items-center gap-3 transition-all duration-300 hover:scale-105 border-2 border-[#FF5A00] group"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-[#FF5A00] grid place-items-center shrink-0 shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#000F1B] animate-pulse" />
          </div>
          {/* <div className="text-left hidden sm:block">
            <div className="text-[11px] font-black uppercase tracking-wider text-white flex items-center gap-1 leading-tight">
              AI 
            </div>

          </div> */}
        </button>
      )}

      {/* Robot Chat Window */}
      {open && (
        <div className="bg-white rounded-3xl shadow-2xl border border-black/10 w-[calc(100vw-32px)] sm:w-[400px] h-[540px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 origin-bottom-right">
          
          {/* Header */}
          <div className="bg-[#000F1B] p-4 text-white flex items-center justify-between shrink-0 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF5A00] grid place-items-center shrink-0 shadow-md">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  ConstructONS AI Advisor <HardHat className="w-3.5 h-3.5 text-[#FF5A00]" />
                </div>
                <div className="text-[10px] text-white/60 truncate max-w-[200px]">
                  {project ? `Linked: ${project.project_code || project.title}` : "General Construction Guide"}
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center transition">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Chat Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8F9FA] text-xs leading-relaxed">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl ${
                  m.role === "user"
                    ? "bg-[#000F1B] text-white font-medium rounded-br-none"
                    : "bg-white text-[#000F1B] border border-black/10 shadow-sm rounded-bl-none"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl border border-black/10 shadow-sm flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin text-[#FF5A00]" /> Analyzing live construction records...
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
              placeholder="Ask about stage, completion, approvals..."
              className="flex-1 px-4 py-3 bg-[#F5F6F8] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A00]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-11 h-11 rounded-xl bg-[#000F1B] hover:bg-[#FF5A00] text-white grid place-items-center transition disabled:opacity-50 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}