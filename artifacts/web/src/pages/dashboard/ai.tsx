import { useState, useRef, useEffect } from 'react';
import { useGetInsights } from '@workspace/api-client-react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from '../../lib/animations';
import { Sparkles, Send, Bot, User, BrainCircuit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  isInsight?: boolean;
}

export default function AIChat() {
  const { user } = useRequireAuth();
  const { data: insights } = useGetInsights();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize with insights
  useEffect(() => {
    if (insights && messages.length === 0) {
      const initialMessages: Message[] = [
        {
          id: 'welcome',
          role: 'ai',
          content: `Welcome, ${user?.fullName?.split(' ')[0] || 'User'}. I am Nabeh, your financial intelligence. I've analyzed your recent patterns.`
        }
      ];

      insights.forEach((insight, idx) => {
        initialMessages.push({
          id: `insight-${idx}`,
          role: 'ai',
          content: `**${insight.title}**: ${insight.message}`,
          isInsight: true
        });
      });

      setMessages(initialMessages);
    }
  }, [insights, user, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "I've logged that request. As an AI in this demo environment, my capabilities are simulated, but my intent to optimize your wealth is real."
      }]);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] max-w-4xl mx-auto"
      >
        <header className="mb-6 flex items-center gap-3 border-b border-border pb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Nabeh Intelligence</h1>
            <p className="text-muted-foreground text-xs uppercase tracking-widest">Active session</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-4 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  msg.role === 'ai' 
                    ? 'bg-black border border-primary/50 shadow-[0_0_10px_rgba(212,175,55,0.2)]' 
                    : 'bg-white/10'
                }`}>
                  {msg.role === 'ai' ? <Sparkles className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-muted-foreground" />}
                </div>
                
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === 'user' 
                    ? 'bg-white/10 text-white rounded-tr-sm' 
                    : msg.isInsight
                      ? 'bg-primary/5 border border-primary/20 text-primary-foreground rounded-tl-sm glass'
                      : 'bg-black/60 border border-border text-white rounded-tl-sm'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content.split('**').map((part, i) => 
                      i % 2 === 1 ? <strong key={i} className={msg.isInsight ? 'text-primary' : 'text-white'}>{part}</strong> : part
                    )}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-black border border-primary/50 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-black/60 border border-border rounded-2xl rounded-tl-sm p-4 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="pt-4 border-t border-border mt-auto relative">
          <form onSubmit={handleSend} className="relative flex items-center">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Nabeh for financial analysis..."
              className="pr-12 h-14 bg-black/40 border-primary/20 focus:border-primary/50 rounded-xl text-base"
            />
            <Button 
              type="submit" 
              size="icon"
              variant="ghost"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 text-primary hover:bg-primary/20 hover:text-primary rounded-lg"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
