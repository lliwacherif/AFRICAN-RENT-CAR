import { useText } from '../../context/LanguageContext'
import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Phone, 
  Compass, 
  ShieldCheck, 
  Loader2,
  Volume2
} from 'lucide-react';

interface AIConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIConciergeModal: React.FC<AIConciergeModalProps> = ({ isOpen, onClose }) => {
  const tr = useText()

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Bonjour et bienvenue chez African Rent Car ! Je suis votre Concierge Voyage dédié en Tunisie. Avez-vous besoin d\'une recommandation pour un véhicule (Porsche, SUV, berline), une villa avec piscine ou un circuit dans le Sud saharien ?',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = query.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || 'Je suis à votre service.' },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Nos équipes au comptoir de Tunis-Carthage et Djerba sont également joignables directement au +216 27 908 060 pour toute question urgente.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Quel véhicule choisir pour un road trip dans le Sud ?",
    "Comment fonctionne la prise en charge à l'aéroport de Tunis ?",
    "Présentez-moi le pack Villa Djerba + SUV",
    "Quelles sont les conditions de caution ?",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#EBE6DC] flex flex-col h-[85vh] sm:h-[650px] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#2C3E56] text-white flex items-center justify-between border-b border-[#1F2C3D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#A84A3B] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-none">
                {tr("Concierge VIP Voyage Tunisie")}
              </h3>
              <p className="text-[11px] text-white/70 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{tr("En direct • African Rent Car")}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FFFFF0]/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.role === 'user'
                    ? 'bg-[#A84A3B] text-white'
                    : 'bg-[#2C3E56] text-white'
                }`}
              >
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl max-w-[80%] text-xs sm:text-sm leading-relaxed shadow-sm ${
                  m.role === 'user'
                    ? 'bg-[#A84A3B] text-white rounded-tr-none'
                    : 'bg-white text-[#191C1F] border border-[#EBE6DC] rounded-tl-none'
                }`}
              >
                {tr(m.content)}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#727D88] p-2 bg-white/80 rounded-xl w-max border border-[#EBE6DC]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#A84A3B]" />
              <span>{tr("Le Concierge rédige sa réponse personnalisée...")}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt suggestions */}
        <div className="p-2.5 bg-white border-t border-[#EBE6DC] overflow-x-auto flex items-center gap-1.5 scrollbar-none">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 bg-[#F8F7EE] hover:bg-[#EBE6DC] text-[#2C3E56] text-[11px] font-semibold rounded-lg whitespace-nowrap border border-[#EBE6DC] transition-colors"
            >
              {tr(prompt)}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#EBE6DC]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={tr("Posez votre question sur nos véhicules ou séjours...")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-[#F8F7EE] border border-[#EBE6DC] rounded-xl text-xs sm:text-sm text-[#191C1F] focus:outline-none focus:border-[#A84A3B]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-[#A84A3B] hover:bg-[#8A372A] disabled:opacity-40 text-white rounded-xl shadow-md transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
