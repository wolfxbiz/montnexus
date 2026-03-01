import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export function useActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchActivities = useCallback(async (entityType, entityId) => {
    setLoading(true);
    const { data } = await supabase
      .from('crm_activities')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });
    setActivities(data || []);
    setLoading(false);
  }, []);

  const logActivity = async ({ entity_type, entity_id, type, content, metadata }) => {
    const { data, error } = await supabase
      .from('crm_activities')
      .insert([{ entity_type, entity_id, type, content, metadata }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    setActivities(prev => [data, ...prev]);
    return data;
  };

  return { activities, loading, fetchActivities, logActivity };
}
