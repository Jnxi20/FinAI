'use client';

import { useState } from 'react';
import { X, Check, DollarSign, CreditCard, PiggyBank, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HealthChecklistProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

export default function HealthChecklist({ isOpen, onClose, onSubmit }: HealthChecklistProps) {
    const [step, setStep] = useState(1);
    const [data, setData] = useState({
        income: '',
        expenses: '',
        debt: '',
        savings: '',
        goals: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
        else handleSubmit();
    };

    const handleSubmit = () => {
        onSubmit(data);
        onClose();
        setStep(1); // Reset for next time
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
                >
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Check className="w-5 h-5 text-emerald-500" />
                            Checklist Financiero
                        </h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6">
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-white">Ingresos y Gastos</h3>
                                        <p className="text-sm text-slate-400">¿Cómo es tu flujo de efectivo mensual?</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Ingreso Mensual Neto</label>
                                    <input
                                        name="income"
                                        value={data.income}
                                        onChange={handleChange}
                                        type="number"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Ej: 2500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Gastos Mensuales Totales</label>
                                    <input
                                        name="expenses"
                                        value={data.expenses}
                                        onChange={handleChange}
                                        type="number"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Ej: 1800"
                                    />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-white">Deudas</h3>
                                        <p className="text-sm text-slate-400">¿Tienes obligaciones pendientes?</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Total de Deudas (Tarjetas, Préstamos)</label>
                                    <input
                                        name="debt"
                                        value={data.debt}
                                        onChange={handleChange}
                                        type="number"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Ej: 5000"
                                    />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <PiggyBank className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-white">Ahorros e Inversiones</h3>
                                        <p className="text-sm text-slate-400">¿Con qué respaldo cuentas?</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Ahorros Totales / Fondo de Emergencia</label>
                                    <input
                                        name="savings"
                                        value={data.savings}
                                        onChange={handleChange}
                                        type="number"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Ej: 10000"
                                    />
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-white">Objetivos</h3>
                                        <p className="text-sm text-slate-400">¿Qué quieres lograr?</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Tu principal meta financiera</label>
                                    <textarea
                                        name="goals"
                                        value={data.goals}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                                        placeholder="Ej: Comprar una casa en 5 años, Retirarme joven..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-slate-800 flex justify-between bg-slate-900/50">
                        <button
                            onClick={() => step > 1 && setStep(step - 1)}
                            className={`text-slate-400 hover:text-white px-4 py-2 ${step === 1 ? 'invisible' : ''}`}
                        >
                            Atrás
                        </button>
                        <button
                            onClick={handleNext}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            {step === 4 ? 'Finalizar' : 'Siguiente'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
