import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ChatInterface from "@/components/chat/ChatInterface";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="h-screen bg-slate-950 flex flex-col">
            <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm">
                <div className="font-semibold text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Asesor Financiero
                </div>
                <div className="text-sm text-slate-400">
                    Hola, <span className="text-white font-medium">{session.user?.name || 'Usuario'}</span>
                </div>
            </header>

            <main className="flex-1 overflow-hidden">
                <ChatInterface />
            </main>
        </div>
    );
}
