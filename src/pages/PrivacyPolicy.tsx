import React from 'react';
import { motion } from 'framer-motion';
import { PageBackground } from '../components/PageBackground';
import { Layout } from '../components/Layout';

const today: string = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export function PrivacyPolicy() {
  return (
    <Layout backgroundVariant="subtle">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Privacy Policy</h1>
          <p className="dark:text-gray-400 mb-8">Last Updated: {today}</p>

          <div className="prose dark:prose-invert">
            <h2>1. Introduction</h2>
            <p>Welcome to AidMatch. Your privacy is critically important to us. This Privacy Policy outlines our policies on collecting, using, and disclosing your information when you use our service and informs you of your privacy rights.</p>
            
            <h2>2. Information We Collect</h2>
            <h3>2.1 Personal Data</h3>
            <p>We collect and process the following types of personal data:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, and account credentials.</li>
              <li><strong>Education Data:</strong> School, major, GPA, state of residence.</li>
              <li><strong>Subscription & Payment Data:</strong> Collected via Stripe for premium users.</li>
              <li><strong>Usage Data:</strong> Preferences, saved scholarships, and site interactions.</li>
              <li><strong>Device Data:</strong> IP address, browser type, and OS.</li>
            </ul>
            
            <h3>2.2 Cookies and Tracking</h3>
            <p>We use cookies and similar tracking technologies for authentication, improving user experience, and analytics.</p>
            
            <h2>3. How We Use Your Information</h2>
            <ul>
              <li>To provide personalized scholarship recommendations.</li>
              <li>To manage your account and subscriptions.</li>
              <li>To analyze and improve our services.</li>
              <li>To comply with legal obligations.</li>
            </ul>
            
            <h2>4. Data Sharing and Third Parties</h2>
            <p>We do not sell your personal data. However, we may share data with:</p>
            <ul>
              <li>Stripe for payment processing.</li>
              <li>Google Authentication for login security.</li>
              <li>Legal authorities when required.</li>
            </ul>
            
            <h2>5. Your Rights</h2>
            <p>Depending on your jurisdiction, you have rights to access, modify, or delete your personal data. To exercise these rights, contact us at <strong>support@aidmatch.com</strong>.</p>
            
            <h2>6. Security</h2>
            <p>We implement strong security measures to protect your data, but no system is 100% secure.</p>
            
            <h2>7. Contact</h2>
            <p>Email: <strong>support@aidmatch.com</strong></p>
            <p>Location: <strong>Bend, OR</strong></p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
