'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Check, AlertCircle, ArrowRight } from 'lucide-react';
import checklistData from '../../lib/data/financial-checklist.json';

interface DynamicChecklistProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (summary: string) => void;
}

export default function DynamicChecklist({ isOpen, onClose, onSubmit }: DynamicChecklistProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});

    // Flatten questions to make navigation easier
    const allQuestions = checklistData.checklist_financiero_antigravity.secciones.flatMap(section =>
        section.preguntas.map(pregunta => ({
            ...pregunta,
            categoria: section.categoria
        }))
    );

    const totalSteps = allQuestions.length;
    const currentQuestion = allQuestions[currentStep];

    console.log('DynamicChecklist Render:', {
        currentStep,
        totalSteps,
        hasQuestion: !!currentQuestion,
        isOpen
    });

    const handleOptionSelect = (option: any) => {
        console.log('Option Selected:', option);
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: {
                pregunta: currentQuestion.texto,
                respuesta: option.texto,
                tag: option.tag,
                categoria: currentQuestion.categoria
            }
        }));

        if (currentStep < totalSteps - 1) {
            console.log('Advancing to next step');
            setTimeout(() => setCurrentStep(prev => prev + 1), 300);
        } else {
            console.log('Finished checklist');
        }
    };

    const handleFinish = async () => {
        // Save to Database
        try {
            const payload = {
                answers: Object.values(answers),
                completedAt: new Date().toISOString()
            };

            await fetch('/api/checklist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            console.log('Checklist saved to DB');
        } catch (error) {
            console.error('Error saving checklist:', error);
        }

        // Construct the prompt based on the user's request
        let summary = `[RESULTADOS DEL CHECKLIST FINANCIERO]\n\n`;

        Object.values(answers).forEach((ans: any) => {
            summary += `Categoría: ${ans.categoria}\n`;
            summary += `P: ${ans.pregunta}\n`;
            summary += `R: ${ans.respuesta} (Tag: ${ans.tag})\n\n`;
        });

        summary += `
--------------------------------------------------
INSTRUCCIONES PARA EL ASESOR (IMPORTANTE):
Analiza las respuestas del usuario. Tu misión es trazar un camino financiero.

Reglas de interpretación:
1. Si el usuario elige opciones tipo 'No sé qué es eso' (Tags de educación/concepto):
   DETENTE. No le des un consejo numérico todavía.
   Tu prioridad es EXPLICAR el concepto de forma sencilla (como a un niño de 12 años).
   Ejemplo: Si no sabe qué es el Fondo de Emergencia, explica qué es y por qué es vital antes de decirle cuánto ahorrar.

2. Si el usuario elige opciones negativas (Rojo/Déficit/Deuda):
   Activa el protocolo 'Gravedad Cero'. La recomendación debe ser drástica: cortar gastos y plan de bola de nieve para deudas.

3. Si el usuario elige opciones positivas (Verde/Inversor):
   Activa el protocolo 'Despegue'. Felicítalo y sugiere optimizaciones avanzadas (diversificación, impuestos, interés compuesto).

Salida requerida:
Genera un resumen de 3 párrafos:
1. Diagnóstico: ¿Dónde está parado?
2. La Lección del Día: (Solo si hubo respuestas de 'No sé', explica el concepto más importante que desconoce).
3. Próximo paso: Una única acción concreta para hoy.
`;

        onSubmit(summary);
        onClose();
        // Reset for next time
        setTimeout(() => {
            setCurrentStep(0);
            setAnswers({});
        }, 500);
    };

    if (!isOpen) return null;
    if (!currentQuestion) return null;

    const progress = ((currentStep + 1) / totalSteps) * 100;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
                    <div>
                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                            Checklist Financiero
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                            {currentQuestion.categoria} • Pregunta {currentStep + 1} de {totalSteps}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-slate-800 w-full">
                    <motion.div
                        className="h-full bg-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2 className="text-2xl font-medium text-white mb-8 leading-relaxed">
                                {currentQuestion.texto}
                            </h2>

                            <div className="space-y-3">
                                {currentQuestion.opciones.map((opcion, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(opcion)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all group relative overflow-hidden
                                            ${answers[currentQuestion.id]?.tag === opcion.tag
                                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                                : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-800'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3 relative z-10">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border
                                                ${answers[currentQuestion.id]?.tag === opcion.tag
                                                    ? 'bg-white text-indigo-600 border-white'
                                                    : 'bg-slate-700 border-slate-600 text-slate-400 group-hover:border-indigo-500 group-hover:text-indigo-400'
                                                }
                                            `}>
                                                {opcion.valor}
                                            </div>
                                            <span className="flex-1 font-medium">{opcion.texto}</span>
                                            {answers[currentQuestion.id]?.tag === opcion.tag && (
                                                <Check className="w-5 h-5" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
                    <button
                        onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                        disabled={currentStep === 0}
                        className="text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium px-4 py-2"
                    >
                        Anterior
                    </button>

                    {currentStep === totalSteps - 1 && answers[currentQuestion.id] ? (
                        <button
                            onClick={handleFinish}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
                        >
                            Obtener Diagnóstico
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <div className="text-xs text-slate-500">
                            Selecciona una opción para continuar
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
