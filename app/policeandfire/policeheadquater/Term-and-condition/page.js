"use client";
import React, { useState, useEffect } from 'react';
import PoliceAPI from '@/app/services/PoliceAPI'; 

export default function InfoPage() {
  const [activeTab, setActiveTab] = useState('about'); // 'about', 'terms', 'help'
  const [contentData, setContentData] = useState({
    about: null,
    terms: null,
    help: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInformation();
  }, []);

  const fetchInformation = async () => {
    setLoading(true);
    try {
      const [aboutRes, termsRes, helpRes] = await Promise.all([
        PoliceAPI.getAboutContent(),
        PoliceAPI.getTermsContent(),
        PoliceAPI.getHelpContent()
      ]);

      setContentData({
        about: aboutRes?.success ? aboutRes.data : null,
        terms: termsRes?.success ? termsRes.data : null,
        help: helpRes?.success ? helpRes.data : null
      });
    } catch (error) {
      console.error("Error fetching information:", error);
    } finally {
      setLoading(false);
    }
  };

  // Text formatting function for line breaks
  const formatText = (text) => {
    if (!text) return null;
    return text.split('\n').map((paragraph, index) => (
      paragraph.trim() === '' ? <br key={index} /> : <p key={index} className="mb-4 text-gray-600 leading-relaxed text-justify">{paragraph}</p>
    ));
  };

  // Shared Contact Box Component
  const ContactBox = ({ contact }) => {
    if (!contact) return null;
    return (
      <div className="mt-10 bg-green-50 rounded-xl p-6 border border-green-100">
        <h3 className="text-lg font-semibold text-green-800 mb-4">Contact with Admin</h3>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex items-center bg-white p-3 rounded-lg border border-green-200 w-full shadow-sm">
            <div className="bg-[#00B074] p-2 rounded-full mr-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Phone</p>
              <p className="text-gray-800 font-medium">{contact.phone}</p>
            </div>
          </div>
          <div className="flex items-center bg-white p-3 rounded-lg border border-green-200 w-full shadow-sm">
            <div className="bg-[#00B074] p-2 rounded-full mr-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Email</p>
              <p className="text-gray-800 font-medium">{contact.email}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper to get active data
  const currentData = contentData[activeTab];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Kangaroo Platform</h1>
          <p className="text-gray-500">Official documentation, terms, and support details</p>
        </div>

        {/* Dynamic 3 Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {[
            { id: 'about', label: 'About Us' },
            { id: 'terms', label: 'Terms & Conditions' },
            { id: 'help', label: 'Help & Support' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-[#00B074] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full mt-20">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-[#00B074] rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500 font-medium">Loading information...</p>
            </div>
          ) : currentData ? (
            <div className="animate-fade-in-up">
              
              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
                {currentData.title}
              </h2>
              
              {/* Main Content (Paragraphs) */}
              <div className="prose max-w-none mb-8">
                {formatText(currentData.content)}
              </div>

              {/* FAQs Section (Rendered only if FAQs exist, mainly for Help Tab) */}
              {currentData.faqs && currentData.faqs.length > 0 && (
                <div className="mt-8 mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    {currentData.faqs.map((faq, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                        <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                        <p className="text-gray-600 text-sm">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shared Contact Support Box */}
              {currentData.supportContact && (
                <ContactBox contact={currentData.supportContact} />
              )}

            </div>
          ) : (
            <p className="text-center text-gray-500 mt-10">Data is currently unavailable for this section.</p>
          )}
        </div>

      </div>
    </div>
  );
}