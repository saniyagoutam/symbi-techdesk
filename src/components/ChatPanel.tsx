import { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useChat } from "@/hooks/useChat";
import { motion } from "framer-motion";
import { Bot, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatPanel() {
  const { messages, isLoading, send, clearChat } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Symbi Techdesk" className="w-10 h-10 rounded-xl object-cover" />
          <div>
            <h1 className="font-semibold text-foreground text-lg">
              Symbi Techdesk
            </h1>
            <p className="text-xs text-muted-foreground">
              AI-powered assistant
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat}>
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
          <a href="/admin" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Admin
          </a>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
              <Bot className="w-8 h-8 text-accent-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Welcome to Symbi Techdesk
              </h2>
              <p className="text-muted-foreground text-sm max-w-md">
                I can answer questions based on the university's official documents. Ask me anything!
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 max-w-lg justify-center">
              {[
                "How do I register for courses?",
                "What scholarships are available?",
                "Where is the library?",
                "How to reset my student email?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="px-3 py-2 text-xs rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 items-center"
          >
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <Bot className="w-4 h-4 text-accent-foreground" />
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-muted-foreground"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">Thinking...</span>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={send} disabled={isLoading} />
    </div>
  );
}
