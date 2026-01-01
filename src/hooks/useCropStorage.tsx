import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CropStorage {
  id: string;
  user_id: string;
  crop_name: string;
  quantity: string;
  unit: string;
  location: string;
  storage_type: string;
  stored_date: string;
  condition: string;
  moisture: string | null;
  temperature: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewCropStorage {
  crop_name: string;
  quantity: string;
  unit: string;
  location: string;
  storage_type: string;
  stored_date?: string;
  condition?: string;
  moisture?: string;
  temperature?: string;
  notes?: string;
}

export function useCropStorage() {
  const [storageItems, setStorageItems] = useState<CropStorage[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchStorageItems();
    }
  }, [userId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUserId(session.user.id);
    } else {
      setLoading(false);
    }
  };

  const fetchStorageItems = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('crop_storage')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStorageItems(data || []);
    } catch (err) {
      console.error('Error fetching storage items:', err);
      toast.error('গুদাম ডেটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const addStorageItem = async (item: NewCropStorage) => {
    if (!userId) {
      toast.error('প্রথমে লগইন করুন');
      return false;
    }

    try {
      const { error } = await supabase
        .from('crop_storage')
        .insert({
          user_id: userId,
          ...item,
        });

      if (error) throw error;
      
      toast.success('ফসল সংরক্ষণ যোগ করা হয়েছে');
      await fetchStorageItems();
      return true;
    } catch (err) {
      console.error('Error adding storage item:', err);
      toast.error('ফসল যোগ করতে সমস্যা হয়েছে');
      return false;
    }
  };

  const updateStorageItem = async (id: string, updates: Partial<NewCropStorage>) => {
    if (!userId) {
      toast.error('প্রথমে লগইন করুন');
      return false;
    }

    try {
      const { error } = await supabase
        .from('crop_storage')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      
      toast.success('তথ্য আপডেট করা হয়েছে');
      await fetchStorageItems();
      return true;
    } catch (err) {
      console.error('Error updating storage item:', err);
      toast.error('আপডেট করতে সমস্যা হয়েছে');
      return false;
    }
  };

  const deleteStorageItem = async (id: string) => {
    if (!userId) {
      toast.error('প্রথমে লগইন করুন');
      return false;
    }

    try {
      const { error } = await supabase
        .from('crop_storage')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      
      toast.success('ফসল সংরক্ষণ মুছে ফেলা হয়েছে');
      await fetchStorageItems();
      return true;
    } catch (err) {
      console.error('Error deleting storage item:', err);
      toast.error('মুছে ফেলতে সমস্যা হয়েছে');
      return false;
    }
  };

  const getStats = () => {
    const totalCrops = storageItems.length;
    const uniqueLocations = new Set(storageItems.map(item => item.location)).size;
    const warnings = storageItems.filter(item => item.condition === 'warning' || item.condition === 'danger').length;
    return { totalCrops, uniqueLocations, warnings };
  };

  return {
    storageItems,
    loading,
    userId,
    addStorageItem,
    updateStorageItem,
    deleteStorageItem,
    getStats,
    refetch: fetchStorageItems,
  };
}
