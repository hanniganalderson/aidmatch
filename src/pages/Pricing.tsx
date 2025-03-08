import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Pricing() {
  const [annually, setAnnually] = useState(true);
  
  // Feature comparison data
  const featureComparison = [
    { feature: "Scholarship Matches", free: "15/month", pro: "Unlimited" },
    { feature: "Match Quality", free: "Basic", pro: "Premium" },
    { feature: "Export Quality", free: "Standard", pro: "High Quality" },
    { feature: "Saved Scholarships", free: "Up to 10", pro: "Unlimited" },
    { feature: "AI Match Explanations", free: false, pro: true },
    { feature: "Application Tracking", free: false, pro: true },
    { feature: "Deadline Reminders", free: false, pro: true },
    { feature: "Priority Support", free: false, pro: true }
  ];
  
  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">
            Your Financial Aid
            <br />
            Deserves an Upgrade!
          </h1>
          <p className="text-xl text-gray-400 mb-4">
            Get the lifetime deal now for just $49
          </p>
          
          <div className="inline-flex items-center gap-2 bg-gray-900 p-1 rounded-full mb-8">
            <button
              onClick={() => setAnnually(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !annually 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnually(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                annually 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400'
              }`}
            >
              Annual
              <span className="ml-1 text-xs text-primary-400">Save 20%</span>
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">Free</h2>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-400 text-sm">/month</span>
                </div>
                
                <Link
                  to="/signup"
                  className="block w-full py-2.5 px-4 bg-gray-800 text-white rounded-lg text-center font-medium hover:bg-gray-700 transition-colors mb-6"
                >
                  Get Started
                </Link>
                
                <ul className="space-y-4">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                    <span>Trial Version</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                    <span>Only 15 Scholarship Matches / month</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                    <span>Limited features</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                    <span>Standard support</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-500">AI match explanations</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-500">Advanced filtering</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-500">Application tracking</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-gray-900 rounded-xl overflow-hidden relative border border-primary-500/30">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">Lifetime - pay once use forever</h2>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-gray-400 text-sm line-through ml-2">$99</span>
                </div>
                
                <Link
                  to="/signup?plan=pro"
                  className="block w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-center font-medium transition-colors mb-6"
                >
                  Get Lifetime Access →
                </Link>
                
                <ul className="space-y-4">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                    <span>All templates & features</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                    <span>Unlimited scholarship matches</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                    <span>Premium scholarship database</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                    <span>AI match explanations</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                    <span>Application tracking</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                    <span>Future updates included</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Feature Comparison Table */}
        <div className="max-w-4xl mx-auto mt-24">
          <h2 className="text-3xl font-bold text-center mb-4">Feature Comparison</h2>
          <p className="text-center text-gray-400 mb-12">See what each plan includes</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="py-4 pr-8 font-medium">Feature</th>
                  <th className="py-4 px-8 font-medium">Free</th>
                  <th className="py-4 pl-8 font-medium">Pro</th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((item, index) => (
                  <tr key={index} className="border-b border-gray-800">
                    <td className="py-4 pr-8">{item.feature}</td>
                    <td className="py-4 px-8">
                      {typeof item.free === 'boolean' 
                        ? (item.free 
                            ? <Check className="w-5 h-5 text-primary-400" /> 
                            : <X className="w-5 h-5 text-gray-500" />)
                        : item.free
                      }
                    </td>
                    <td className="py-4 pl-8">
                      {typeof item.pro === 'boolean'
                        ? (item.pro 
                            ? <Check className="w-5 h-5 text-primary-400" /> 
                            : <X className="w-5 h-5 text-gray-500" />)
                        : item.pro
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Testimonials/Social Proof */}
        <div className="flex justify-center items-center mt-24">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-900"></div>
            ))}
          </div>
          <div className="flex items-center ml-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-2">1000+ users love AidMatch</span>
          </div>
        </div>
      </div>
    </div>
  );
}