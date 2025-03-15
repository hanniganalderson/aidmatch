/**
 * Validates and normalizes a URL
 * @param url The URL to validate
 * @returns A valid URL string or null if invalid
 */
export function validateUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  try {
    // Try to create a URL object to validate
    const urlObj = new URL(url);
    
    // Check if the protocol is http or https
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      // Try to fix by prepending https://
      return validateUrl(`https://${url}`);
    }
    
    // Check for common URL patterns
    const validDomainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!validDomainPattern.test(urlObj.hostname)) {
      return null;
    }
    
    return urlObj.toString();
  } catch (e) {
    // If URL creation fails, try adding https:// prefix
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return validateUrl(`https://${url}`);
    }
    
    return null;
  }
}

/**
 * Safely opens a URL in a new tab after validation
 * @param url The URL to open
 * @returns true if URL was opened, false otherwise
 */
export function safeOpenUrl(url: string | null | undefined): boolean {
  const validUrl = validateUrl(url);
  
  if (validUrl) {
    window.open(validUrl, '_blank', 'noopener,noreferrer');
    return true;
  }
  
  return false;
} 