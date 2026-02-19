
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                ref={overlayRef}
                className="bg-[#111111] border border-neutral-800 w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="p-1 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6">
                    {children}
                </div>

                {footer && (
                    <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

interface InputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (value: string) => void;
    title: string;
    label: string;
    defaultValue?: string;
    placeholder?: string;
    submitText?: string;
}

export function InputModal({ isOpen, onClose, onSubmit, title, label, defaultValue = '', placeholder, submitText = 'Create' }: InputModalProps) {
    const [value, setValue] = React.useState(defaultValue);

    useEffect(() => {
        if (isOpen) setValue(defaultValue);
    }, [isOpen, defaultValue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(value);
        onClose();
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={title}
            footer={
                <>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={!value.trim()}
                        className="px-4 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg shadow-purple-900/20 transition-all"
                    >
                        {submitText}
                    </button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{label}</label>
                    <input 
                        autoFocus
                        type="text" 
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-black/50 border border-neutral-800 text-neutral-200 text-sm rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors"
                    />
                </div>
            </form>
        </Modal>
    );
}

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    intent?: 'danger' | 'primary';
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', intent = 'primary' }: ConfirmModalProps) {
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={title}
            footer={
                <>
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => { onConfirm(); onClose(); }}
                        className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-lg transition-all ${
                            intent === 'danger' 
                                ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' 
                                : 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20'
                        }`}
                    >
                        {confirmText}
                    </button>
                </>
            }
        >
            <p className="text-neutral-400 text-sm leading-relaxed">{message}</p>
        </Modal>
    );
}
