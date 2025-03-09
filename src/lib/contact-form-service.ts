// src/lib/contact-form-service.ts
import { supabase } from './supabase';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  organization?: string;
}

interface SubscriptionData {
  email: string;
}

/**
 * Submits a contact form to the database
 */
export async function submitContactForm(formData: ContactFormData): Promise<{ success: boolean; error?: string }> {
  try {
    // Insert data into the 'contact_submissions' table
    const { error } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
          organization: formData.organization || null,
          submitted_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    console.error('Error submitting contact form:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Subscribes an email to the newsletter
 */
export async function subscribeToNewsletter(data: SubscriptionData): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if email already exists
    const { data: existingSubscriber, error: checkError } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', data.email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is expected if email doesn't exist
      throw checkError;
    }

    // If subscriber already exists, return success without inserting
    if (existingSubscriber) {
      return { success: true };
    }

    // Insert new subscriber
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([
        {
          email: data.email,
          subscribed_at: new Date().toISOString(),
          active: true
        }
      ]);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    console.error('Error subscribing to newsletter:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Unsubscribes an email from the newsletter
 */
export async function unsubscribeFromNewsletter(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Update the subscriber record to set active = false
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ active: false, unsubscribed_at: new Date().toISOString() })
      .eq('email', email);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    console.error('Error unsubscribing from newsletter:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'An unknown error occurred' 
    };
  }
}