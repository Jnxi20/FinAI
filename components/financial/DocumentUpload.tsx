'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentUploadProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (content: string, fileName: string) => void;
}

export default function DocumentUpload({ isOpen, onClose, onUpload }: DocumentUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isReading, setIsReading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (file: File) => {
        setError(null);
        // Aceptamos imágenes y texto plano por ahora para simplificar la lectura en cliente
        // En una app real, usaríamos un servicio de OCR o parser de PDF en backend
        const validTypes = ['text/plain', 'application/json', 'text/csv', 'image/png', 'image/jpeg', 'image/webp'];

        if (!validTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
            setError('Por ahora solo soportamos archivos de texto (.txt, .csv, .json) o imágenes (.png, .jpg) para análisis visual.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError('El archivo es demasiado grande (máx 5MB).');
            return;
        }

        setFile(file);
    };

    const handleSubmit = async () => {
        if (!file) return;

        setIsReading(true);
        try {
            if (file.type.startsWith('image/')) {
                // Convertir imagen a base64 para enviarla a Gemini (si el SDK lo soporta en el futuro o via texto descriptivo)
                // Nota: Para este MVP, simularemos que leemos la imagen o enviaremos un placeholder si no tenemos OCR.
                // Pero Gemini Vision puede ver imágenes. Vamos a intentar enviar un mensaje indicando que es una imagen.
                // Como 'append' acepta archivos en versiones nuevas, aquí simplificaremos leyendo como DataURL.
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = e.target?.result as string;
                    // Enviamos el base64 como texto por ahora, esperando que el prompt de sistema sepa que es una imagen o
                    // idealmente usaríamos la propiedad 'experimental_attachments' si estuviéramos en la última versión.
                    // Para asegurar compatibilidad, enviaremos un mensaje de texto con el nombre.
                    onUpload(`[IMAGEN SUBIDA: ${file.name}] (El análisis de imágenes requiere configuración adicional, por favor describe el contenido si no lo reconozco)`, file.name);
                    onClose();
                };
                reader.readAsDataURL(file);
            } else {
                // Leer texto
                const text = await file.text();
                onUpload(text, file.name);
                onClose();
            }
        } catch (err) {
            setError('Error al leer el archivo.');
        } finally {
            setIsReading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Upload className="w-5 h-5 text-indigo-400" />
                        Subir Documento Financiero
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-slate-400 text-sm mb-4">
                        Sube tu estado de cuenta, lista de gastos o resumen financiero para que lo analice.
                    </p>

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                            border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all
                            ${isDragging
                                ? 'border-indigo-500 bg-indigo-500/10'
                                : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'}
                            ${error ? 'border-red-500/50 bg-red-500/5' : ''}
                        `}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                            accept=".txt,.csv,.json,.md,.png,.jpg,.jpeg"
                        />

                        {file ? (
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <Check className="w-6 h-6" />
                                </div>
                                <p className="text-white font-medium truncate max-w-[200px]">{file.name}</p>
                                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    className="text-xs text-red-400 hover:text-red-300 mt-2 underline"
                                >
                                    Eliminar
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <p className="text-slate-300 font-medium">Haz clic o arrastra un archivo aquí</p>
                                <p className="text-xs text-slate-500 mt-1">TXT, CSV, JSON o Imágenes</p>
                            </>
                        )}
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-red-300">{error}</p>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!file || isReading}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isReading ? 'Procesando...' : 'Analizar Documento'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
