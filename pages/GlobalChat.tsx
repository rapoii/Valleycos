
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { PixelCard, SectionHeader, PixelButton } from '../components/ui/PixelComponents';
import { Send, Trash2, MessageSquare, Shield, AlertTriangle, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalChat = () => {
    const { currentUser, globalChatMessages, sendGlobalMessage, deleteGlobalMessage } = useData();
    const [message, setMessage] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isUserNearBottomRef = useRef(true);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            const { scrollHeight, clientHeight } = scrollContainerRef.current;
            scrollContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior: 'smooth'
            });
        }
    };

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
            isUserNearBottomRef.current = distanceFromBottom < 100;
        }
    };

    useEffect(() => {
        if (isUserNearBottomRef.current) {
            scrollToBottom();
        }
    }, [globalChatMessages]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        // Real-time chat is handled by DataContext
        // No polling needed!
    }, [currentUser, navigate]);

    if (!currentUser) return null;

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || sending) return;
        setSending(true);
        try {
            await sendGlobalMessage(message);
            setMessage('');
            scrollToBottom();
            isUserNearBottomRef.current = true;
        } finally {
            setSending(false);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, msgId: string) => {
        e.stopPropagation();
        setDeleteId(msgId);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await deleteGlobalMessage(deleteId);
            setDeleteId(null);
        }
    };

    return (
        <div className="pt-32 min-h-screen px-4 pb-20 max-w-5xl mx-auto">
            <SectionHeader title="Global Chat" subtitle="Live Guild Chat Room" />

            <PixelCard className="h-[70vh] flex flex-col p-0 relative">
                {/* Chat Header */}
                <div className="bg-pixel-dark text-white p-4 flex items-center gap-2 border-b-2 border-pixel-dark">
                    <MessageSquare size={24} className="text-pixel-pink" />
                    <span className="font-pixel text-2xl">#general-lobby</span>
                    <span className="ml-auto font-pixel text-gray-400 text-sm">{globalChatMessages.length} messages</span>
                </div>

                {/* Messages Area */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 custom-scrollbar"
                >
                    {globalChatMessages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                            <MessageSquare size={48} />
                            <p className="font-pixel text-xl mt-2">No messages yet. Start the conversation!</p>
                        </div>
                    )}

                    {globalChatMessages.map((msg) => {
                        const isMe = msg.userId === currentUser.id;
                        return (
                            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-10 h-10 rounded-full border-2 border-pixel-dark overflow-hidden flex-shrink-0 bg-white`}>
                                    <img
                                        src={msg.profilePicture || `https://ui-avatars.com/api/?name=${msg.username}&background=random`}
                                        alt="av"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`font-pixel font-bold text-lg ${msg.isAdmin ? 'text-pixel-pink' : 'text-pixel-dark'}`}>
                                            {msg.username}
                                        </span>
                                        {msg.isAdmin && <Shield size={14} className="text-pixel-gold" />}
                                        <span className="text-xs text-gray-400 font-pixel">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>

                                    <div className={`p-3 border-2 border-pixel-dark shadow-pixel-sm relative group
                                ${isMe ? 'bg-pixel-pink text-white' : 'bg-white text-pixel-dark'}
                             `}>
                                        <p className="font-pixel text-xl break-words whitespace-pre-wrap">{msg.text}</p>

                                        {/* Delete Button (Admin OR Owner) */}
                                        {(currentUser.isAdmin || isMe) && (
                                            <button
                                                type="button"
                                                onClick={(e) => handleDeleteClick(e, msg.id)}
                                                className="absolute -top-4 -right-4 bg-red-500 text-white p-1.5 rounded-full border-2 border-pixel-dark transition-transform hover:scale-110 z-10 shadow-sm"
                                                title="Delete Message"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t-2 border-pixel-dark bg-white">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-100 border-2 border-pixel-dark p-3 font-pixel text-xl focus:outline-none focus:ring-2 focus:ring-pixel-pink"
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={!message.trim() || sending}
                            className="bg-pixel-dark text-white px-6 py-2 border-2 border-pixel-dark font-pixel text-xl hover:bg-pixel-pink disabled:opacity-50 disabled:cursor-not-allowed shadow-pixel"
                        >
                            {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </form>
                </div>
            </PixelCard>

            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setDeleteId(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-sm"
                        >
                            <PixelCard className="text-center border-2 border-pixel-dark shadow-pixel-lg relative">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                                >
                                    <X size={24} />
                                </button>
                                <div className="flex justify-center mb-4 text-red-500">
                                    <Trash2 size={48} />
                                </div>
                                <h3 className="font-pixel text-3xl mb-2 text-pixel-dark">Delete Message?</h3>
                                <p className="font-pixel text-xl text-gray-600 mb-6">
                                    Are you sure you want to remove this message from the chat?
                                </p>
                                <div className="flex flex-col gap-3">
                                    <PixelButton onClick={confirmDelete} variant="danger">
                                        Yes, Delete It
                                    </PixelButton>
                                    <PixelButton variant="secondary" onClick={() => setDeleteId(null)}>
                                        Cancel
                                    </PixelButton>
                                </div>
                            </PixelCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GlobalChat;
