// src/lib/ScholarshipVerificationService.ts
import type { ScoredScholarship } from '../types';
import { supabase } from './supabase';

/**
 * Interface for URL validation response
 */
interface UrlValidationResponse {
  valid: boolean;
  is_scholarship_site: boolean;
  domain_trustworthiness: 'high' | 'medium' | 'low' | 'unknown';
  last_checked: string;
  status_code?: number;
  site_category?: string;
  error?: string;
}

/**
 * Interface for scholarship verification result
 */
interface VerificationResult {
  verified: boolean;
  trustworthiness: 'high' | 'medium' | 'low' | 'unknown';
  active: boolean;
  notes: string[];
  corrected_url?: string;
}

// Extended ScoredScholarship interface to include verification fields
interface VerifiedScholarship extends ScoredScholarship {
  verified_source?: boolean;
  link_trustworthiness?: 'high' | 'medium' | 'low' | 'unknown';
  link_active?: boolean;
  verification_notes?: string[];
}

/**
 * Known scholarship domain patterns
 */
const KNOWN_SCHOLARSHIP_DOMAINS = [
  // Universities
  /edu$/,
  /\.edu\//,
  // Government
  /\.gov$/,
  /\.gov\//,
  // Common scholarship sites
  /scholarship/i,
  /financial-aid/i,
  /fastweb\.com/,
  /scholarships\.com/,
  /chegg\.com/,
  /niche\.com/,
  /collegeboard\.org/,
  /fundsforlearning\.com/,
  /petersons\.com/,
  /unigo\.com/,
  /cappex\.com/,
  /scholarshipsportal\.com/,
  /scholarshipamerica\.org/,
  /internationalscholarships\.com/,
  // Foundations
  /foundation/i,
  /fund/i
];

/**
 * Hosts that we've determined should not be in scholarship URLs
 */
const BLOCKLISTED_HOSTS = [
  'example.com',
  'test.com',
  'website.com',
  'samplesite.com',
  'domain.com',
  'mywebsite.com',
  'yourwebsite.com',
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'tiktok.com'
];

/**
 * Check if a URL matches known scholarship site patterns
 */
function matchesScholarshipDomainPattern(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    
    // Check if the host is blocklisted
    if (BLOCKLISTED_HOSTS.some(host => hostname.includes(host))) {
      return false;
    }
    
    // Check against known patterns
    return KNOWN_SCHOLARSHIP_DOMAINS.some(pattern => pattern.test(url));
  } catch (e) {
    return false;
  }
}

/**
 * Check if a URL is syntactically valid
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (e) {
    return false;
  }
}

/**
 * Normalize a URL to a standard format
 */
function normalizeUrl(url: string): string {
  try {
    // Ensure the URL has a protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const urlObj = new URL(url);
    
    // Remove trailing slash
    let normalized = urlObj.origin + urlObj.pathname.replace(/\/$/, '');
    
    // Keep the query parameters if they exist
    if (urlObj.search) {
      normalized += urlObj.search;
    }
    
    return normalized;
  } catch (e) {
    return url; // Return original if normalization fails
  }
}

/**
 * Fetch known valid scholarship URLs from database
 */
async function getKnownScholarshipUrls(): Promise<Set<string>> {
  try {
    const { data, error } = await supabase
      .from('verified_scholarship_domains')
      .select('domain, trust_level');
    
    if (error) {
      console.error('Error fetching verified domains:', error);
      return new Set<string>();
    }
    
    const trustedDomains = new Set<string>();
    data.forEach(item => {
      if (item.trust_level !== 'low') {
        trustedDomains.add(item.domain);
      }
    });
    
    return trustedDomains;
  } catch (error) {
    console.error('Error in getKnownScholarshipUrls:', error);
    return new Set<string>();
  }
}

/**
 * Validate URL with an external API service
 * Note: This is a mock implementation - you would replace this with an actual API call
 */
