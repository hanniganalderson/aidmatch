import React from 'react';
import { motion } from 'framer-motion';

const today: string = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

const TermsOfService: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold dark:text-white mb-6">Terms of Service</h1>
          <p className="dark:text-gray-400 mb-8">Last Updated: {today}</p>

          <div className="prose dark:prose-invert">
            <h2>1. Acceptance of Terms</h2>
            <p>By using AidMatch, you agree to these Terms of Service.</p>
            
            <h2>2. Eligibility</h2>
            <p>You must be at least 16 years old or have parental consent to use our services.</p>
            
            <h2>3. Subscription Services</h2>
            <p>Premium users ($9/month) receive AI-assisted scholarship recommendations and application tracking. Payments are securely processed via Stripe.</p>
            
            <h2>4. User Conduct</h2>
            <ul>
              <li>Users must provide accurate information.</li>
              <li>Misuse, hacking, or scraping of the service is strictly prohibited.</li>
            </ul>
            
            <h2>5. Intellectual Property</h2>
            <p>All AidMatch content, branding, and algorithms are protected intellectual property. Unauthorized reproduction is prohibited.</p>
            
            <h2>6. Limitation of Liability</h2>
            <p>We provide AidMatch "as-is" without warranties. We are not responsible for any incorrect scholarship data or missed opportunities.</p>
            
            <h2>7. Indemnification</h2>
            <p>You agree to indemnify AidMatch from claims related to your use of the platform.</p>
            
            <h2>8. Governing Law</h2>
            <p>These terms are governed by Oregon law. Disputes must be resolved in Bend, OR.</p>
            
            <h2>9. Contact</h2>
            <p>Email: <strong>support@aidmatch.com</strong></p>
            <p>Location: <strong>Bend, OR</strong></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;
