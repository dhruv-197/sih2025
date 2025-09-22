import React, { useState, useEffect, useRef } from 'react';
import type { MineData } from '../types';
import { getChatbotResponse } from '../services/geminiService';
import { SendIcon, CloseIcon, AnalysisIcon, MicrophoneIcon } from './Icons';

interface Message {
    sender: 'user' | 'ai';
    text: string;
    sources?: Array<{ web: { uri: string; title: string; } }>;
}

// FIX: Cast window to 'any' to access non-standard SpeechRecognition APIs and resolve TypeScript errors.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
}


export const Chatbot: React.FC<{ mineData: MineData; isOpen: boolean; onClose: () => void; }> = ({ mineData, isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading]);
    
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                { sender: 'ai', text: `Hello! I'm the MineSafe AI Assistant for ${mineData.mine.name}. How can I help you today? You can ask about the current risk, alerts, or analysis.` }
            ]);
        }
    }, [isOpen, mineData]);

    useEffect(() => {
        if (!recognition) return;
        
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputValue(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
        
        return () => {
            recognition.onresult = null;
            recognition.onerror = null;
            recognition.onend = null;
        }

    }, []);

    const handleListen = () => {
        if (!recognition || isLoading) return;

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            recognition.start();
            setIsListening(true);
        }
    };


    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await getChatbotResponse(inputValue, mineData);
            const aiMessage: Message = { sender: 'ai', text: response.text, sources: response.sources };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error: any) {
            const errorMessage: Message = { sender: 'ai', text: error.message || "Sorry, I encountered an error." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-end animate-fade-in" aria-modal="true" role="dialog">
            <div 
                className="bg-sidebar-light dark:bg-sidebar h-[90vh] w-full max-w-lg m-4 rounded-xl shadow-2xl flex flex-col border border-border-light dark:border-border"
            >
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b border-border-light dark:border-border">
                    <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary">MineSafe AI Assistant</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-primary-light dark:hover:bg-primary" aria-label="Close chat">
                        <CloseIcon />
                    </button>
                </header>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'ai' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center">
                                    <AnalysisIcon />
                                </div>
                            )}
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-accent text-white rounded-br-none' : 'bg-card-light dark:bg-card text-text-primary-light dark:text-text-primary rounded-bl-none'}`}>
                                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-3 justify-start">
                             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center">
                                <AnalysisIcon />
                            </div>
                            <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-card-light dark:bg-card rounded-bl-none">
                                <div className="flex items-center space-x-2">
                                    <span className="h-2 w-2 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-accent rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-border-light dark:border-border">
                    <div className="flex items-center bg-primary-light dark:bg-primary rounded-lg">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={isListening ? "Listening..." : "Ask about mine conditions..."}
                            className="flex-1 bg-transparent p-3 text-text-primary-light dark:text-text-primary focus:outline-none"
                            disabled={isLoading}
                            aria-label="Chat input"
                        />
                        {recognition && (
                             <button type="button" onClick={handleListen} disabled={isLoading} className={`p-3 ${isListening ? 'text-secondary-accent' : 'text-accent'} disabled:text-text-secondary-light dark:disabled:text-text-secondary disabled:cursor-not-allowed`} aria-label="Use microphone">
                                <MicrophoneIcon />
                            </button>
                        )}
                        <button type="submit" disabled={isLoading || !inputValue.trim()} className="p-3 text-accent disabled:text-text-secondary-light dark:disabled:text-text-secondary disabled:cursor-not-allowed" aria-label="Send message">
                            <SendIcon />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};