async function validateUrlWithService(url: string): Promise<UrlValidationResponse> {
  // NOTE: In a production environment, you would call an actual URL validation service
  // Such as a custom API endpoint that checks URLs for validity and scholarship content
  // For now, we'll simulate this behavior
  
  try {
    // Mock delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const normalizedUrl = normalizeUrl(url);
    const urlObj = new URL(normalizedUrl);
    const hostname = urlObj.hostname;
    
    // Check against blocklisted hosts first
    if (BLOCKLISTED_HOSTS.some(host => hostname.includes(host))) {
      return {
        valid: false,
        is_scholarship_site: false,
        domain_trustworthiness: 'low',
        last_checked: new Date().toISOString(),
        error: 'Domain is not a legitimate scholarship provider'
      };
    }
    
    // Check against known scholarship patterns
    const isScholarshipSite = matchesScholarshipDomainPattern(normalizedUrl);
    
    // Get trusted domains from our database (caching would improve performance)
    const trustedDomains = await getKnownScholarshipUrls();
    const isDomainTrusted = trustedDomains.has(hostname);
    
    // Determine trustworthiness
    let trustworthiness: 'high' | 'medium' | 'low' | 'unknown' = 'unknown';
    
    if (isDomainTrusted) {
      trustworthiness = 'high';
    } else if (hostname.endsWith('.edu') || hostname.endsWith('.gov')) {
      trustworthiness = 'high';
    } else if (isScholarshipSite) {
      trustworthiness = 'medium';
    } else {
      trustworthiness = 'low';
    }
    
    return {
      valid: true,
      is_scholarship_site: isScholarshipSite || isDomainTrusted,
      domain_trustworthiness: trustworthiness,
      last_checked: new Date().toISOString(),
      status_code: 200, // Mock status code
      site_category: isScholarshipSite ? 'education' : 'unknown'
    };
  } catch (error) {
    console.error('Error validating URL:', url, error);
    return {
      valid: false,
      is_scholarship_site: false,
      domain_trustworthiness: 'unknown',
      last_checked: new Date().toISOString(),
      error: 'URL validation service error'
    };
  }
}

/**
 * Check database for previously verified URLs to reduce redundant verification
 */
async function checkVerificationCache(url: string): Promise<VerificationResult | null> {
  try {
    const normalizedUrl = normalizeUrl(url);
    
    const { data, error } = await supabase
      .from('url_verification_cache')
      .select('*')
      .eq('url', normalizedUrl)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // Not found in cache, return null
        return null;
      }
      console.error('Error checking URL verification cache:', error);
      return null;
    }
    
    if (data) {
      // Check if the verification is still recent (last 7 days)
      const lastChecked = new Date(data.last_checked);
      const now = new Date();
      const daysSinceChecked = Math.floor((now.getTime() - lastChecked.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceChecked <= 7) {
        return {
          verified: data.is_verified,
          trustworthiness: data.trustworthiness,
          active: data.is_active,
          notes: data.notes || [],
          corrected_url: data.corrected_url
        };
      }
    }
    
    return null; // Not in cache or cache is too old
  } catch (error) {
    console.error('Error in checkVerificationCache:', error);
    return null;
  }
}

/**
 * Save verification result to cache for future use
 */
