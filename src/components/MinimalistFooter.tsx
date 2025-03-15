import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function MinimalistFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-8 border-t border-gray-800/30 dark:border-gray-800/50 bg-gray-950/30 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600">
              AidMatch
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Finding scholarships made simple
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className="flex gap-6">
              <Link to="/about" className="text-sm text-gray-500 hover:text-primary-400 transition-colors">
                About
              </Link>
              <Link to="/about#contact" className="text-sm text-gray-500 hover:text-primary-400 transition-colors">
                Contact
              </Link>
              <Link to="/privacy" className="text-sm text-gray-500 hover:text-primary-400 transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="text-sm text-gray-500 hover:text-primary-400 transition-colors">
                Terms
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-800/30 dark:border-gray-800/50 text-center">
          <p className="text-xs text-gray-500">
            © {currentYear} AidMatch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 