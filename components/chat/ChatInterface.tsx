'use client';

import { Send, Paperclip, Bot, User, Loader2, Check } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import DocumentUpload from '../financial/DocumentUpload';
import DynamicChecklist from '../financial/DynamicChecklist';
import { TypewriterMessage } from '../ui/TypewriterMessage';

export default function ChatInterface() {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isChecklistOpen, setIsChecklistOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [hasWelcomed, setHasWelcomed] = useState(false);

    useEffect(() => {
        if (!hasWelcomed && messages.length === 0) {
            setHasWelcomed(true);
        }
    }, [hasWelcomed, messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const sendMessage = async (messagePayload: { role: string, content: string, data?: any }) => {
        const userMsgId = Date.now().toString();
        const userMsg = {
            ...messagePayload,
            id: userMsgId
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            // Prepare history for API (exclude id and data for clean payload if needed, though backend likely ignores extra fields)
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const newMsgForApi = { role: messagePayload.role, content: messagePayload.content };

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...history, newMsgForApi] }),
            });

            if (!response.ok) throw new Error(response.statusText);

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader available');

            const aiMsgId = (Date.now() + 1).toString();
            const aiMessage = { role: 'assistant', content: '', id: aiMsgId };
            setMessages(prev => [...prev, aiMessage]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const text = new TextDecoder().decode(value);

                setMessages(prev => prev.map(m =>
                    m.id === aiMsgId
                        ? { ...m, content: m.content + text }
                        : m
                ));
            }
        } catch (error) {
            console.error('Chat error:', error);
            // Optionally add an error message to the chat
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const currentInput = input;
        setInput(''); // Clear input immediately
        await sendMessage({ role: 'user', content: currentInput });
    };

    const handleChecklistSubmit = (summary: string) => {
        sendMessage({
            role: 'user',
            content: summary,
            data: { isHidden: true }
        });
    };

    const handleDocumentUpload = (content: string, fileName: string) => {
        const message = `
[DOCUMENTO ADJUNTO: ${fileName}]
-------------------
${content}
-------------------
Por favor analiza este documento y extrae la información financiera relevante para mi diagnóstico.
    `;

        sendMessage({
            role: 'user',
            content: message
        });
        setIsUploadOpen(false);
    };

    return (
        <div className="flex flex-col h-full bg-[#0f1117] text-gray-100 font-sans">
            <DocumentUpload
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUpload={handleDocumentUpload}
            />

            <DynamicChecklist
                isOpen={isChecklistOpen}
                onClose={() => setIsChecklistOpen(false)}
                onSubmit={handleChecklistSubmit}
            />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
                    <AnimatePresence initial={false}>
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 opacity-0 animate-in fade-in duration-700">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 ring-1 ring-white/10">
                                    <Bot className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-3xl font-medium text-white tracking-tight">¿En qué te ayudo hoy?</h2>
                            </div>
                        )}
                        {messages.map((m: any, index: number) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`group flex gap-6 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${m.role === 'user' ? 'bg-transparent' : 'bg-transparent'
                                    }`}>
                                    {m.role === 'user' ? (
                                        <div className="w-8 h-8 bg-gray-700 rounded-sm flex items-center justify-center">
                                            <User className="w-5 h-5 text-gray-300" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 border border-gray-700/50 rounded-full flex items-center justify-center">
                                            <Bot className="w-5 h-5 text-indigo-400" />
                                        </div>
                                    )}
                                </div>

                                <div className={`flex-1 max-w-[85%] ${m.role === 'user' ? 'text-right' : ''}`}>
                                    <div className={`text-sm font-medium mb-2 ${m.role === 'user' ? 'text-gray-400' : 'text-indigo-400'}`}>
                                        {m.role === 'user' ? 'Vos' : 'FinAI'}
                                    </div>
                                    <div className={`prose prose-invert prose-p:leading-relaxed prose-pre:bg-gray-900 max-w-none text-[17px] ${m.role === 'user'
                                        ? 'bg-gray-800 text-gray-100 rounded-3xl px-6 py-4 inline-block text-left shadow-sm'
                                        : 'text-gray-100'
                                        }`}>
                                        {m.role === 'user' ? (
                                            <div className="whitespace-pre-wrap">{m.content}</div>
                                        ) : (
                                            <TypewriterMessage
                                                content={m.content}
                                                isStreaming={isLoading && index === messages.length - 1}
                                            />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-6"
                        >
                            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                                <div className="w-8 h-8 border border-gray-700/50 rounded-full flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-indigo-400" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 h-8">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} className="h-12" />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-gradient-to-t from-[#0f1117] via-[#0f1117] to-transparent">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleFormSubmit} className="relative bg-[#1a1d24] border border-gray-700/50 rounded-[26px] shadow-2xl flex items-end p-3 transition-all focus-within:border-gray-600 focus-within:ring-1 focus-within:ring-gray-600/50">
                        <button
                            type="button"
                            onClick={() => setIsUploadOpen(true)}
                            className="p-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors mb-0.5"
                            title="Subir Documento"
                        >
                            <Paperclip className="w-5 h-5" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsChecklistOpen(true)}
                            className="p-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors mb-0.5"
                            title="Checklist"
                        >
                            <Check className="w-5 h-5" />
                        </button>

                        <input
                            className="flex-1 bg-transparent border-none px-4 py-3.5 text-[17px] text-white placeholder-gray-500 focus:outline-none focus:ring-0 max-h-48 overflow-y-auto resize-none"
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Escribí tu mensaje..."
                            disabled={isLoading}
                            autoComplete="off"
                        />

                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className={`p-2.5 m-1 rounded-full transition-all duration-200 ${input.trim()
                                ? 'bg-white text-black hover:bg-gray-200'
                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </form>
                    <div className="text-center mt-4">
                        <span className="text-xs text-gray-500 font-medium">
                            FinAI puede cometer errores. Revisá la información importante.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
