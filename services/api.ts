import { supabase } from '../src/lib/supabaseClient';
import { CosplaySet, User, Series, SocialLinks, ChatMessage, Comment, CosplayPhoto } from '../types';

// Helper to check for errors
const handleError = (error: any) => {
  if (error) {
    console.error("Supabase Error:", error);
    throw new Error(error.message || "An error occurred");
  }
};

export const api = {
  // --- Sets ---
  getSets: async (): Promise<CosplaySet[]> => {
    const { data, error } = await supabase
      .from('cosplay_sets')
      .select(`
        *,
        series:series_id (name),
        photos (
          *,
          comments (*),
          photo_likes (user_id)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) handleError(error);

    return (data || []).map((set: any) => ({
      id: set.id.toString(),
      character: set.character,
      series: set.series?.name || 'Unknown',
      date: set.date,
      coverImage: set.cover_image,
      description: set.description,
      featured: set.featured,
      photos: (set.photos || []).map((p: any) => ({
        id: p.id.toString(),
        url: p.url,
        caption: p.caption,
        saveCount: p.save_count,
        likes: (p.photo_likes || []).map((l: any) => l.user_id),
        comments: (p.comments || []).map((c: any) => ({
          id: c.id.toString(),
          userId: c.user_id,
          username: 'User', // Would need another join or fetch, optimized generally by generic 'User' or store username in comment
          text: c.text,
          date: c.created_at
        }))
      }))
    }));
  },

  getSetById: async (id: string): Promise<CosplaySet | undefined> => {
     const sets = await api.getSets();
     return sets.find(s => s.id === id);
  },

  addSet: async (set: CosplaySet): Promise<void> => {
    // 1. Get Series ID
    const { data: seriesData } = await supabase.from('series').select('id').eq('name', set.series).maybeSingle();
    let seriesId = seriesData?.id;

    if (!seriesId) {
       // Create series if not exists (optional, or throw)
       const { data: stringData, error } = await supabase.from('series').insert({name: set.series}).select().single();
       if (error) {
           throw new Error("Could not create Series: " + error.message);
       }
       seriesId = stringData.id;
    }

    // 2. Insert Set
    const { data: newSet, error: setError } = await supabase
      .from('cosplay_sets')
      .insert({
        character: set.character,
        series_id: seriesId,
        date: set.date,
        cover_image: set.coverImage,
        description: set.description,
        featured: set.featured
      })
      .select()
      .maybeSingle();
    
    if (setError) {
      throw new Error("Failed to create Set: " + setError.message);
    }
    if (!newSet) throw new Error("Create Set succeeded but returned no data.");

    // 3. Insert Photos
    if (set.photos && set.photos.length > 0) {
      const photosToInsert = set.photos.map(p => ({
        set_id: newSet.id,
        url: p.url,
        caption: p.caption || '',
        save_count: 0
      }));
      
      const { error: photoError } = await supabase.from('photos').insert(photosToInsert);
      if (photoError) {
         throw new Error("Set created but photos failed: " + photoError.message);
      }
    }
  },

  updateSet: async (set: CosplaySet): Promise<void> => {
     // 1. Get Series ID or Create if not exists
     let seriesId: string | undefined;
     const { data: seriesData } = await supabase.from('series').select('id').eq('name', set.series).maybeSingle();
     
     if (seriesData) {
         seriesId = seriesData.id;
     } else {
         // Create new series
         const { data: newSeries, error: seriesError } = await supabase.from('series').insert({name: set.series}).select().single();
         if (seriesError) handleError(seriesError);
         seriesId = newSeries.id;
     }
     
     // 2. Update Set Metadata
     const { error: updateError } = await supabase
      .from('cosplay_sets')
      .update({
        character: set.character,
        series_id: seriesId,
        date: set.date,
        cover_image: set.coverImage,
        description: set.description,
        featured: set.featured
      })
      .eq('id', set.id);
    
    if (updateError) handleError(updateError);

    // 3. Smart Sync Photos (Preserve Likes/Saves)
    if (set.photos) {
        // A. Identify which IDs to keep (Real IDs are numeric integers, Temp IDs start with 'photo-')
        // We assume IDs from DB are strings of numbers. Temp IDs are 'photo-...'.
        const photosToKeep = set.photos.filter(p => !p.id.toString().startsWith('photo-'));
        const photoIdsToKeep = photosToKeep.map(p => p.id);

        // B. DELETE photos in DB that are NOT in our "Keep List" for this set
        // Be careful: if photoIdsToKeep is empty, we delete ALL photos for this set.
        let deleteQuery = supabase.from('photos').delete().eq('set_id', set.id);
        
        if (photoIdsToKeep.length > 0) {
            deleteQuery = deleteQuery.not('id', 'in', `(${photoIdsToKeep.join(',')})`);
        }
        
        const { error: deleteError } = await deleteQuery;
        if (deleteError) handleError(deleteError);

        // C. UPSERT / INSERT remaining photos
        for (const p of set.photos) {
            if (p.id.toString().startsWith('photo-')) {
                // It's a NEW photo -> INSERT
                const { error: insertError } = await supabase.from('photos').insert({
                    set_id: set.id,
                    url: p.url,
                    caption: p.caption || '',
                    save_count: 0
                });
                if (insertError) handleError(insertError);
            } else {
                // It's an EXISTING photo -> UPDATE (just caption/url, preserve counts)
                const { error: updatePhotoError } = await supabase.from('photos').update({
                    url: p.url,
                    caption: p.caption || ''
                }).eq('id', p.id);
                if (updatePhotoError) handleError(updatePhotoError);
            }
        }
    }
  },

  deleteSet: async (id: string): Promise<void> => {
    const { error } = await supabase.from('cosplay_sets').delete().eq('id', id);
    if (error) handleError(error);
  },

  // --- Series ---
  getSeries: async (): Promise<Series[]> => {
    const { data, error } = await supabase.from('series').select('*').order('name');
    if (error) handleError(error);
    return (data || []).map((s: any) => ({
      id: s.id.toString(),
      name: s.name
    }));
  },

  addSeries: async (name: string): Promise<string> => {
    const { data, error } = await supabase.from('series').insert({ name }).select().single();
    if (error) handleError(error);
    return data.id.toString();
  },

  updateSeries: async (id: string, name: string): Promise<void> => {
    const { error } = await supabase.from('series').update({ name }).eq('id', id);
    if (error) handleError(error);
  },

  deleteSeries: async (id: string): Promise<void> => {
    const { error } = await supabase.from('series').delete().eq('id', id);
    if (error) handleError(error);
  },

  // --- Social Links ---
  getSocialLinks: async (): Promise<SocialLinks> => {
    const { data } = await supabase.from('social_links').select('*').limit(1).maybeSingle();
    if (!data) return { instagram: '', tiktok: '', email: '' }; // Fallback
    return {
      instagram: data.instagram,
      tiktok: data.tiktok,
      email: data.email
    };
  },

  updateSocialLinks: async (links: SocialLinks): Promise<void> => {
    const { data } = await supabase.from('social_links').select('id').limit(1).maybeSingle();
    
    if (data) {
        await supabase.from('social_links').update(links).eq('id', data.id);
    } else {
        await supabase.from('social_links').insert(links);
    }
  },

  // --- Chat ---
  getChat: async (): Promise<ChatMessage[]> => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        profiles (username, avatar_url, is_admin)
      `)
      .order('created_at', { ascending: true })
      .limit(50); 
      
    if (error) handleError(error);

    return (data || []).map((msg: any) => ({
      id: msg.id.toString(),
      userId: msg.user_id,
      username: msg.profiles?.username || 'Unknown',
      text: msg.text,
      timestamp: msg.created_at,
      isAdmin: msg.profiles?.is_admin || false,
      profilePicture: msg.profiles?.avatar_url
    }));
  },

  sendChat: async (text: string, userId: string, username: string, profilePicture: string, isAdmin: boolean): Promise<void> => {
    // Note: userId is strictly enforced by RLS to match auth.uid() usually.
    // The arguments username/profilePicture/isAdmin are ignored as they are derived from profile relation
    const { error } = await supabase.from('chat_messages').insert({
        user_id: userId,
        text: text
    });
    if (error) handleError(error);
  },

  deleteChat: async (id: string): Promise<void> => {
    const { error } = await supabase.from('chat_messages').delete().eq('id', id);
    if (error) handleError(error);
  },

  // --- Users & Auth ---
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) handleError(error);
    
    return Promise.all((data || []).map(async (p: any) => {
        return {
            id: p.id,
            username: p.username,
            email: '', 
            dob: '',
            isAdmin: p.is_admin,
            isBanned: p.is_banned,
            savedPhotos: [],
            profilePicture: p.avatar_url
        };
    }));
  },

  getUserProfile: async (userId: string, email: string): Promise<User> => {
    const { data, error } = await supabase
        .from('profiles') 
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle to avoid 406 if not found immediately
    
    if (error) handleError(error);
    if (!data) throw new Error("Profile not found");
    
    const { data: saved } = await supabase
        .from('saved_photos')
        .select('photo_id')
        .eq('user_id', userId);
    
    const savedIds = (saved || []).map((s: any) => s.photo_id.toString());

    return {
        id: data.id,
        username: data.username,
        email: email,
        dob: data.dob || '',
        isAdmin: data.is_admin,
        isBanned: data.is_banned,
        savedPhotos: savedIds,
        profilePicture: data.avatar_url
    };
  },

  // Actual login implementation
  signInWithPassword: async (identifier: string, password: string): Promise<User> => {
    let email = identifier;

    // Determine if identifier is an email
    if (!identifier.includes('@')) {
      // Treat as username -> lookup email
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', identifier)
        .maybeSingle();

      if (error || !data || !data.email) {
        throw new Error("Username not found");
      }
      email = data.email;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) throw error;
    if (!data.user) throw new Error("No user returned");

    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles') 
        .select('*')
        .eq('id', data.user.id)
        .single();
    
    // Fetch Saved Photos
    const { data: saved } = await supabase
        .from('saved_photos')
        .select('photo_id')
        .eq('user_id', data.user.id);
    
    const savedIds = (saved || []).map((s: any) => s.photo_id.toString());

    return {
        id: data.user.id,
        username: profile?.username || email.split('@')[0],
        email: email,
        dob: profile?.dob || '',
        isAdmin: profile?.is_admin || false,
        isBanned: profile?.is_banned || false,
        savedPhotos: savedIds,
        profilePicture: profile?.avatar_url
    };
  },

  signup: async (userData: { username: string; email: string; password: string; dob: string }): Promise<User> => {
    const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
            data: {
                username: userData.username,
                dob: userData.dob,
                avatar_url: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${userData.username}`
            }
        }
    });

    if (error) throw error;
    if (!data.user) throw new Error("Signup failed");
    
    return {
        id: data.user.id,
        username: userData.username,
        email: userData.email,
        dob: userData.dob,
        isAdmin: false,
        savedPhotos: [],
        profilePicture: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${userData.username}`
    };
  },

  logout: async (): Promise<void> => {
    await supabase.auth.signOut();
  },

  updateProfile: async (user: Partial<User> & { id: string }): Promise<Partial<User>> => {
    const updates: any = {};
    if (user.username) updates.username = user.username;
    if (user.profilePicture) updates.avatar_url = user.profilePicture;
    
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (error) handleError(error);
    
    return user;
  },

  uploadAvatar: async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  },

  uploadSetImage: async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Ensure bucket exists or use 'cosplay-images'
    const { error: uploadError } = await supabase.storage
      .from('cosplay_images') 
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from('cosplay_images').getPublicUrl(filePath);
    return data.publicUrl;
  },

  deleteUser: async (id: string): Promise<void> => {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) handleError(error);
  },

  banUser: async (id: string): Promise<void> => {
    const { error } = await supabase.from('profiles').update({ is_banned: true }).eq('id', id);
    if (error) handleError(error);
  },

  unbanUser: async (id: string): Promise<void> => {
    const { error } = await supabase.from('profiles').update({ is_banned: false }).eq('id', id);
    if (error) handleError(error);
  },

  // --- Actions ---
  toggleLike: async (photoId: string, userId: string): Promise<{ liked: boolean }> => {
    // Check current state
    const { data } = await supabase
        .from('photo_likes')
        .select('*')
        .eq('photo_id', photoId)
        .eq('user_id', userId)
        .maybeSingle();
    
    if (data) {
        // Unlike
        await supabase.from('photo_likes').delete().eq('user_id', userId).eq('photo_id', photoId);
        return { liked: false };
    } else {
        // Like
        await supabase.from('photo_likes').insert({ user_id: userId, photo_id: photoId });
        return { liked: true };
    }
  },

  toggleSave: async (photoId: string, userId: string): Promise<{ saved: boolean, savedPhotos: string[] }> => {
     const { data } = await supabase
        .from('saved_photos')
        .select('*')
        .eq('photo_id', photoId)
        .eq('user_id', userId)
        .maybeSingle();
    
    if (data) {
        await supabase.from('saved_photos').delete().eq('user_id', userId).eq('photo_id', photoId);
        // Decrement count efficiently using RPC (requires SQL setup)
        await supabase.rpc('decrement_save_count', { row_id: photoId });
    } else {
        await supabase.from('saved_photos').insert({ user_id: userId, photo_id: photoId });
        // Increment count efficiently using RPC (requires SQL setup)
        await supabase.rpc('increment_save_count', { row_id: photoId });
    }

    // Return new list
    const { data: allSaved } = await supabase.from('saved_photos').select('photo_id').eq('user_id', userId);
    return {
        saved: !data,
        savedPhotos: (allSaved || []).map((s: any) => s.photo_id.toString())
    };
  },

  addComment: async (setId: string, photoId: string, text: string, userId: string, username: string): Promise<Comment> => {
    // Note: username arg ignored, used form Profile relation normally, but stored/returned here
    const { data, error } = await supabase
        .from('comments')
        .insert({
            photo_id: photoId,
            user_id: userId,
            text: text
        })
        .select()
        .single();
    
    if (error) handleError(error);

    return {
        id: data.id.toString(),
        userId: userId,
        username: username, 
        text: data.text,
        date: data.created_at
    };
  },

  deleteComment: async (commentId: string): Promise<void> => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) handleError(error);
  }
};


