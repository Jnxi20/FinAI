'use client';

import { useState } from 'react';
import { Eye, X, User, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    role: string;
    content: string;
    createdAt: Date;
}

interface ChatViewerModalProps {
    userName: string;
    messages: Message[];
}

export function ChatViewerModal({ userName, messages }: ChatViewerModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!messages || messages.length === 0) return null;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-gray-400 hover:text-indigo-400 transition-colors mr-2"
                title="Ver Conversación"
            >
                <Eye size={18} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-3xl bg-[#0f1117] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#1a1d24]">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">
                                        Chat con {userName}
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        {messages.length} mensajes • {new Date(messages[messages.length - 1].createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0f1117]">
                                {messages.map((m, idx) => (
                                    <div key={idx} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${m.role === 'user' ? 'bg-gray-700' : 'border border-gray-700/50'
                                            }`}>
                                            {m.role === 'user' ? <User size={16} className="text-gray-300" /> : <Bot size={16} className="text-indigo-400" />}
                                        </div>

                                        <div className={`flex-1 max-w-[85%] ${m.role === 'user' ? 'text-right' : ''}`}>
                                            <div className={`text-xs font-medium mb-1 ${m.role === 'user' ? 'text-gray-500' : 'text-indigo-500'}`}>
                                                {m.role === 'user' ? 'Usuario' : 'FinAI'} • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className={`text-sm leading-relaxed whitespace-pre-wrap rounded-2xl px-5 py-3 inline-block text-left ${m.role === 'user'
                                                    ? 'bg-gray-800 text-gray-200'
                                                    : 'text-gray-300'
                                                }`}>
                                                {m.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
