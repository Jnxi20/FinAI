'use client';

import { Download } from 'lucide-react';

interface Message {
    role: string;
    content: string;
    createdAt: Date;
}

interface DownloadChatButtonProps {
    userName: string;
    messages: Message[];
}

export function DownloadChatButton({ userName, messages }: DownloadChatButtonProps) {
    const handleDownload = () => {
        if (!messages || messages.length === 0) {
            alert('No hay mensajes para descargar.');
            return;
        }

        const formattedContent = messages.map(m => {
            const role = m.role === 'user' ? '👤 Usuario' : '🤖 FinAI';
            const date = new Date(m.createdAt).toLocaleString();
            return `[${date}] ${role}:\n${m.content}\n\n${'-'.repeat(50)}\n`;
        }).join('\n');

        const blob = new Blob([formattedContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat_history_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={handleDownload}
            className="p-2 text-gray-400 hover:text-indigo-400 transition-colors"
            title="Descargar Historial"
        >
            <Download size={18} />
        </button>
    );
}
