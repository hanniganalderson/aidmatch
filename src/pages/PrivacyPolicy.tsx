import React from 'react';
import { motion } from 'framer-motion';

export function PrivacyPolicy() {
  return (
    <div className="bg-white dark:bg-gray-900 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Privacy Policy</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          
          <div className="prose dark:prose-invert max-w-none prose-a:text-primary-500 dark:prose-a:text-primary-400">
            <h2>1. Introduction</h2>
            <p>
              At AidMatch, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>
            <p>
              Please read this Privacy Policy carefully. By accessing or using our services, you acknowledge that you have read, understood, and agree to be bound by all the terms outlined in this policy.
            </p>
            
            <h2>2. Information We Collect</h2>
            <h3>2.1 Personal Information</h3>
            <p>We may collect the following personal information:</p>
            <ul>
              <li><strong>Contact information:</strong> Name, email address, phone number</li>
              <li><strong>Account information:</strong> Username, password</li>
              <li><strong>Educational information:</strong> GPA, major, school, education level</li>
              <li><strong>Demographic information:</strong> Location, age, gender</li>
              <li><strong>Financial information:</strong> Information related to financial aid eligibility</li>
            </ul>
            
            <h3>2.2 Usage Data</h3>
            <p>We also collect information about how you use our services:</p>
            <ul>
              <li>Saved scholarships and preferences</li>
              <li>Search history and filters applied</li>
              <li>Device information (browser type, operating system)</li>
              <li>IP address and cookies</li>
              <li>Time and duration of visits</li>
            </ul>
            
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Match you with appropriate scholarship opportunities</li>
              <li>Personalize your experience and content</li>
              <li>Process and manage your account</li>
              <li>Communicate with you about our services</li>
              <li>Respond to your inquiries and provide support</li>
              <li>Improve our services and develop new features</li>
              <li>Analyze usage patterns and trends</li>
              <li>Protect against fraudulent or unauthorized activity</li>
            </ul>
            
            <h2>4. How We Share Your Information</h2>
            <p>We may share your information with:</p>
            <ul>
              <li><strong>Service providers:</strong> Third parties that help us operate our platform</li>
              <li><strong>Educational institutions:</strong> Only when necessary to facilitate scholarship applications and with your consent</li>
              <li><strong>Scholarship providers:</strong> When you apply for scholarships through our platform</li>
              <li><strong>Legal requirements:</strong> To comply with applicable laws, regulations, or legal processes</li>
            </ul>
            <p>
              We do not sell your personal information to third parties.
            </p>
            
            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no security measures are perfect or impenetrable, and we cannot guarantee the absolute security of your data.
            </p>
            
            <h2>6. Your Rights and Choices</h2>
            <p>Depending on your location, you may have the following rights regarding your personal information:</p>
            <ul>
              <li>Access and view your personal information</li>
              <li>Correct inaccuracies in your personal information</li>
              <li>Delete your personal information</li>
              <li>Object to or restrict processing of your personal information</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided in the "Contact Us" section.
            </p>
            
            <h2>7. Children's Privacy</h2>
            <p>
              Our services are not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have inadvertently collected personal information from a child under 13, we will take steps to delete such information.
            </p>
            
            <h2>8. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
            
            <h2>9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> privacy@aidmatch.com<br />
              <strong>Address:</strong> 123 Education Lane, Suite 400, San Francisco, CA 94107
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}