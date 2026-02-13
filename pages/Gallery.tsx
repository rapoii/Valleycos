
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { PixelCard, SectionHeader, PixelButton } from '../components/ui/PixelComponents';
import { X, Heart, Bookmark, MessageCircle, Send, Trash2, LogIn, AlertCircle, Search, Filter } from 'lucide-react';
import { CosplayPhoto } from '../types';

// Extracted component to prevent re-rendering issues causing input focus loss
const PhotoInteractions = ({
    photo,
    setId,
    onAuthRequest
}: {
    photo: CosplayPhoto;
    setId: string;
    onAuthRequest: () => boolean;
}) => {
    const { currentUser, users, toggleLikePhoto, toggleSavePhoto, addComment, deleteComment } = useData();
    const [commentText, setCommentText] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const likesCount = (photo.likes || []).length;
    const saveCount = photo.saveCount || 0;

    const isLiked = currentUser ? (photo.likes || []).includes(currentUser.id) : false;
    const isSaved = currentUser ? (currentUser.savedPhotos || []).includes(photo.id) : false;

    const handleLike = async () => {
        if (onAuthRequest()) {
            await toggleLikePhoto(setId, photo.id);
        }
    };

    const handleSave = async () => {
        if (onAuthRequest()) {
            await toggleSavePhoto(photo.id);
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (onAuthRequest()) {
            if (!commentText.trim()) return;
            await addComment(setId, photo.id, commentText);
            setCommentText('');
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, commentId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteConfirmId(commentId);
    };

    const confirmDelete = async () => {
        if (deleteConfirmId) {
            await deleteComment(setId, photo.id, deleteConfirmId);
            setDeleteConfirmId(null);
        }
    };

    return (
        <div className="bg-white border-t-2 border-pixel-dark p-4 relative">
            <div className="flex gap-4 mb-4">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-1 font-pixel text-lg transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                >
                    <Heart fill={isLiked ? "currentColor" : "none"} /> {likesCount}
                </button>
                <button
                    onClick={handleSave}
                    className={`flex items-center gap-1 font-pixel text-lg transition-colors ${isSaved ? 'text-pixel-gold' : 'text-gray-500 hover:text-pixel-gold'}`}
                >
                    <Bookmark fill={isSaved ? "currentColor" : "none"} /> {saveCount}
                </button>
            </div>

            {/* Comments Section */}
            <div className="space-y-3">
                <h4 className="font-pixel text-lg text-pixel-dark border-b border-gray-200 pb-1">Comments</h4>

                <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {(photo.comments || []).length === 0 && <p className="text-gray-400 font-pixel text-sm italic">No comments yet.</p>}
                    {(photo.comments || []).map(comment => (
                        <div key={comment.id} className="bg-gray-50 p-2 border border-gray-200 text-sm hover:bg-white transition-colors">
                            <div className="flex justify-between items-start">
                                <span className="font-bold font-pixel text-pixel-pink">{comment.username}</span>
                                {(currentUser?.isAdmin || currentUser?.id === comment.userId) && (
                                    <button
                                        type="button"
                                        onClick={(e) => handleDeleteClick(e, comment.id)}
                                        className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition-colors"
                                        title="Delete Comment"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                            <p className="font-pixel text-gray-700 break-words">{comment.text}</p>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleComment} className="flex gap-2 mt-2">
                    <input
                        type="text"
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 bg-white text-pixel-dark border-2 border-pixel-dark px-2 py-1 font-pixel text-lg focus:outline-none focus:border-pixel-pink placeholder:text-gray-400"
                    />
                    <button type="submit" className="bg-pixel-dark text-white p-2 hover:bg-pixel-pink transition-colors">
                        <Send size={16} />
                    </button>
                </form>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirmId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(null);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-sm bg-white"
                        >
                            <PixelCard className="text-center border-2 border-pixel-dark shadow-pixel-lg relative">
                                <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                                >
                                    <X size={24} />
                                </button>
                                <div className="flex justify-center mb-4 text-red-500">
                                    <Trash2 size={48} />
                                </div>
                                <h3 className="font-pixel text-3xl mb-2 text-pixel-dark">Delete Comment?</h3>
                                <p className="font-pixel text-xl text-gray-600 mb-6">
                                    This action cannot be undone.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <PixelButton onClick={confirmDelete} variant="danger">
                                        Yes, Delete
                                    </PixelButton>
                                    <PixelButton variant="secondary" onClick={() => setDeleteConfirmId(null)}>
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

const Gallery = () => {
    const { cosplaySets, currentUser, seriesList } = useData();
    const { id } = useParams();
    const navigate = useNavigate();

    const [showLoginPopup, setShowLoginPopup] = useState(false);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSeries, setSelectedSeries] = useState('');

    const activeSet = id ? cosplaySets.find(s => s.id === id) : null;

    const handleClose = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        navigate('/gallery');
    };

    const checkAuth = () => {
        if (!currentUser) {
            setShowLoginPopup(true);
            return false;
        }
        return true;
    };

    // Filtering Logic
    const filteredSets = cosplaySets.filter(set => {
        const matchesSearch = set.character.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSeries = selectedSeries ? set.series === selectedSeries : true;
        return matchesSearch && matchesSeries;
    });

    return (
        <div className="pt-32 min-h-screen px-4 pb-20">
            <SectionHeader title="The Collection" subtitle="A visual journey through characters and worlds" />

            {/* Filters Toolbar */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search character..."
                        className="w-full pl-10 pr-4 py-2 border-2 border-pixel-dark font-pixel text-xl focus:outline-none focus:ring-2 focus:ring-pixel-pink shadow-pixel-sm bg-white text-pixel-dark placeholder:text-gray-400"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="relative w-full md:w-64">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <select
                        className="w-full pl-10 pr-8 py-2 border-2 border-pixel-dark font-pixel text-xl appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-pixel-pink shadow-pixel-sm cursor-pointer"
                        value={selectedSeries}
                        onChange={e => setSelectedSeries(e.target.value)}
                    >
                        <option value="">All Series / Sources</option>
                        {seriesList.map(series => (
                            <option key={series.id} value={series.name}>{series.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-pixel-dark">
                        ▼
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredSets.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <p className="font-pixel text-2xl text-gray-500">No cosplay sets found matching your criteria.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedSeries(''); }}
                            className="mt-4 text-pixel-pink underline font-pixel text-xl"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    filteredSets.map((set, idx) => (
                        <motion.div
                            key={set.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => navigate(`/gallery/${set.id}`)}
                            className="cursor-pointer"
                        >
                            <PixelCard noPadding className="h-full hover:shadow-pixel-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="aspect-square relative overflow-hidden border-b-2 border-pixel-dark">
                                    <img src={set.coverImage} className="w-full h-full object-cover" alt={set.character} />
                                    <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors"></div>
                                    {/* Stats Overlay */}
                                    <div className="absolute bottom-2 right-2 flex gap-2">
                                        <span className="bg-black/50 text-white px-2 py-0.5 font-pixel text-sm flex items-center gap-1 backdrop-blur-sm">
                                            <Heart size={12} /> {set.photos.reduce((acc, p) => acc + (p.likes || []).length, 0)}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 text-center">
                                    <h3 className="font-pixel text-2xl truncate">{set.character}</h3>
                                    <p className="font-pixel text-lg text-gray-500 truncate">{set.series}</p>
                                </div>
                            </PixelCard>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Modal / Detail View */}
            <AnimatePresence>
                {activeSet && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pixel-dark/90 backdrop-blur-sm"
                        onClick={handleClose}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto border-2 border-pixel-dark shadow-pixel-lg relative flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 z-10 bg-pixel-pink border-2 border-pixel-dark p-1 hover:bg-pink-400"
                            >
                                <X size={24} />
                            </button>

                            <div className="p-8">
                                {/* Header Info */}
                                <div className="flex flex-col md:flex-row gap-8 mb-8 border-b-2 border-gray-200 pb-8">
                                    <img
                                        src={activeSet.coverImage}
                                        alt={activeSet.character}
                                        className="w-full md:w-1/3 aspect-[3/4] object-cover border-2 border-pixel-dark shadow-pixel-sm"
                                    />
                                    <div>
                                        <h2 className="text-5xl font-pixel mb-2">{activeSet.character}</h2>
                                        <h3 className="text-3xl font-pixel text-pixel-pink mb-4">{activeSet.series}</h3>
                                        <p className="font-pixel text-xl text-gray-600 leading-relaxed mb-6">
                                            {activeSet.description}
                                        </p>
                                        <div className="flex gap-4">
                                            <div className="bg-gray-100 border-2 border-pixel-dark px-4 py-2 font-pixel">
                                                Date: {new Date(activeSet.date).toLocaleDateString('sv-SE')}
                                            </div>
                                            <div className="bg-gray-100 border-2 border-pixel-dark px-4 py-2 font-pixel">
                                                Photos: {activeSet.photos.filter(p => p.url !== activeSet.coverImage).length}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Photos Grid with Interactions */}
                                <h3 className="font-pixel text-3xl mb-6">Gallery Photos</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    {activeSet.photos.filter(photo => photo.url !== activeSet.coverImage).map(photo => (
                                        <div key={photo.id} className="border-2 border-pixel-dark flex flex-col">
                                            <img src={photo.url} alt="Cosplay detail" className="w-full h-auto" />
                                            <PhotoInteractions photo={photo} setId={activeSet.id} onAuthRequest={checkAuth} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Login Popup */}
            <AnimatePresence>
                {showLoginPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowLoginPopup(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-sm"
                        >
                            <PixelCard className="text-center border-2 border-pixel-dark shadow-pixel-lg">
                                <div className="flex justify-center mb-4 text-pixel-pink">
                                    <AlertCircle size={48} />
                                </div>
                                <h3 className="font-pixel text-3xl mb-2 text-pixel-dark">Login Required</h3>
                                <p className="font-pixel text-xl text-gray-600 mb-6 leading-relaxed">
                                    You must log in first to perform this action!
                                </p>
                                <div className="flex flex-col gap-3">
                                    <PixelButton onClick={() => navigate('/login')}>
                                        <span className="flex items-center justify-center gap-2">
                                            <LogIn size={20} /> Login Now
                                        </span>
                                    </PixelButton>
                                    <PixelButton variant="secondary" onClick={() => setShowLoginPopup(false)}>
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

export default Gallery;
