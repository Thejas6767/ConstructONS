import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { X, Send, Loader2,  Bot } from "lucide-react";
import axios from "axios";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";

export default function PublicAIChat() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Namaste! 🙏 I'm **ConstructONS AI Assist**. Ask me anything about home construction packages, process, Vastu, or material standards!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Hide on Portal and Admin pages
  if (location.pathname.startsWith("/portal") || location.pathname.startsWith("/admin")) {
    return null;
  }

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    const newHistory = [...messages, { role: "user", content: userMsg }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/ai/chat/public`, {
        message: userMsg,
        history: newHistory.map(m => ({ role: m.role, content: m.content }))
      });
      
      setMessages([...newHistory, { role: "assistant", content: res.data.reply }]);
    } catch {
      setMessages([...newHistory, { role: "assistant", content: "I'm having trouble connecting right now. Feel free to explore our Packages or reach out via the Contact page!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    // FIX: Stacked neatly on BOTTOM RIGHT above Call (bottom-20) & WhatsApp (bottom-6)
    <div className={`fixed right-4 md:right-6 z-50 font-['Poppins'] ${open ? "bottom-6" : "bottom-[148px] md:bottom-[160px]"}`}>
      
      {/* Floating AI Button (Top of Stack) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-[#FF5A00] hover:bg-[#FF2D00] text-white h-12 px-4 rounded-full shadow-lg shadow-[#FF5A00]/30 flex items-center gap-2 transition-all duration-300 hover:scale-105"
        >
        
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Ask AI</span>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="bg-white rounded-3xl shadow-2xl border border-black/10 w-[calc(100vw-32px)] sm:w-[380px] h-[520px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 origin-bottom-right">
          
          {/* Header */}
          <div className="bg-[#000F1B] p-4 text-white flex items-center justify-between shrink-0 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF5A00] grid place-items-center shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  ConstructONS AI
                </div>
                <div className="text-[10px] text-white/60">Everything Construction. Always On.</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center transition">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8F9FA] text-xs leading-relaxed">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl ${
                  m.role === "user"
                    ? "bg-[#000F1B] text-white rounded-br-none font-medium"
                    : "bg-white text-[#111111] border border-black/5 shadow-sm rounded-bl-none"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl border border-black/5 shadow-sm flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin text-[#FF5A00]" /> Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={send} className="p-3 bg-white border-t border-black/5 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about packages, pricing, Vastu..."
              className="flex-1 px-3.5 py-2.5 bg-[#F5F6F8] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A00]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-[#000F1B] hover:bg-[#FF5A00] text-white grid place-items-center transition disabled:opacity-50 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}