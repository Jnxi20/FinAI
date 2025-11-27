import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DownloadChatButton } from "@/components/admin/DownloadChatButton";
import { ChatViewerModal } from "@/components/admin/ChatViewerModal";

export default async function AdminPage() {
    const session = await getServerSession(authOptions);

    // Basic protection: Check if logged in and matches ADMIN_EMAIL
    // In a real app, check for role === 'ADMIN'
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!session || !session.user?.email || (adminEmail && session.user.email !== adminEmail)) {
        redirect("/"); // Redirect to home if not admin
    }

    // Fetch all users and their latest sessions
    const users = await prisma.user.findMany({
        include: {
            financialProfile: true, // Include checklist data
            sessions: {
                orderBy: { updatedAt: 'desc' },
                take: 1,
                include: {
                    messages: {
                        orderBy: { createdAt: 'asc' } // Get all messages in order for download
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const totalUsers = await prisma.user.count();
    const totalSessions = await prisma.chatSession.count();

    return (
        <div className="min-h-screen bg-[#0f1117] text-gray-100 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-indigo-400">Admin Dashboard</h1>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                        <h3 className="text-gray-400 text-sm font-medium uppercase">Total Usuarios</h3>
                        <p className="text-4xl font-bold mt-2">{totalUsers}</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                        <h3 className="text-gray-400 text-sm font-medium uppercase">Total Conversaciones</h3>
                        <p className="text-4xl font-bold mt-2">{totalSessions}</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                        <h3 className="text-gray-400 text-sm font-medium uppercase">Estado del Sistema</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                            <p className="text-xl font-semibold">Operativo</p>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-700">
                        <h2 className="text-xl font-semibold">Usuarios Recientes</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-900/50 text-gray-400 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Usuario</th>
                                    <th className="px-6 py-4 font-medium">Checklist</th>
                                    <th className="px-6 py-4 font-medium">Última Actividad</th>
                                    <th className="px-6 py-4 font-medium">Último Mensaje</th>
                                    <th className="px-6 py-4 font-medium text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {users.map((user) => {
                                    const lastSession = user.sessions[0];
                                    // Get last message for preview (last in the array since we ordered by asc for download)
                                    const lastMessage = lastSession?.messages[lastSession.messages.length - 1];

                                    // Parse Checklist Data
                                    let checklistSummary = "Pendiente";
                                    let checklistColor = "text-gray-500";

                                    if (user.financialProfile?.data) {
                                        try {
                                            const data = JSON.parse(user.financialProfile.data);
                                            // Fix: Check 'tag' property (singular) based on DynamicChecklist logic
                                            // data.answers is an array of objects { tag: string, ... }
                                            const answers = data.answers || [];

                                            const hasDebt = answers.some((a: any) => a.tag === 'deuda_mala' || a.tag === 'deficit');
                                            const hasSavings = answers.some((a: any) => a.tag === 'fondo_emergencia' || a.tag === 'inversor');

                                            if (hasDebt) {
                                                checklistSummary = "🚨 Deuda/Déficit";
                                                checklistColor = "text-red-400";
                                            } else if (!hasSavings) {
                                                checklistSummary = "⚠️ Sin Ahorro";
                                                checklistColor = "text-yellow-400";
                                            } else {
                                                checklistSummary = "✅ Estable/Inversor";
                                                checklistColor = "text-green-400";
                                            }
                                        } catch (e) {
                                            checklistSummary = "Error Datos";
                                        }
                                    }

                                    return (
                                        <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{user.name || 'Sin Nombre'}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </td>
                                            <td className={`px-6 py-4 font-medium ${checklistColor}`}>
                                                {checklistSummary}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-sm">
                                                {lastSession ? new Date(lastSession.updatedAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-sm max-w-xs truncate">
                                                {lastMessage ? (
                                                    <span title={lastMessage.content}>
                                                        {lastMessage.role === 'user' ? '👤 ' : '🤖 '}
                                                        {lastMessage.content}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-600 italic">Sin mensajes</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end items-center">
                                                {lastSession && (
                                                    <>
                                                        <ChatViewerModal
                                                            userName={user.name || 'Usuario'}
                                                            messages={lastSession.messages}
                                                        />
                                                        <DownloadChatButton
                                                            userName={user.name || 'Usuario'}
                                                            messages={lastSession.messages}
                                                        />
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
