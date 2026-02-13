
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { PixelCard, PixelButton, PixelInput, SectionHeader } from '../components/ui/PixelComponents';
import { User, Shield, Heart, Bookmark, Trash2, Camera, Save, AlertTriangle, Loader2, CheckCircle, X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
    const { currentUser, updateUser, uploadAvatar, deleteAccount, cosplaySets } = useData();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [activeTab, setActiveTab] = useState<'liked' | 'saved'>('liked');
    const [newAvatarUrl, setNewAvatarUrl] = useState('');
    const [deleteEmail, setDeleteEmail] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Computed Data
    const [likedPhotos, setLikedPhotos] = useState<{ setId: string, photo: any }[]>([]);
    const [savedPhotos, setSavedPhotos] = useState<{ setId: string, photo: any }[]>([]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setNewAvatarUrl(currentUser.profilePicture || '');

        // Compute Liked Photos
        const liked: { setId: string, photo: any }[] = [];
        cosplaySets.forEach(set => {
            set.photos.forEach(photo => {
                if ((photo.likes || []).includes(currentUser.id)) {
                    liked.push({ setId: set.id, photo: photo });
                }
            });
        });
        setLikedPhotos(liked);

        // Compute Saved Photos
        const saved: { setId: string, photo: any }[] = [];
        const userSavedIds = currentUser.savedPhotos || [];
        cosplaySets.forEach(set => {
            set.photos.forEach(photo => {
                if (userSavedIds.includes(photo.id)) {
                    saved.push({ setId: set.id, photo: photo });
                }
            });
        });
        setSavedPhotos(saved);

    }, [currentUser, cosplaySets, navigate]);

    if (!currentUser) return null;

    const handleUpdateProfile = async () => {
        setSaving(true);
        try {
            await updateUser(currentUser.id, { profilePicture: newAvatarUrl });
            setSuccessMsg('Profile picture updated successfully!');
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (e: any) {
            alert(e.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        try {
            const url = await uploadAvatar(file);
            // Apply the new URL immediately
            setNewAvatarUrl(url);
            await updateUser(currentUser.id, { profilePicture: url });
            setSuccessMsg('Avatar uploaded and updated successfully!');
        } catch (e: any) {
             alert(e.message || 'Failed to upload avatar.');
        } finally {
            setSaving(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteAccount = async () => {
        if (currentUser.isAdmin) {
            alert("Admin account cannot be deleted.");
            return;
        }
        if (deleteEmail.trim() !== currentUser.email) {
            alert("Email does not match. Cannot delete account.");
            return;
        }
        if (window.confirm("Are you absolutely sure? This action cannot be undone.")) {
            setDeleting(true);
            try {
                await deleteAccount(currentUser.id);
                navigate('/');
            } catch (e: any) {
                alert(e.message || 'Failed to delete account.');
            } finally {
                setDeleting(false);
            }
        }
    };

    const displayPhotos = activeTab === 'liked' ? likedPhotos : savedPhotos;

    return (
        <div className="pt-32 min-h-screen px-4 pb-20 max-w-7xl mx-auto">
            <SectionHeader title="My Profile" subtitle="Manage your identity and collection" />

            <div className="grid md:grid-cols-3 gap-8 items-start">

                {/* Left Column: User Details */}
                <div className="md:col-span-1 space-y-8">
                    <PixelCard>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-32 h-32 mb-4 relative">
                                <img
                                    src={currentUser.profilePicture || `https://ui-avatars.com/api/?name=${currentUser.username}&background=random`}
                                    alt="Profile"
                                    className="w-full h-full object-cover border-4 border-pixel-dark shadow-pixel rounded-full"
                                />
                                {currentUser.isAdmin && (
                                    <div className="absolute -top-2 -right-2 bg-pixel-gold border-2 border-pixel-dark p-1 rounded-full" title="Admin">
                                        <Shield size={20} className="text-pixel-dark" />
                                    </div>
                                )}
                            </div>
                            <h2 className="font-pixel text-3xl">{currentUser.username}</h2>
                            <p className="font-pixel text-xl text-gray-500 mb-6">{currentUser.email}</p>

                            <div className="w-full space-y-4 text-left border-t-2 border-pixel-dark pt-4">
                                <div className="flex flex-col gap-2">
                                    <label className="font-pixel text-lg text-pixel-dark">Update Avatar</label>
                                    <div className="flex gap-2">
                                        <input
                                            className="flex-1 bg-white text-pixel-dark border-2 border-pixel-dark p-1 font-pixel text-sm focus:outline-none focus:ring-2 focus:ring-pixel-pink"
                                            value={newAvatarUrl}
                                            onChange={e => setNewAvatarUrl(e.target.value)}
                                            placeholder="https://..."
                                            disabled={saving}
                                        />
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleFileUpload} 
                                            className="hidden" 
                                            accept="image/*"
                                        />
                                        <button 
                                            onClick={() => fileInputRef.current?.click()} 
                                            className="bg-white text-pixel-dark border-2 border-pixel-dark p-1 hover:bg-gray-100 disabled:opacity-50"
                                            disabled={saving}
                                            title="Upload from device"
                                        >
                                            <Upload size={16} />
                                        </button>
                                        <button onClick={handleUpdateProfile} className="bg-pixel-dark text-white p-1 hover:bg-pixel-pink disabled:opacity-50" disabled={saving}>
                                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        </button>
                                    </div>
                                    <p className="text-xs font-pixel text-gray-500">
                                        Enter a URL or upload an image directly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </PixelCard>

                    {/* Danger Zone - Only for non-admin users */}
                    {!currentUser.isAdmin && (
                        <PixelCard className="border-red-500 bg-red-50">
                            <h3 className="font-pixel text-2xl text-red-600 mb-4 flex items-center gap-2">
                                <AlertTriangle size={24} /> Danger Zone
                            </h3>
                            <p className="font-pixel text-sm text-gray-700 mb-4">
                                To delete your account, type your email address below.
                            </p>
                            <div className="space-y-3">
                                <input
                                    className="w-full bg-white text-pixel-dark border-2 border-red-300 p-2 font-pixel focus:outline-none focus:border-red-500"
                                    placeholder="Enter your email address"
                                    value={deleteEmail}
                                    onChange={e => setDeleteEmail(e.target.value)}
                                    disabled={deleting}
                                />
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteEmail !== currentUser.email || deleting}
                                    className={`w-full border-2 border-pixel-dark font-pixel text-xl py-2 flex items-center justify-center gap-2 shadow-pixel-sm
                                ${deleteEmail !== currentUser.email || deleting
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-red-500 text-white hover:bg-red-600'
                                        }`}
                                >
                                    {deleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />} Delete Account
                                </button>
                            </div>
                        </PixelCard>
                    )}
                </div>

                {/* Right Column: Gallery */}
                <div className="md:col-span-2">
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setActiveTab('liked')}
                            className={`flex-1 py-3 border-2 border-pixel-dark font-pixel text-2xl flex items-center justify-center gap-2 transition-all shadow-pixel
                        ${activeTab === 'liked' ? 'bg-pixel-pink text-white' : 'bg-white hover:bg-gray-50'}`}
                        >
                            <Heart fill="currentColor" /> Liked Photos ({likedPhotos.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('saved')}
                            className={`flex-1 py-3 border-2 border-pixel-dark font-pixel text-2xl flex items-center justify-center gap-2 transition-all shadow-pixel
                        ${activeTab === 'saved' ? 'bg-pixel-gold text-white' : 'bg-white hover:bg-gray-50'}`}
                        >
                            <Bookmark fill="currentColor" /> Saved Photos ({savedPhotos.length})
                        </button>
                    </div>

                    <PixelCard className="min-h-[400px]">
                        {displayPhotos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <Camera size={48} className="mb-4 opacity-50" />
                                <p className="font-pixel text-xl">No photos found here yet.</p>
                                <PixelButton variant="secondary" className="mt-4" onClick={() => navigate('/gallery')}>
                                    Browse Gallery
                                </PixelButton>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {displayPhotos.map((item, idx) => (
                                    <motion.div
                                        key={`${item.photo.id}-${idx}`}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        onClick={() => navigate(`/gallery/${item.setId}`)}
                                        className="aspect-square cursor-pointer overflow-hidden border-2 border-pixel-dark relative group"
                                    >
                                        <img src={item.photo.url} alt="Saved" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="font-pixel text-white bg-black/50 px-2 py-1">View Set</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </PixelCard>
                </div>

            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSuccessMsg(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white border-2 border-pixel-dark p-6 shadow-pixel-lg max-w-sm w-full text-center relative"
                        >
                             <button 
                                onClick={() => setSuccessMsg(null)}
                                className="absolute top-2 right-2 text-gray-500 hover:text-pixel-dark"
                            >
                                <X size={24} />
                            </button>
                            
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-green-100 rounded-full border-2 border-green-500">
                                    <CheckCircle size={48} className="text-green-500" />
                                </div>
                            </div>
                            
                            <h3 className="font-pixel text-2xl text-pixel-dark mb-2">Success!</h3>
                            <p className="font-pixel text-xl text-gray-600 mb-6">{successMsg}</p>
                            
                            <button 
                                onClick={() => setSuccessMsg(null)}
                                className="bg-pixel-dark text-white font-pixel text-xl px-8 py-2 border-2 border-pixel-dark shadow-pixel hover:bg-pixel-pink active:translate-y-1 active:shadow-none transition-all"
                            >
                                OK
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
