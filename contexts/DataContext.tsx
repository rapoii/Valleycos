
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { CosplaySet, User, Series, SocialLinks, ChatMessage } from '../types';
import { api } from '../services/api';
import { supabase } from '../src/lib/supabaseClient';

interface DataContextType {
  cosplaySets: CosplaySet[];
  seriesList: Series[];
  currentUser: User | null;
  users: User[];
  socialLinks: SocialLinks;
  globalChatMessages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Auth
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (userData: { username: string; email: string; password: string; dob: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateUser: (userId: string, data: Partial<User>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  uploadSetImage: (file: File) => Promise<string>;
  deleteAccount: (userId: string) => Promise<void>;
  banUser: (userId: string) => Promise<void>;
  unbanUser: (userId: string) => Promise<void>;
  deleteUserAdmin: (userId: string) => Promise<void>;

  // Data Management Sets
  addSet: (set: CosplaySet) => Promise<void>;
  deleteSet: (id: string) => Promise<void>;
  updateSet: (set: CosplaySet) => Promise<void>;
  getSetById: (id: string) => CosplaySet | undefined;

  // Data Management Series
  addSeries: (name: string) => Promise<void>;
  updateSeries: (id: string, name: string) => Promise<void>;
  deleteSeries: (id: string) => Promise<void>;

  // Social
  toggleLikePhoto: (setId: string, photoId: string) => Promise<void>;
  toggleSavePhoto: (photoId: string) => Promise<void>;
  addComment: (setId: string, photoId: string, text: string) => Promise<void>;
  deleteComment: (setId: string, photoId: string, commentId: string) => Promise<void>;

  // Global Chat
  sendGlobalMessage: (text: string) => Promise<void>;
  deleteGlobalMessage: (messageId: string) => Promise<void>;
  refreshChat: () => Promise<void>;

  // Social Links Management
  updateSocialLinks: (links: SocialLinks) => Promise<void>;

  // Utilities
  clearError: () => void;
  refreshData: () => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEFAULT_SOCIALS: SocialLinks = {
  instagram: '',
  tiktok: '',
  email: ''
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial state from localStorage to prevent content flash / scroll matching issues
  const [cosplaySets, setCosplaySets] = useState<CosplaySet[]>(() => {
    try {
      const saved = localStorage.getItem('pixel_sets');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [seriesList, setSeriesList] = useState<Series[]>(() => {
    try {
       const saved = localStorage.getItem('pixel_series');
       return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [users, setUsers] = useState<User[]>([]);
  
  // Optimistic UI: Load from localStorage first to prevent flash
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('pixel_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [socialLinks, setSocialLinks] = useState<SocialLinks>(() => {
      try {
         const saved = localStorage.getItem('pixel_socials');
         return saved ? JSON.parse(saved) : DEFAULT_SOCIALS;
      } catch { return DEFAULT_SOCIALS; }
  });

  const [globalChatMessages, setGlobalChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // --- Persistence Effects ---
  useEffect(() => {
    try { localStorage.setItem('pixel_sets', JSON.stringify(cosplaySets)); } catch {}
  }, [cosplaySets]);

  useEffect(() => {
    try { localStorage.setItem('pixel_series', JSON.stringify(seriesList)); } catch {}
  }, [seriesList]);

  useEffect(() => {
     try { localStorage.setItem('pixel_socials', JSON.stringify(socialLinks)); } catch {}
  }, [socialLinks]);

  // Sync user state to localStorage
  useEffect(() => {
    if (currentUser) {
        localStorage.setItem('pixel_user', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('pixel_user');
    }
  }, [currentUser]);

  const clearError = () => setError(null);

  // --- Load public data ---
  const loadPublicData = useCallback(async () => {
    try {
      console.log("⏳ [LoadPublicData] Fetching sets...");
      const setsData = await api.getSets();
      console.log("✅ [LoadPublicData] Sets loaded:", setsData.length);

      console.log("⏳ [LoadPublicData] Fetching series...");
      const seriesData = await api.getSeries();

      console.log("⏳ [LoadPublicData] Fetching socials...");
      const socialsData = await api.getSocialLinks();

      setCosplaySets(setsData);
      setSeriesList(seriesData);
      setSocialLinks(socialsData);
    } catch (e: any) {
      console.error('Load data error:', e);
      setError('Failed to load data. Please check connection.');
    }
  }, []);

  // --- Init ---
  useEffect(() => {
    const init = async () => {
      console.log("🚀 DataContext initializing...");
      setIsLoading(true);

      try {
        await loadPublicData();

        // Supabase Auth Check
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            try {
                const user = await (api as any).getUserProfile(session.user.id, session.user.email);
                setCurrentUser(user);
            } catch (e) {
                console.error("Failed to load user profile", e);
            }
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                 const user = await (api as any).getUserProfile(session.user.id, session.user.email);
                 setCurrentUser(user);
            } else {
                setCurrentUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };

      } catch (err) {
        console.error("❌ Init failed:", err);
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    init();
  }, [loadPublicData]);

  // --- Chat Realtime & Polling ---
  useEffect(() => {
    // Initial fetch
    refreshChat();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('public:chat_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, payload => {
          refreshChat(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);



  // --- Refresh Helpers ---
  const refreshData = useCallback(async () => {
    await loadPublicData();
  }, [loadPublicData]);

  const refreshUsers = useCallback(async () => {
    if (!currentUser?.isAdmin) return;
    try {
      const usersData = await api.getUsers();
      setUsers(usersData);
    } catch (e: any) {
      console.error('Refresh users error:', e);
    }
  }, [currentUser?.isAdmin]);

  const refreshChat = useCallback(async () => {
    try {
      const messages = await api.getChat();
      setGlobalChatMessages(messages);
    } catch (e: any) {
      console.error('Refresh chat error:', e);
    }
  }, []);

  // --- Auth Functions ---
  const signup = async (userData: { username: string; email: string; password: string; dob: string }) => {
    try {
      const user = await api.signup(userData);
      setCurrentUser(user);
      return { success: true, message: 'Welcome to PixelHeart!' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Signup failed' };
    }
  };

  const login = async (identifier: string, password: string) => {
    try {
      // Identifier is treated as email
      const user = await (api as any).signInWithPassword(identifier, password);
      setCurrentUser(user);
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message || 'Login failed' };
    }
  };

  const logout = async () => {
    await api.logout();
    setCurrentUser(null);
    setGlobalChatMessages([]);
  };

  const updateUser = async (userId: string, data: Partial<User>) => {
    try {
      const updates = { ...data, id: userId };
      const updatedUser = await api.updateProfile(updates);
      if (currentUser && currentUser.id === userId) {
        const newUser = { ...currentUser, ...updatedUser };
        setCurrentUser(newUser);
        // Let the useEffect handle the localStorage sync
      }
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
     try {
       return await (api as any).uploadAvatar(file);
     } catch(e: any) {
       setError(e.message);
       throw e;
     }
  };

  const uploadSetImage = async (file: File): Promise<string> => {
    try {
      return await (api as any).uploadSetImage(file);
    } catch(e: any) {
      setError(e.message);
      throw e;
    }
 };

  const deleteAccount = async (userId: string) => {
    try {
      if (!currentUser) return;
      await api.deleteUser(currentUser.id); // API deleteUser handles deletion
      await logout();
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  const banUser = async (userId: string) => {
    try {
      await api.banUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: true } : u));
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      await api.unbanUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: false } : u));
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  const deleteUserAdmin = async (userId: string) => {
    try {
      await api.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  // --- Data Management: Sets ---
  const addSet = async (set: CosplaySet) => {
    try {
      await api.addSet(set);
      setCosplaySets(prev => [set, ...prev]);
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  const updateSet = async (updatedSet: CosplaySet) => {
    try {
      await api.updateSet(updatedSet);
      setCosplaySets(prev => prev.map(set => set.id === updatedSet.id ? updatedSet : set));
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  const deleteSet = async (id: string) => {
    try {
      await api.deleteSet(id);
      setCosplaySets(prev => prev.filter(item => item.id !== id));
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  const getSetById = (id: string) => {
    return cosplaySets.find(s => s.id === id);
  };

  // --- Data Management: Series ---
  const addSeries = async (name: string) => {
    try {
      const id = await api.addSeries(name);
      setSeriesList(prev => [...prev, { id, name: name.trim() }]);
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  const updateSeries = async (id: string, name: string) => {
    try {
      await api.updateSeries(id, name);
      setSeriesList(prev => prev.map(s => s.id === id ? { ...s, name: name.trim() } : s));
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  const deleteSeries = async (id: string) => {
    try {
      await api.deleteSeries(id);
      setSeriesList(prev => prev.filter(s => s.id !== id));
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  // --- Social Features ---
  const toggleLikePhoto = async (setId: string, photoId: string) => {
    if (!currentUser) return;

    try {
      const response = await api.toggleLike(photoId, currentUser.id);
      const { liked } = response;

      setCosplaySets(prevSets => prevSets.map(set => {
        if (set.id !== setId) return set;
        const updatedPhotos = set.photos.map(photo => {
          if (photo.id !== photoId) return photo;
          const likes = photo.likes || [];
          return {
            ...photo,
            likes: liked
              ? [...likes, currentUser.id]
              : likes.filter(id => id !== currentUser.id)
          };
        });
        return { ...set, photos: updatedPhotos };
      }));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const toggleSavePhoto = async (photoId: string) => {
    if (!currentUser) return;

    try {
      const result = await api.toggleSave(photoId, currentUser.id);

      const newSavedPhotos = result.savedPhotos || [];
      const isSaved = result.saved;

      setCurrentUser(prev => prev ? { ...prev, savedPhotos: newSavedPhotos } : null);
      // Update local storage
      if (currentUser) {
        localStorage.setItem('pixelheart_user', JSON.stringify({ ...currentUser, savedPhotos: newSavedPhotos }));
      }

      setCosplaySets(prevSets => prevSets.map(set => ({
        ...set,
        photos: set.photos.map(p => {
          if (p.id !== photoId) return p;
          const wasSaved = (currentUser.savedPhotos || []).includes(photoId);
          let newCount = p.saveCount || 0;

          if (isSaved && !wasSaved) {
            newCount++;
          } else if (!isSaved && wasSaved) {
            newCount = Math.max(0, newCount - 1);
          }

          return { ...p, saveCount: newCount };
        })
      })));

    } catch (e: any) {
      setError(e.message);
    }
  };

  const addComment = async (setId: string, photoId: string, text: string) => {
    if (!currentUser) return;

    try {
      const newComment = await api.addComment(setId, photoId, text, currentUser.id, currentUser.username);

      setCosplaySets(prevSets => prevSets.map(set => {
        if (set.id !== setId) return set;
        const updatedPhotos = set.photos.map(photo => {
          if (photo.id !== photoId) return photo;
          return {
            ...photo,
            comments: [newComment, ...(photo.comments || [])]
          };
        });
        return { ...set, photos: updatedPhotos };
      }));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const deleteComment = async (setId: string, photoId: string, commentId: string) => {
    if (!currentUser) return;

    try {
      await api.deleteComment(commentId);

      setCosplaySets(prevSets => prevSets.map(set => {
        if (set.id !== setId) return set;
        const updatedPhotos = set.photos.map(photo => {
          if (photo.id !== photoId) return photo;
          return {
            ...photo,
            comments: (photo.comments || []).filter(c => c.id !== commentId)
          };
        });
        return { ...set, photos: updatedPhotos };
      }));
    } catch (e: any) {
      setError(e.message);
    }
  };

  // --- Global Chat ---
  const sendGlobalMessage = async (text: string) => {
    if (!currentUser) return;
    try {
      await api.sendChat(text, currentUser.id, currentUser.username, currentUser.profilePicture || '', currentUser.isAdmin);
      refreshChat(); // Immediate refresh
    } catch (e: any) {
      setError(e.message);
    }
  };

  const deleteGlobalMessage = async (messageId: string) => {
    if (!currentUser) return;
    try {
      await api.deleteChat(messageId);
      refreshChat();
    } catch (e: any) {
      setError(e.message);
    }
  };

  // --- Social Links ---
  const updateSocialLinks = async (links: SocialLinks) => {
    try {
      await api.updateSocialLinks(links);
      setSocialLinks(links);
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  return (
    <DataContext.Provider value={{
      cosplaySets,
      seriesList,
      currentUser,
      users,
      socialLinks,
      globalChatMessages,
      isLoading,
      error,
      isInitialized,
      login,
      signup,
      logout,
      updateUser,
      uploadAvatar,
      uploadSetImage,
      deleteAccount,
      banUser,
      unbanUser,
      deleteUserAdmin,
      addSet,
      deleteSet,
      updateSet,
      getSetById,
      addSeries,
      updateSeries,
      deleteSeries,
      toggleLikePhoto,
      toggleSavePhoto,
      addComment,
      deleteComment,
      sendGlobalMessage,
      deleteGlobalMessage,
      refreshChat,
      updateSocialLinks,
      clearError,
      refreshData,
      refreshUsers
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};
