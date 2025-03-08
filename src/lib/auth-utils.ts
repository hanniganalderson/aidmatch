// src/lib/auth-utils.ts

/**
 * Parse OAuth error from URL parameters
 * @param searchParams URL search parameters string
 * @returns Error message or null if no error
 */
export function parseOAuthError(searchParams: string): string | null {
    const params = new URLSearchParams(searchParams);
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    const errorCode = params.get('error_code');
    
    if (!error) return null;
    
    // Handle specific case for Google auth errors
    if (error === 'server_error' && errorCode === 'unexpected_failure') {
      return 'Google authentication failed. Please try again or use email login.';
    }
    
    // Handle different error types
    switch (error) {
      case 'server_error':
        return `Authentication error: ${errorDescription || 'Server error'}`;
      case 'access_denied':
        return 'Authentication was cancelled or denied';
      case 'invalid_request':
        return 'Invalid authentication request';
      case 'unsupported_response_type':
        return 'Authentication server configuration error';
      case 'invalid_scope':
        return 'Invalid authentication scope';
      case 'unauthorized_client':
        return 'Authentication client error';
      default:
        return errorDescription || `Authentication error: ${error}`;
    }
  }
  
  /**
   * Clear OAuth error parameters from URL without page reload
   */
  export function clearOAuthErrorParams(): void {
    try {
      // Get current URL
      const url = new URL(window.location.href);
      let paramsChanged = false;
      
      // Remove OAuth error parameters
      if (url.searchParams.has('error')) {
        url.searchParams.delete('error');
        paramsChanged = true;
      }
      
      if (url.searchParams.has('error_code')) {
        url.searchParams.delete('error_code');
        paramsChanged = true;
      }
      
      if (url.searchParams.has('error_description')) {
        url.searchParams.delete('error_description');
        paramsChanged = true;
      }
      
      // Update browser history without reload if params changed
      if (paramsChanged) {
        window.history.replaceState({}, document.title, url.toString());
        console.log('Cleared OAuth error parameters from URL');
      }
    } catch (err) {
      console.error('Error clearing OAuth params:', err);
    }
  }
  
  /**
   * Check if URL hash contains OAuth errors and process them
   * @returns Error message or null
   */
  export function processHashErrors(): string | null {
    if (!window.location.hash) return null;
    
    try {
      // Sometimes errors come in the hash part of the URL
      const hashParams = window.location.hash.substring(1);
      const error = parseOAuthError(hashParams);
      
      if (error) {
        // Clear the hash but keep the rest of the URL
        window.history.replaceState(
          {},
          document.title, 
          window.location.pathname + window.location.search
        );
        return error;
      }
    } catch (err) {
      console.error('Error processing hash errors:', err);
    }
    
    return null;
  }
  
  /**
   * Checks both URL search params and hash for OAuth errors
   * @returns Error message or null
   */
  export function checkForOAuthErrors(): string | null {
    // Check search params first
    const searchError = parseOAuthError(window.location.search);
    if (searchError) {
      clearOAuthErrorParams();
      return searchError;
    }
    
    // Then check hash
    return processHashErrors();
  }