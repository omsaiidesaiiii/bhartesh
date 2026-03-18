"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AIChat } from "@/components/ai/ai-chat";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Constraints Container */}
      <div 
        ref={constraintsRef} 
        className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      >
        <motion.div
          drag
          dragConstraints={constraintsRef}
          dragMomentum={false}
          dragElastic={0.1}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => {
            // Delay resetting dragging state to prevent accidental clicks
            setTimeout(() => setIsDragging(false), 100);
          }}
          className="absolute bottom-6 right-6 pointer-events-auto cursor-grab active:cursor-grabbing select-none"
          initial={{ scale: 0, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="relative group">
            {/* Animated Glow Effect */}
            <div className="absolute -inset-2 bg-blue-200/40 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 bg-blue-200/20 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
            
            <Button
              onClick={() => {
                if (!isDragging) setIsOpen(true);
              }}
              className="relative h-16 w-16 rounded-full p-0 shadow-2xl shadow-blue-200/50 bg-white dark:bg-zinc-950 border-0 overflow-hidden ring-1 ring-black/5 dark:ring-white/10"
              size="icon"
            >
              <Image
                src="/cms.png"
                alt="AI Assistant"
                width={64}
                height={64}
                className="rounded-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
            
            {/* Status Indicator */}
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500 border-2 border-white dark:border-zinc-950 shadow-sm"></span>
            </div>
          </div>
        </motion.div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl h-[650px] p-0 overflow-hidden border-none bg-transparent shadow-none [&>button]:hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            className="w-full h-full flex flex-col bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-zinc-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden"
          >
            <div className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-4">
                <div className="relative group/icon">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 transition-transform group-hover/icon:rotate-6">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white dark:border-zinc-900 ring-2 ring-green-500/20" />
                </div>
                <div>
                  <DialogTitle className="font-bold text-xl leading-none tracking-tight text-zinc-900 dark:text-zinc-50">
                    Campus AI Assistant
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Chat with our AI assistant for help with the Campus Management System.
                  </DialogDescription>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">Powered by Gemini</p>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 h-10 w-10 transition-colors"
                aria-label="Close Chat"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <AIChat />
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}