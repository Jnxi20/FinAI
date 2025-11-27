'use client';

import { useState } from 'react';

export default function TestChat() {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/test-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMessage] }),
            });

            if (!response.ok) throw new Error(response.statusText);

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader available');

            const aiMessage = { role: 'assistant', content: '' };
            setMessages(prev => [...prev, aiMessage]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = new TextDecoder().decode(value);
                aiMessage.content += text;

                // Force update to show streaming
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { ...aiMessage };
                    return newMessages;
                });
            }
        } catch (err: any) {
            console.error('Fetch error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
            {error && (
                <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded shadow-lg">
                    Error: {error}
                </div>
            )}

            {messages.map((m, i) => (
                <div key={i} className="whitespace-pre-wrap mb-4">
                    <strong>{m.role === 'user' ? 'User: ' : 'AI: '}</strong>
                    {m.content}
                </div>
            ))}

            {isLoading && <div className="text-gray-500">AI is thinking...</div>}

            <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-md mb-8 flex gap-2">
                <input
                    className="flex-1 p-2 border border-gray-300 rounded shadow-xl text-black bg-white"
                    value={input}
                    placeholder="Say something..."
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="p-2 bg-blue-500 text-white rounded shadow-xl disabled:bg-gray-400"
                    disabled={isLoading || !input.trim()}
                >
                    Send
                </button>
            </form>
        </div>
    );
}
