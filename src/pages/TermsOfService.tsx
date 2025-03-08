import React from 'react';
import { motion } from 'framer-motion';

export function TermsOfService() {
  return (
    <div className="bg-white dark:bg-gray-900 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Terms of Service</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          
          <div className="prose dark:prose-invert max-w-none prose-a:text-primary-500 dark:prose-a:text-primary-400">
            <h2>1. Introduction</h2>
            <p>
              Welcome to AidMatch. These Terms of Service ("Terms") govern your access to and use of the AidMatch website, applications, and services (collectively, the "Services"). By accessing or using the Services, you agree to be bound by these Terms. If you do not agree to these Terms, do not access or use the Services.
            </p>
            
            <h2>2. Eligibility</h2>
            <p>
              You must be at least 13 years old to use our Services. If you are under 18 years old, you confirm that you have permission from a parent or guardian to use our Services. By using our Services, you represent and warrant that you meet these eligibility requirements.
            </p>
            
            <h2>3. Accounts</h2>
            <p>
              When you create an account with us, you are responsible for:
            </p>
            <ul>
              <li>Providing accurate and complete information</li>
              <li>Maintaining the security of your account credentials</li>
              <li>All activities that occur under your account</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate your account if any information provided is inaccurate, false, or in violation of these Terms.
            </p>
            
            <h2>4. User Conduct</h2>
            <p>
              When using our Services, you agree not to:
            </p>
            <ul>
              <li>Violate any applicable law, regulation, or third-party rights</li>
              <li>Use our Services for illegal or unauthorized purposes</li>
              <li>Upload or transmit malicious code or attempt to interfere with the Services</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Engage in any activity that could disable, overburden, or impair the Services</li>
              <li>Use automated means to access or collect data from the Services</li>
              <li>Share false or misleading information about scholarships or financial aid</li>
            </ul>
            
            <h2>5. Intellectual Property Rights</h2>
            <p>
              The Services and all content, features, and functionality thereof, including but not limited to text, graphics, logos, icons, images, and software, are the exclusive property of AidMatch or its licensors and are protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              We grant you a limited, non-exclusive, non-transferable, revocable license to use the Services for their intended purposes subject to these Terms.
            </p>
            
            <h2>6. User Content</h2>
            <p>
              You retain ownership of any content you submit, post, or display on or through the Services ("User Content"). By providing User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute such content in connection with providing the Services.
            </p>
            <p>
              You represent and warrant that:
            </p>
            <ul>
              <li>You own or have the necessary rights to your User Content</li>
              <li>Your User Content does not violate the privacy, publicity, intellectual property, or other rights of any person</li>
              <li>Your User Content does not contain any material that is illegal, defamatory, obscene, or otherwise objectionable</li>
            </ul>
            
            <h2>7. Scholarship Information</h2>
            <p>
              While we strive to provide accurate information about scholarships and financial aid opportunities, we cannot guarantee the accuracy, completeness, or reliability of such information. The information provided through our Services is for general informational purposes only.
            </p>
            <p>
              We are not responsible for the content, policies, or practices of third-party scholarship providers. You should review the official terms and requirements of any scholarship before applying.
            </p>
            
            <h2>8. Disclaimers</h2>
            <p>
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMISSIBLE UNDER APPLICABLE LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT THE SERVICES ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>
            
            <h2>9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR ACCESS TO OR USE OF, OR INABILITY TO ACCESS OR USE, THE SERVICES.
            </p>
            <p>
              IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS RELATED TO THE SERVICES EXCEED THE AMOUNT PAID BY YOU, IF ANY, FOR ACCESSING THE SERVICES.
            </p>
            
            <h2>10. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless AidMatch and its officers, directors, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) that arise from or relate to: (a) your use of the Services; (b) your violation of these Terms; (c) your violation of any rights of another; or (d) your User Content.
            </p>
            
            <h2>11. Modifications to the Services and Terms</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue the Services, or any features or portions thereof, at any time with or without notice.
            </p>
            <p>
              We may also update these Terms from time to time. If we make material changes to these Terms, we will notify you by posting the revised Terms on our website or by other means. Your continued use of the Services after the effective date of the revised Terms constitutes your acceptance of such Terms.
            </p>
            
            <h2>12. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.
            </p>
            <p>
              Any dispute arising out of or relating to these Terms or the Services shall be resolved through binding arbitration in accordance with the American Arbitration Association's rules. The arbitration shall take place in San Francisco, California.
            </p>
            
            <h2>13. Severability</h2>
            <p>
              If any provision of these Terms is held to be invalid, illegal, or unenforceable, such provision shall be struck from these Terms, and the remaining provisions shall remain in full force and effect.
            </p>
            
            <h2>14. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and AidMatch regarding the Services and supersede all prior and contemporaneous agreements, proposals, or representations, written or oral.
            </p>
            
            <h2>15. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> terms@aidmatch.com<br />
              <strong>Address:</strong> 123 Education Lane, Suite 400, San Francisco, CA 94107
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}