async function saveToVerificationCache(
  url: string, 
  result: VerificationResult
): Promise<void> {
  try {
    const normalizedUrl = normalizeUrl(url);
    
    const { error } = await supabase
      .from('url_verification_cache')
      .upsert({
        url: normalizedUrl,
        is_verified: result.verified,
        trustworthiness: result.trustworthiness,
        is_active: result.active,
        notes: result.notes,
        corrected_url: result.corrected_url,
        last_checked: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error saving to URL verification cache:', error);
    }
  } catch (error) {
    console.error('Error in saveToVerificationCache:', error);
  }
}

/**
 * Suggest a corrected URL if the provided one is invalid but similar to known patterns
 */
function suggestCorrectedUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Check if it's missing www
    if (!urlObj.hostname.startsWith('www.') && 
        !urlObj.hostname.includes('.edu') && 
        !urlObj.hostname.includes('.gov')) {
      const withWww = new URL(url);
      withWww.hostname = 'www.' + withWww.hostname;
      return withWww.toString();
    }
    
    // Check if using HTTP instead of HTTPS
    if (urlObj.protocol === 'http:') {
      const withHttps = new URL(url);
      withHttps.protocol = 'https:';
      return withHttps.toString();
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Verify a scholarship URL and determine if it's active and legitimate
 */
export async function verifyScholarshipUrl(url: string): Promise<VerificationResult> {
  if (!url) {
    return {
      verified: false,
      trustworthiness: 'unknown',
      active: false,
      notes: ['No URL provided']
    };
  }
  
  // First, check if the URL is syntactically valid
  if (!isValidUrl(url)) {
    // Try to suggest a correction
    const correctedUrl = suggestCorrectedUrl(url);
    
    return {
      verified: false,
      trustworthiness: 'unknown',
      active: false,
      notes: ['Invalid URL format'],
      corrected_url: correctedUrl || undefined
    };
  }
  
  // Check if we have a recent verification result cached
  const cachedResult = await checkVerificationCache(url);
  if (cachedResult) {
    return cachedResult;
  }
  
  // Validate with our service
  const validationResponse = await validateUrlWithService(url);
  
  const result: VerificationResult = {
    verified: validationResponse.valid && validationResponse.is_scholarship_site,
    trustworthiness: validationResponse.domain_trustworthiness,
    active: validationResponse.valid,
    notes: []
  };
  
  // Add notes based on the validation response
  if (!validationResponse.valid) {
    result.notes.push('URL validation failed');
    if (validationResponse.error) {
      result.notes.push(validationResponse.error);
    }
  }
  
  if (!validationResponse.is_scholarship_site) {
    result.notes.push('Domain does not appear to be a scholarship provider');
  }
  
  if (validationResponse.domain_trustworthiness === 'low') {
    result.notes.push('Domain has low trustworthiness score');
  }
  
  // If we suggested a corrected URL but it's still invalid, try to find a better one
  if (!result.verified) {
    const correctedUrl = suggestCorrectedUrl(url);
    if (correctedUrl && correctedUrl !== url) {
      result.corrected_url = correctedUrl;
    }
  }
  
  // Save the result to our cache
  await saveToVerificationCache(url, result);
  
  return result;
}

/**
 * Verify all URLs in a list of scholarships and update their verification status
 */
export async function verifyScholarshipBatch(
  scholarships: ScoredScholarship[]
): Promise<VerifiedScholarship[]> {
  const results: VerifiedScholarship[] = [];
  
  // Process scholarships in parallel, but limit concurrency to 5 at a time
  const batchSize = 5;
  
  for (let i = 0; i < scholarships.length; i += batchSize) {
    const batch = scholarships.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (scholarship) => {
      const result: VerifiedScholarship = { ...scholarship };
      
      if (!scholarship.link) {
        // No link to verify
        result.verified_source = false;
        return result;
      }
      
      const verificationResult = await verifyScholarshipUrl(scholarship.link);
      
      result.verified_source = verificationResult.verified;
      result.link_trustworthiness = verificationResult.trustworthiness;
      result.link_active = verificationResult.active;
      result.verification_notes = verificationResult.notes;
      
      // Only update the link if we have a corrected version
      if (verificationResult.corrected_url) {
        result.link = verificationResult.corrected_url;
      }
      
      return result;
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Report a scholarship URL as invalid or problematic
 */
export async function reportInvalidScholarship(
  scholarshipId: string,
  userId: string,
  reason: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('scholarship_url_reports')
      .insert({
        scholarship_id: scholarshipId,
        user_id: userId,
        reason: reason,
        reported_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error reporting invalid scholarship:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in reportInvalidScholarship:', error);
    return false;
  }
}