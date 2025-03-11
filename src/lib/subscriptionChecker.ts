// src/lib/subscriptionChecker.ts
import { supabase } from './supabase';

/**
 * Utility to check subscription table structure and content
 */
export async function checkSubscriptionDatabase() {
  try {
    // First check if the subscriptions table exists
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables');
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return { 
        success: false, 
        error: tablesError,
        message: 'Failed to query database tables'
      };
    }
    
    const hasSubscriptionsTable = tables.some(
      (table: { name: string }) => table.name === 'subscriptions'
    );
    
    if (!hasSubscriptionsTable) {
      return {
        success: false,
        error: null,
        message: 'Subscriptions table does not exist',
        tables
      };
    }
    
    // Check table structure
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'subscriptions' });
    
    if (columnsError) {
      console.error('Error checking table structure:', columnsError);
      return { 
        success: false, 
        error: columnsError,
        message: 'Failed to query table structure'
      };
    }
    
    // Check for all subscriptions (admin only)
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('*');
    
    if (subscriptionsError) {
      console.error('Error querying subscriptions:', subscriptionsError);
      return { 
        success: false, 
        error: subscriptionsError,
        message: 'Failed to query subscriptions'
      };
    }
    
    return {
      success: true,
      tables,
      tableExists: hasSubscriptionsTable,
      columns,
      subscriptionCount: subscriptions?.length || 0,
      subscriptions
    };
  } catch (error) {
    console.error('Exception in checkSubscriptionDatabase:', error);
    return { 
      success: false, 
      error,
      message: 'Exception occurred while checking database'
    };
  }
}

/**
 * Alternative function that uses straight SQL if RPC functions aren't available
 */
export async function checkDatabaseAlternative() {
  try {
    // Check subscriptions table content
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('*');
    
    if (subscriptionsError) {
      if (subscriptionsError.code === 'PGRST116') {
        return {
          success: false,
          error: subscriptionsError,
          message: 'Subscriptions table does not exist'
        };
      }
      
      console.error('Error querying subscriptions:', subscriptionsError);
      return { 
        success: false, 
        error: subscriptionsError,
        message: 'Failed to query subscriptions'
      };
    }
    
    return {
      success: true,
      subscriptionCount: subscriptions?.length || 0,
      subscriptions
    };
  } catch (error) {
    console.error('Exception in checkDatabaseAlternative:', error);
    return { 
      success: false, 
      error,
      message: 'Exception occurred while checking database'
    };
  }
}