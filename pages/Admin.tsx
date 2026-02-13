
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { PixelButton, PixelCard, PixelInput, SectionHeader, PixelModal } from '../components/ui/PixelComponents';
import { CosplaySet, CosplayPhoto, Series, User } from '../types';
import { Trash2, Plus, LogOut, Check, Pencil, X, AlertTriangle, Layers, Image as ImageIcon, Share2, Users, Ban, Shield, Unlock, Loader2, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Admin = () => {
    const {
        cosplaySets, addSet, updateSet, deleteSet,
        seriesList, addSeries, updateSeries, deleteSeries,
        currentUser, socialLinks, updateSocialLinks,
        users, banUser, unbanUser, deleteUserAdmin,
        refreshUsers, uploadSetImage
    } = useData();
    const navigate = useNavigate();
    
    // Upload Refs
    const coverInputRef = React.useRef<HTMLInputElement>(null);
    const multiPhotoInputRef = React.useRef<HTMLInputElement>(null);

    // Tab State
    const [activeTab, setActiveTab] = useState<'sets' | 'series' | 'socials' | 'users'>('sets');
    const [actionLoading, setActionLoading] = useState(false);
    const [isCoverUploading, setIsCoverUploading] = useState(false);
    const [isMultiUploading, setIsMultiUploading] = useState(false);

    // --- COSPLAY SET STATES ---
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        character: '',
        series: '',
        description: '',
        coverImage: '',
        featured: false,
        additionalPhotos: '',
    });

    // --- SERIES STATES ---
    const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null);
    const [seriesForm, setSeriesForm] = useState({ name: '' });

    // --- SOCIALS STATES ---
    const [socialForm, setSocialForm] = useState({
        instagram: '',
        tiktok: '',
        email: ''
    });

    // --- DELETE CONFIRMATION STATE ---
    const [confirmDeleteSet, setConfirmDeleteSet] = useState<{ id: string, name: string } | null>(null);
    const [confirmDeleteSeries, setConfirmDeleteSeries] = useState<{ id: string, name: string } | null>(null);

    // --- ALERT STATE ---
    const [alertState, setAlertState] = useState<{ open: boolean; title: string; message: string; type: 'success' | 'error' }>({
        open: false,
        title: '',
        message: '',
        type: 'success'
    });

    // Helper: Prevent Tab Close/Refresh while active
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (actionLoading || isCoverUploading || isMultiUploading) {
                e.preventDefault();
                e.returnValue = ''; // Chrome requires returnValue to be set
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [actionLoading, isCoverUploading, isMultiUploading]);

    const showAlert = (title: string, message: string, type: 'success' | 'error' = 'success') => {
        setAlertState({ open: true, title, message, type });
    };

    const closeAlert = () => {
        setAlertState(prev => ({ ...prev, open: false }));
    };

    // --- USER ACTION STATE ---
    const [confirmAction, setConfirmAction] = useState<{ type: 'ban' | 'unban' | 'delete', userId: string, username: string } | null>(null);

    useEffect(() => {
        if (socialLinks) {
            setSocialForm(socialLinks);
        }
    }, [socialLinks]);

    // Load users when switching to users tab
    useEffect(() => {
        if (activeTab === 'users' && currentUser?.isAdmin) {
            refreshUsers();
        }
    }, [activeTab, currentUser?.isAdmin, refreshUsers]);

    // Security Check
    if (!currentUser || !currentUser.isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20 px-4">
                <PixelCard className="w-full max-w-md text-center">
                    <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="font-pixel text-3xl mb-4">ACCESS DENIED</h2>
                    <p className="font-pixel text-xl text-gray-600 mb-6">
                        You do not have the required permissions to view this area.
                    </p>
                    <PixelButton onClick={() => navigate('/login')}>Go to Login</PixelButton>
                </PixelCard>
            </div>
        );
    }

    // --- HANDLERS: SETS ---

    const resetForm = () => {
        setForm({ character: '', series: '', description: '', coverImage: '', featured: false, additionalPhotos: '' });
        setEditingId(null);
    };

    const handleEdit = (set: CosplaySet) => {
        setEditingId(set.id);

        const additionalUrls = set.photos
            .filter(p => p.url !== set.coverImage)
            .map(p => p.url)
            .join('\n');

        setForm({
            character: set.character,
            series: set.series,
            description: set.description,
            coverImage: set.coverImage,
            featured: set.featured,
            additionalPhotos: additionalUrls
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.character || !form.series || !form.coverImage) {
            showAlert("Input Error", "Please fill required fields (Character, Series, Cover Image)", 'error');
            return;
        }

        setActionLoading(true);
        try {
            // TIMEOUT WRAPPER: Force fail if takes longer than 30s
            // This prevents the "Infinite Loading" when browser suspends the tab.
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("Operation timed out. Please keep the tab open while saving.")), 30000);
            });

            await Promise.race([
                (async () => {
                    const oldSet = editingId ? cosplaySets.find(s => s.id === editingId) : null;

                    const newPhotoUrls = [form.coverImage, ...form.additionalPhotos.split('\n').map(u => u.trim()).filter(u => u.length > 0)];

                    const finalPhotos: CosplayPhoto[] = newPhotoUrls.map((url, idx) => {
                        const existing = oldSet?.photos.find(p => p.url === url);
                        return {
                            id: existing ? existing.id : `photo-${Date.now()}-${idx}`,
                            url: url,
                            likes: existing ? existing.likes : [],
                            comments: existing ? existing.comments : []
                        };
                    });

                    if (editingId) {
                        if (oldSet) {
                            const updatedSet: CosplaySet = {
                                ...oldSet,
                                character: form.character,
                                series: form.series,
                                description: form.description,
                                coverImage: form.coverImage,
                                featured: form.featured,
                                photos: finalPhotos
                            };
                            await updateSet(updatedSet);
                            showAlert("Success", "Set Updated!");
                        }
                    } else {
                        const newSet: CosplaySet = {
                            id: Date.now().toString(),
                            character: form.character || 'Unknown',
                            series: form.series || 'Unknown',
                            description: form.description || '',
                            coverImage: form.coverImage || 'https://picsum.photos/400/600',
                            date: new Date().toISOString().split('T')[0],
                            featured: form.featured || false,
                            photos: finalPhotos
                        };
                        console.log("Adding set:", newSet);
                        await addSet(newSet);
                        showAlert("Great Success!", "Cosplay Set Added!");
                    }
                    resetForm();
                })(),
                timeoutPromise
            ]);

        } catch (e: any) {
            console.error("Submit Error:", e);
            showAlert("Error", e.message || 'Operation failed.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const executeDeleteSet = async () => {
        if (!confirmDeleteSet) return;
        
        setActionLoading(true);
        try {
            if (editingId === confirmDeleteSet.id) resetForm();
            await deleteSet(confirmDeleteSet.id);
            showAlert("Success", "Cosplay Set Deleted!", 'success');
            setConfirmDeleteSet(null);
        } catch (e: any) {
            showAlert("Error", e.message || 'Failed to delete.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setActionLoading(true);
        setIsCoverUploading(true);
        try {
            const url = await uploadSetImage(file);
            setForm(prev => ({ ...prev, coverImage: url }));
            showAlert("Success", "Cover uploaded successfully!");
        } catch(e: any) {
            showAlert("Error", "Upload failed: " + e.message, 'error');
        } finally {
            setActionLoading(false);
            setIsCoverUploading(false);
            if(coverInputRef.current) coverInputRef.current.value = '';
        }
    };

    const handleMultiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setActionLoading(true);
        setIsMultiUploading(true);
        try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const url = await uploadSetImage(files[i]);
                uploadedUrls.push(url);
            }
            
            setForm(prev => ({ 
                ...prev, 
                additionalPhotos: (prev.additionalPhotos ? prev.additionalPhotos + '\n' : '') + uploadedUrls.join('\n')
            }));
            
            showAlert("Success", `${uploadedUrls.length} photo(s) uploaded!`);
        } catch(e: any) {
             showAlert("Error", "Uploads failed: " + e.message, 'error');
        } finally {
            setActionLoading(false);
            setIsMultiUploading(false);
            if(multiPhotoInputRef.current) multiPhotoInputRef.current.value = '';
        }
    };

    // --- HANDLERS: SERIES ---

    const resetSeriesForm = () => {
        setSeriesForm({ name: '' });
        setEditingSeriesId(null);
    };

    const handleEditSeries = (series: Series) => {
        setEditingSeriesId(series.id);
        setSeriesForm({ name: series.name });
    };

    const executeDeleteSeries = async () => {
        if (!confirmDeleteSeries) return;
        setActionLoading(true);
        try {
            if (editingSeriesId === confirmDeleteSeries.id) resetSeriesForm();
            await deleteSeries(confirmDeleteSeries.id);
            showAlert("Success", 'Series Deleted!', 'success');
            setConfirmDeleteSeries(null);
        } catch (e: any) {
            showAlert("Error", e.message || 'Failed to delete.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSubmitSeries = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!seriesForm.name.trim()) return;

        setActionLoading(true);
        try {
            if (editingSeriesId) {
                await updateSeries(editingSeriesId, seriesForm.name);
                showAlert("Success", 'Series Updated!');
            } else {
                await addSeries(seriesForm.name);
                showAlert("Success", 'Series Added!');
            }
            resetSeriesForm();
        } catch (e: any) {
            showAlert("Error", e.message || 'Operation failed.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // --- HANDLERS: SOCIALS ---

    const handleSubmitSocials = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await updateSocialLinks(socialForm);
            showAlert("Success", 'Social links updated successfully!');
        } catch (e: any) {
            showAlert("Error", e.message || 'Failed to update social links.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // --- HANDLERS: USERS ---
    const handleActionClick = (user: User, type?: 'ban' | 'unban' | 'delete') => {
        setConfirmAction({
            type: type || (user.isBanned ? 'unban' : 'ban'),
            userId: user.id,
            username: user.username
        });
    };

    const executeUserAction = async () => {
        if (!confirmAction) return;
        setActionLoading(true);
        try {
            if (confirmAction.type === 'ban') {
                await banUser(confirmAction.userId);
            } else if (confirmAction.type === 'unban') {
                await unbanUser(confirmAction.userId);
            } else if (confirmAction.type === 'delete') {
                await deleteUserAdmin(confirmAction.userId);
            }
            setConfirmAction(null);
        } catch (e: any) {
            showAlert("Error", e.message || 'Action failed.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="pt-32 min-h-screen px-4 pb-20 max-w-7xl mx-auto">
            <SectionHeader title="DASHBOARD" subtitle={`Welcome back, ${currentUser.username}`} />

            {/* Tabs */}
            <div className="flex gap-4 mb-8 flex-wrap justify-center">
                <PixelButton
                    variant={activeTab === 'sets' ? 'primary' : 'secondary'}
                    onClick={() => setActiveTab('sets')}
                    className="flex items-center gap-2"
                >
                    <ImageIcon size={20} /> Manage Sets
                </PixelButton>
                <PixelButton
                    variant={activeTab === 'series' ? 'primary' : 'secondary'}
                    onClick={() => setActiveTab('series')}
                    className="flex items-center gap-2"
                >
                    <Layers size={20} /> Manage Series
                </PixelButton>
                <PixelButton
                    variant={activeTab === 'users' ? 'primary' : 'secondary'}
                    onClick={() => setActiveTab('users')}
                    className="flex items-center gap-2"
                >
                    <Users size={20} /> User Management
                </PixelButton>
                <PixelButton
                    variant={activeTab === 'socials' ? 'primary' : 'secondary'}
                    onClick={() => setActiveTab('socials')}
                    className="flex items-center gap-2"
                >
                    <Share2 size={20} /> Social Media
                </PixelButton>
            </div>

            {/* --- SETS MANAGEMENT --- */}
            {activeTab === 'sets' && (
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Create/Edit Form */}
                    <div>
                        <PixelCard>
                            <div className="flex justify-between items-center mb-6 border-b-2 border-pixel-dark pb-2">
                                <h3 className="font-pixel text-3xl">{editingId ? 'Edit Set' : 'Add New Set'}</h3>
                                {editingId && (
                                    <button onClick={resetForm} className="text-sm font-pixel text-red-500 hover:underline flex items-center">
                                        <X size={16} className="mr-1" /> Cancel Edit
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <PixelInput
                                    label="Character Name"
                                    value={form.character}
                                    onChange={e => setForm({ ...form, character: e.target.value })}
                                    disabled={actionLoading}
                                />

                                <div className="flex flex-col gap-2">
                                    <label className="font-pixel text-xl text-pixel-dark">Series / Source</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-white text-pixel-dark border-2 border-pixel-dark p-2 font-pixel text-xl focus:outline-none focus:ring-2 focus:ring-pixel-pink shadow-pixel-sm appearance-none"
                                            value={form.series}
                                            onChange={e => setForm({ ...form, series: e.target.value })}
                                            disabled={actionLoading}
                                        >
                                            <option value="">-- Select Series --</option>
                                            {seriesList.map(s => (
                                                <option key={s.id} value={s.name}>{s.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-pixel-dark">
                                            ▼
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="font-pixel text-xl text-pixel-dark">Image URL (Cover)</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                             <PixelInput
                                                value={form.coverImage}
                                                placeholder="https://..."
                                                onChange={e => setForm({ ...form, coverImage: e.target.value })}
                                                disabled={actionLoading}
                                            />
                                        </div>
                                        <input
                                            type="file"
                                            ref={coverInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleCoverUpload}
                                        />
                                        <PixelButton 
                                            type="button" 
                                            onClick={() => {
                                                if (isMultiUploading) {
                                                    showAlert("Wait", "Please wait for additional photos to finish uploading.", "error");
                                                    return;
                                                }
                                                coverInputRef.current?.click();
                                            }}
                                            disabled={actionLoading}
                                            className="whitespace-nowrap min-w-[140px]"
                                        >
                                            {isCoverUploading ? (
                                                <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> Uploading...</span>
                                            ) : (
                                                <><Upload className="inline mr-2" size={18} /> Upload</>
                                            )}
                                        </PixelButton>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="font-pixel text-xl text-pixel-dark">Additional Photos (One URL per line)</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="file"
                                            ref={multiPhotoInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            multiple
                                            onChange={handleMultiUpload}
                                        />
                                        <PixelButton 
                                            type="button" 
                                            onClick={() => {
                                                if (isCoverUploading) {
                                                    showAlert("Wait", "Please wait for cover image to finish uploading.", "error");
                                                    return;
                                                }
                                                multiPhotoInputRef.current?.click();
                                            }}
                                            disabled={actionLoading}
                                            className="w-full"
                                        >
                                            {isMultiUploading ? (
                                                <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> Uploading Photos...</span>
                                            ) : (
                                                <><Upload className="inline mr-2" size={18} /> Upload Photos to Add</>
                                            )}
                                        </PixelButton>
                                    </div>
                                    <textarea
                                        className="bg-white text-pixel-dark border-2 border-pixel-dark p-2 font-pixel text-xl focus:outline-none focus:ring-2 focus:ring-pixel-pink shadow-pixel-sm placeholder:text-gray-400"
                                        rows={4}
                                        value={form.additionalPhotos}
                                        placeholder={"https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg"}
                                        onChange={e => setForm({ ...form, additionalPhotos: e.target.value })}
                                        disabled={actionLoading}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="font-pixel text-xl text-pixel-dark">Description</label>
                                    <textarea
                                        className="bg-white text-pixel-dark border-2 border-pixel-dark p-2 font-pixel text-xl focus:outline-none focus:ring-2 focus:ring-pixel-pink shadow-pixel-sm"
                                        rows={4}
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        disabled={actionLoading}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            id="featured"
                                            checked={form.featured}
                                            onChange={e => {
                                                const isChecked = e.target.checked;
                                                if (isChecked) {
                                                    const otherFeaturedCount = cosplaySets.filter(s => s.featured && s.id !== editingId).length;
                                                    if (otherFeaturedCount >= 3) {
                                                        showAlert('Limit Reached', 'You can only have 3 featured sets on the homepage. Please uncheck another set first.', 'error');
                                                        return;
                                                    }
                                                }
                                                setForm({ ...form, featured: isChecked });
                                            }}
                                            className="peer appearance-none w-6 h-6 border-2 border-pixel-dark bg-white checked:bg-pixel-pink cursor-pointer"
                                            disabled={actionLoading}
                                        />
                                        <Check className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-pixel-dark w-4 h-4 left-1 top-1" strokeWidth={4} />
                                    </div>
                                    <label htmlFor="featured" className="font-pixel text-xl cursor-pointer">Feature on Homepage</label>
                                </div>
                                <PixelButton type="submit" className="w-full mt-4" disabled={actionLoading}>
                                    {actionLoading ? (
                                        <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={20} /> Saving...</span>
                                    ) : editingId ? (
                                        <><Pencil className="inline mr-2" /> Update Set</>
                                    ) : (
                                        <><Plus className="inline mr-2" /> Create Set</>
                                    )}
                                </PixelButton>
                            </form>
                        </PixelCard>
                    </div>

                    {/* List View */}
                    <div>
                        <PixelCard>
                            <h3 className="font-pixel text-3xl mb-6 border-b-2 border-pixel-dark pb-2">Existing Sets ({cosplaySets.length})</h3>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {cosplaySets.map(set => (
                                    <div key={set.id} className={`flex gap-4 p-4 border-2 transition-colors ${editingId === set.id ? 'border-pixel-pink bg-pink-50' : 'border-gray-200 hover:border-pixel-dark bg-gray-50'}`}>
                                        <img src={set.coverImage} className="w-20 h-20 object-cover border-2 border-pixel-dark" alt="thumb" />
                                        <div className="flex-1">
                                            <h4 className="font-pixel text-2xl leading-none mb-1">{set.character}</h4>
                                            <p className="font-pixel text-lg text-gray-500">{set.series}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="font-pixel text-sm text-gray-400">{new Date(set.date).toLocaleDateString('sv-SE')}</p>
                                                <span className="font-pixel text-xs bg-gray-200 px-2 py-1 rounded-sm text-pixel-dark">
                                                    {set.photos.length} photos
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 justify-center">
                                            <button
                                                onClick={() => handleEdit(set)}
                                                className="text-blue-500 hover:text-blue-700 hover:scale-110 transition-transform"
                                                title="Edit"
                                            >
                                                <Pencil size={20} />
                                            </button>
                                            <button
                                                onClick={() => setConfirmDeleteSet({ id: set.id, name: set.character })}
                                                className="text-red-500 hover:text-red-700 hover:scale-110 transition-transform"
                                                title="Delete"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </PixelCard>
                    </div>
                </div>
            )}

            {/* --- SERIES MANAGEMENT --- */}
            {activeTab === 'series' && (
                <div className="grid lg:grid-cols-2 gap-12">
                    <div>
                        <PixelCard>
                            <div className="flex justify-between items-center mb-6 border-b-2 border-pixel-dark pb-2">
                                <h3 className="font-pixel text-3xl">{editingSeriesId ? 'Edit Series' : 'Add New Series'}</h3>
                                {editingSeriesId && (
                                    <button onClick={resetSeriesForm} className="text-sm font-pixel text-red-500 hover:underline flex items-center">
                                        <X size={16} className="mr-1" /> Cancel
                                    </button>
                                )}
                            </div>
                            <form onSubmit={handleSubmitSeries} className="space-y-4">
                                <PixelInput
                                    label="Series Name"
                                    value={seriesForm.name}
                                    placeholder="e.g. Genshin Impact"
                                    onChange={e => setSeriesForm({ ...seriesForm, name: e.target.value })}
                                    disabled={actionLoading}
                                />
                                <PixelButton type="submit" className="w-full mt-4" disabled={actionLoading}>
                                    {actionLoading ? (
                                        <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={20} /> Saving...</span>
                                    ) : editingSeriesId ? (
                                        <><Pencil className="inline mr-2" /> Update Series</>
                                    ) : (
                                        <><Plus className="inline mr-2" /> Add Series</>
                                    )}
                                </PixelButton>
                            </form>
                        </PixelCard>
                    </div>

                    <div>
                        <PixelCard>
                            <h3 className="font-pixel text-3xl mb-6 border-b-2 border-pixel-dark pb-2">Available Series ({seriesList.length})</h3>
                            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {seriesList.map(series => (
                                    <div key={series.id} className={`flex justify-between items-center p-4 border-2 transition-colors ${editingSeriesId === series.id ? 'border-pixel-pink bg-pink-50' : 'border-gray-200 hover:border-pixel-dark bg-gray-50'}`}>
                                        <h4 className="font-pixel text-2xl">{series.name}</h4>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => handleEditSeries(series)}
                                                className="text-blue-500 hover:text-blue-700 hover:scale-110 transition-transform"
                                                title="Edit"
                                            >
                                                <Pencil size={20} />
                                            </button>
                                            <button
                                                onClick={() => setConfirmDeleteSeries({ id: series.id, name: series.name })}
                                                className="text-red-500 hover:text-red-700 hover:scale-110 transition-transform"
                                                title="Delete"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </PixelCard>
                    </div>
                </div>
            )}

            {/* --- USER MANAGEMENT --- */}
            {activeTab === 'users' && (
                <div className="max-w-4xl mx-auto">
                    <PixelCard>
                        <div className="flex justify-between items-center mb-6 border-b-2 border-pixel-dark pb-2">
                            <h3 className="font-pixel text-3xl">Registered Users ({users.length})</h3>
                        </div>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {users.map(u => (
                                <div key={u.id} className={`flex items-center justify-between p-4 border-2 ${u.isBanned ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="flex items-center gap-4">
                                        <img src={u.profilePicture || `https://ui-avatars.com/api/?name=${u.username}&background=random`} alt="av" className="w-12 h-12 rounded-full border border-pixel-dark" />
                                        <div>
                                            <p className="font-pixel text-xl flex items-center gap-2">
                                                {u.username}
                                                {u.isAdmin && <Shield size={16} className="text-pixel-gold" />}
                                                {u.isBanned && <span className="text-red-600 font-bold uppercase text-sm ml-2">[BANNED]</span>}
                                            </p>
                                            <p className="font-pixel text-sm text-gray-500">{u.email}</p>
                                        </div>
                                    </div>

                                    {!u.isAdmin && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleActionClick(u)}
                                                className={`font-pixel text-lg px-4 py-1 border-2 flex items-center gap-2 transition-all
                                          ${u.isBanned
                                                        ? 'bg-green-100 border-green-500 text-green-700 hover:bg-green-200'
                                                        : 'bg-red-100 border-red-500 text-red-700 hover:bg-red-200'}
                                        `}
                                            >
                                                {u.isBanned ? <Unlock size={16} /> : <Ban size={16} />}
                                                {u.isBanned ? 'Unban' : 'Ban'}
                                            </button>
                                            <button
                                                onClick={() => handleActionClick(u, 'delete')}
                                                className="font-pixel text-lg px-4 py-1 border-2 flex items-center gap-2 transition-all bg-red-100 border-red-500 text-red-700 hover:bg-red-200"
                                            >
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </PixelCard>
                </div>
            )}

            {/* --- SOCIAL MEDIA MANAGEMENT --- */}
            {activeTab === 'socials' && (
                <div className="max-w-2xl mx-auto">
                    <PixelCard>
                        <div className="flex justify-between items-center mb-6 border-b-2 border-pixel-dark pb-2">
                            <h3 className="font-pixel text-3xl">Social Media Links</h3>
                        </div>
                        <form onSubmit={handleSubmitSocials} className="space-y-6">
                            <PixelInput
                                label="Instagram URL"
                                value={socialForm.instagram}
                                placeholder="https://instagram.com/..."
                                onChange={e => setSocialForm({ ...socialForm, instagram: e.target.value })}
                                disabled={actionLoading}
                            />
                            <PixelInput
                                label="TikTok URL"
                                value={socialForm.tiktok}
                                placeholder="https://tiktok.com/@..."
                                onChange={e => setSocialForm({ ...socialForm, tiktok: e.target.value })}
                                disabled={actionLoading}
                            />
                            <PixelInput
                                label="Contact Email"
                                value={socialForm.email}
                                placeholder="contact@email.com"
                                onChange={e => setSocialForm({ ...socialForm, email: e.target.value })}
                                disabled={actionLoading}
                            />
                            <PixelButton type="submit" className="w-full" disabled={actionLoading}>
                                {actionLoading ? (
                                    <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={20} /> Saving...</span>
                                ) : (
                                    <><Check className="inline mr-2" /> Save Settings</>
                                )}
                            </PixelButton>
                        </form>
                    </PixelCard>
                </div>
            )}

            {/* Confirmation Modal for User Actions */}
            <AnimatePresence>
                {confirmAction && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setConfirmAction(null)}
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
                                    onClick={() => setConfirmAction(null)}
                                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                                >
                                    <X size={24} />
                                </button>

                                <div className={`flex justify-center mb-4 ${confirmAction.type === 'unban' ? 'text-green-500' : 'text-red-500'}`}>
                                    {confirmAction.type === 'ban' ? <Ban size={48} /> : confirmAction.type === 'unban' ? <Unlock size={48} /> : <Trash2 size={48} />}
                                </div>

                                <h3 className="font-pixel text-3xl mb-2 text-pixel-dark capitalize">{confirmAction.type} User?</h3>

                                <p className="font-pixel text-xl text-gray-600 mb-6">
                                    {confirmAction.type === 'ban'
                                        ? `Are you sure you want to ban ${confirmAction.username}? They will be logged out immediately.`
                                        : confirmAction.type === 'unban'
                                            ? `Are you sure you want to unban ${confirmAction.username}? They will be allowed to login again.`
                                            : `Are you sure you want to permanently delete ${confirmAction.username}'s account?`}
                                </p>

                                <div className="flex flex-col gap-3">
                                    <PixelButton
                                        onClick={executeUserAction}
                                        variant={confirmAction.type === 'unban' ? 'primary' : 'danger'}
                                        className={confirmAction.type === 'unban' ? '!bg-green-500 !text-white hover:!bg-green-600' : ''}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? (
                                            <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={20} /> Processing...</span>
                                        ) : (
                                            `Yes, ${confirmAction.type === 'ban' ? 'Ban User' : confirmAction.type === 'unban' ? 'Unban User' : 'Delete User'}`
                                        )}
                                    </PixelButton>
                                    <PixelButton variant="secondary" onClick={() => setConfirmAction(null)} disabled={actionLoading}>
                                        Cancel
                                    </PixelButton>
                                </div>
                            </PixelCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Series Delete Confirmation Modal */}
            <AnimatePresence>
                {confirmDeleteSeries && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setConfirmDeleteSeries(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-sm"
                        >
                            <PixelCard className="text-center border-2 border-pixel-dark shadow-pixel-lg">
                                <div className="flex justify-center mb-4 text-red-500">
                                    <div className="relative">
                                        <Trash2 size={48} />
                                        <div className="absolute -top-1 -right-1 text-pixel-gold animate-bounce">
                                            <AlertTriangle size={24} fill="currentColor" className="text-yellow-400 stroke-pixel-dark" />
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-pixel uppercase mb-4 text-pixel-dark">Delete Series?</h3>
                                <p className="font-pixel text-lg text-gray-700 mb-6">
                                    Are you sure you want to delete <span className="font-bold text-pixel-pink">{confirmDeleteSeries.name}</span>?
                                    <br />
                                    <span className="text-sm text-gray-500">This will NOT affect existing sets.</span>
                                </p>

                                <div className="flex flex-col gap-3">
                                    <PixelButton
                                        onClick={executeDeleteSeries}
                                        variant="danger"
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? (
                                            <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={20} /> Deleting...</span>
                                        ) : (
                                            'Yes, Delete It'
                                        )}
                                    </PixelButton>
                                    <PixelButton variant="secondary" onClick={() => setConfirmDeleteSeries(null)} disabled={actionLoading}>
                                        Cancel
                                    </PixelButton>
                                </div>
                            </PixelCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <PixelModal
                isOpen={alertState.open}
                onClose={closeAlert}
                title={alertState.title}
                icon={alertState.type === 'success' ? <Check size={48} /> : <AlertTriangle size={48} />}
            >
                {alertState.message}
            </PixelModal>


            {/* Set Delete Confirmation Modal */}
            <AnimatePresence>
                {confirmDeleteSet && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setConfirmDeleteSet(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-sm"
                        >
                            <PixelCard className="text-center border-2 border-pixel-dark shadow-pixel-lg">
                                <div className="flex justify-center mb-4 text-red-500">
                                    <div className="relative">
                                        <Trash2 size={48} />
                                        <div className="absolute -top-1 -right-1 text-pixel-gold animate-bounce">
                                            <AlertTriangle size={24} fill="currentColor" className="text-yellow-400 stroke-pixel-dark" />
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-pixel uppercase mb-4 text-pixel-dark">Delete Set?</h3>
                                <p className="font-pixel text-lg text-gray-700 mb-6">
                                    Are you sure you want to delete <span className="font-bold text-pixel-pink">{confirmDeleteSet.name}</span>?
                                    <br />
                                    <span className="text-sm text-gray-500">This action cannot be undone.</span>
                                </p>

                                <div className="flex flex-col gap-3">
                                    <PixelButton
                                        onClick={executeDeleteSet}
                                        variant="danger"
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? (
                                            <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={20} /> Deleting...</span>
                                        ) : (
                                            'Yes, Delete It'
                                        )}
                                    </PixelButton>
                                    <PixelButton variant="secondary" onClick={() => setConfirmDeleteSet(null)} disabled={actionLoading}>
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

export default Admin;
