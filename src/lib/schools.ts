import { supabase } from './supabase';

export interface School {
  id: string;
  name: string;
  city: string;
  state: string;
  type: 'public' | 'private' | 'community';
}

export async function searchSchools(query: string): Promise<School[]> {
  if (!query || query.length < 2) return [];

  try {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(10);

    if (error) {
      console.error('Error searching schools:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error searching schools:', error);
    return [];
  }
}