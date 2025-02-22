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
      .or(`name.ilike.%${query}%,city.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching schools:', error);
    return [];
  }
}

// Initialize schools table with data from Department of Education
export async function initializeSchoolsDatabase() {
  const SCHOOLS_API = 'https://api.data.gov/ed/collegescorecard/v1/schools';
  const API_KEY = import.meta.env.VITE_ED_GOV_API_KEY;

  try {
    const response = await fetch(`${SCHOOLS_API}?api_key=${API_KEY}&fields=school.name,school.city,school.state,school.ownership`);
    const data = await response.json();

    const schools = data.results.map((result: any) => ({
      name: result['school.name'],
      city: result['school.city'],
      state: result['school.state'],
      type: result['school.ownership'] === 1 ? 'public' : 'private'
    }));

    const { error } = await supabase
      .from('schools')
      .upsert(schools, { onConflict: 'name' });

    if (error) throw error;
  } catch (error) {
    console.error('Error initializing schools database:', error);
  }
}
