'use client';

import { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import { defaultSEOSettings, type SEOSettings } from '@/types/seo';
import { Icons } from './Icon';

export default function SEOSettingsPanel() {
  const [seoSettings, setSeoSettings] = useState<SEOSettings>(defaultSEOSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeSection, setActiveSection] = useState('general');

  useEffect(() => {
    const seoRef = ref(db, 'seo');
    const unsubscribe = onValue(seoRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSeoSettings({ ...defaultSEOSettings, ...data });
      } else {
        setSeoSettings(defaultSEOSettings);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const seoRef = ref(db, 'seo');
      await update(seoRef, seoSettings);
      alert('✅ SEO settings saved successfully!');
    } catch (error) {
      console.error('Error saving SEO settings:', error);
      alert('❌ Error saving SEO settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to default settings?')) {
      setSeoSettings(defaultSEOSettings);
    }
  };

  const handleChange = (field: keyof SEOSettings, value: string | boolean) => {
    setSeoSettings((prev) => ({ ...prev, [field]: value }));
  };

  const sections = [
    { id: 'general', label: 'General SEO', icon: <Icons.Settings className="text-xl" /> },
    { id: 'meta', label: 'Meta Tags', icon: <Icons.File className="text-xl" /> },
    { id: 'social', label: 'Social Media', icon: <Icons.Instagram className="text-xl" /> },
    { id: 'analytics', label: 'Analytics', icon: <Icons.TrendingUp className="text-xl" /> },
    { id: 'verification', label: 'Verification', icon: <Icons.Certificate className="text-xl" /> },
    { id: 'organization', label: 'Organization', icon: <Icons.User className="text-xl" /> },
    { id: 'pages', label: 'Page-Specific', icon: <Icons.File className="text-xl" /> },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-headline font-black uppercase text-white">SEO Settings</h2>
          <p className="text-white/60 text-xs md:text-sm mt-1">Configure SEO meta tags, Google Analytics, and more</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 md:px-4 py-2 md:py-2 bg-surface-container-highest text-white rounded-lg hover:bg-surface-container-high transition-colors text-xs md:text-sm font-headline uppercase whitespace-nowrap"
          >
            <span className="hidden md:inline">{showPreview ? 'Hide Preview' : 'Preview'}</span>
            <span className="md:hidden"><i className="fa-solid fa-eye"></i></span>
          </button>
          <button
            onClick={handleReset}
            className="px-3 md:px-4 py-2 md:py-2 bg-surface-container-highest text-white rounded-lg hover:bg-surface-container-high transition-colors text-xs md:text-sm font-headline uppercase whitespace-nowrap"
          >
            <span className="hidden md:inline">Reset</span>
            <span className="md:hidden"><i className="fa-solid fa-rotate-left"></i></span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 md:px-6 py-2 md:py-2 bg-primary-container text-on-primary rounded-lg hover:bg-primary transition-colors text-xs md:text-sm font-headline uppercase font-bold disabled:opacity-50 whitespace-nowrap flex-1 md:flex-none"
          >
            <span className="hidden md:inline">{isSaving ? 'Saving...' : 'Save Settings'}</span>
            <span className="md:hidden"><i className="fa-solid fa-save"></i></span>
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-outline-variant/15 scrollbar-hide">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg whitespace-nowrap transition-all flex-shrink-0 ${
              activeSection === section.id
                ? 'bg-primary-container text-on-primary font-bold'
                : 'bg-surface-container text-white/60 hover:bg-surface-container-high'
            }`}
          >
            {section.icon}
            <span className="text-xs md:text-sm font-headline uppercase">{section.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="space-y-6">
          {activeSection === 'general' && (
            <>
              <InputGroup
                label="Site Name"
                value={seoSettings.siteName}
                onChange={(v) => handleChange('siteName', v)}
                placeholder="ATM Autolighting Madiun"
              />
              <InputGroup
                label="Site URL"
                value={seoSettings.siteUrl}
                onChange={(v) => handleChange('siteUrl', v)}
                placeholder="https://atmautolighting.com"
              />
              <InputGroup
                label="Site Logo URL"
                value={seoSettings.siteLogo}
                onChange={(v) => handleChange('siteLogo', v)}
                placeholder="/logo.png"
              />
              <TextAreaGroup
                label="Site Description"
                value={seoSettings.siteDescription}
                onChange={(v) => handleChange('siteDescription', v)}
                placeholder="Description for search engines..."
                rows={3}
              />
            </>
          )}

          {activeSection === 'meta' && (
            <>
              <InputGroup
                label="Default Title"
                value={seoSettings.defaultTitle}
                onChange={(v) => handleChange('defaultTitle', v)}
                placeholder="Page Title"
              />
              <TextAreaGroup
                label="Default Description"
                value={seoSettings.defaultDescription}
                onChange={(v) => handleChange('defaultDescription', v)}
                placeholder="Meta description..."
                rows={3}
              />
              <InputGroup
                label="Default Keywords"
                value={seoSettings.defaultKeywords}
                onChange={(v) => handleChange('defaultKeywords', v)}
                placeholder="keyword1, keyword2, keyword3"
              />
              <InputGroup
                label="Default OG Image URL"
                value={seoSettings.defaultImage}
                onChange={(v) => handleChange('defaultImage', v)}
                placeholder="/og-image.jpg"
              />
            </>
          )}

          {activeSection === 'social' && (
            <>
              <h3 className="text-base md:text-lg font-headline font-bold text-white uppercase mb-4">Open Graph (Facebook)</h3>
              <InputGroup
                label="OG Title"
                value={seoSettings.ogTitle}
                onChange={(v) => handleChange('ogTitle', v)}
              />
              <TextAreaGroup
                label="OG Description"
                value={seoSettings.ogDescription}
                onChange={(v) => handleChange('ogDescription', v)}
                rows={2}
              />
              <InputGroup
                label="OG Image URL"
                value={seoSettings.ogImage}
                onChange={(v) => handleChange('ogImage', v)}
              />
              <InputGroup
                label="OG Type"
                value={seoSettings.ogType}
                onChange={(v) => handleChange('ogType', v)}
                placeholder="website"
              />
              
              <h3 className="text-base md:text-lg font-headline font-bold text-white uppercase mb-4 mt-8">Twitter Card</h3>
              <InputGroup
                label="Twitter Card Type"
                value={seoSettings.twitterCard}
                onChange={(v) => handleChange('twitterCard', v)}
                placeholder="summary_large_image"
              />
              <InputGroup
                label="Twitter Site"
                value={seoSettings.twitterSite}
                onChange={(v) => handleChange('twitterSite', v)}
                placeholder="@username"
              />
              <InputGroup
                label="Twitter Creator"
                value={seoSettings.twitterCreator}
                onChange={(v) => handleChange('twitterCreator', v)}
                placeholder="@username"
              />
            </>
          )}

          {activeSection === 'analytics' && (
            <>
              <div className="bg-surface-container-highest p-4 rounded-lg mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Icons.TrendingUp className="text-primary-container text-2xl" />
                  <h3 className="text-base md:text-lg font-headline font-bold text-white uppercase">Google Analytics</h3>
                </div>
                <p className="text-white/60 text-sm mb-4">
                  Track website traffic and user behavior with Google Analytics 4
                </p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={seoSettings.enableAnalytics}
                      onChange={(e) => handleChange('enableAnalytics', e.target.checked)}
                      className="w-5 h-5 rounded bg-surface-container"
                    />
                    <span className="text-white font-headline uppercase text-sm">Enable Google Analytics</span>
                  </label>
                </div>
              </div>
              
              <InputGroup
                label="Google Analytics Measurement ID"
                value={seoSettings.googleAnalyticsId}
                onChange={(v) => handleChange('googleAnalyticsId', v)}
                placeholder="G-XXXXXXXXXX"
              />
              <p className="text-white/40 text-xs">
                Format: G-XXXXXXXXXX (found in your GA4 property settings)
              </p>
            </>
          )}

          {activeSection === 'verification' && (
            <>
              <div className="bg-surface-container-highest p-4 rounded-lg mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Icons.Certificate className="text-primary-container text-2xl" />
                  <h3 className="text-base md:text-lg font-headline font-bold text-white uppercase">Search Console Verification</h3>
                </div>
                <p className="text-white/60 text-sm mb-4">
                  Verify your site with Google Search Console
                </p>
              </div>
              
              <InputGroup
                label="Google Site Verification Code"
                value={seoSettings.googleSiteVerification}
                onChange={(v) => handleChange('googleSiteVerification', v)}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
              />
              
              <div className="mt-6">
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={seoSettings.robotsAllow}
                    onChange={(e) => handleChange('robotsAllow', e.target.checked)}
                    className="w-5 h-5 rounded bg-surface-container"
                  />
                  <span className="text-white font-headline uppercase text-sm">Allow search engines to index this site</span>
                </label>
              </div>
              
              <TextAreaGroup
                label="Custom Robots.txt Rules (optional)"
                value={seoSettings.robotsCustomRules}
                onChange={(v) => handleChange('robotsCustomRules', v)}
                placeholder="User-agent: *&#10;Disallow: /admin/"
                rows={4}
              />
            </>
          )}

          {activeSection === 'organization' && (
            <>
              <InputGroup
                label="Organization Name"
                value={seoSettings.organizationName}
                onChange={(v) => handleChange('organizationName', v)}
              />
              <InputGroup
                label="Organization Logo URL"
                value={seoSettings.organizationLogo}
                onChange={(v) => handleChange('organizationLogo', v)}
              />
              <InputGroup
                label="Organization URL"
                value={seoSettings.organizationUrl}
                onChange={(v) => handleChange('organizationUrl', v)}
              />
              <InputGroup
                label="Contact Email"
                value={seoSettings.organizationContactEmail}
                onChange={(v) => handleChange('organizationContactEmail', v)}
                type="email"
              />
              <InputGroup
                label="Contact Phone"
                value={seoSettings.organizationContactPhone}
                onChange={(v) => handleChange('organizationContactPhone', v)}
              />
              <TextAreaGroup
                label="Address"
                value={seoSettings.organizationAddress}
                onChange={(v) => handleChange('organizationAddress', v)}
                rows={3}
              />
            </>
          )}

          {activeSection === 'pages' && (
            <>
              <h3 className="text-base md:text-lg font-headline font-bold text-white uppercase mb-4">Homepage</h3>
              <InputGroup
                label="Home Title"
                value={seoSettings.homeTitle}
                onChange={(v) => handleChange('homeTitle', v)}
              />
              <TextAreaGroup
                label="Home Description"
                value={seoSettings.homeDescription}
                onChange={(v) => handleChange('homeDescription', v)}
                rows={2}
              />
              <InputGroup
                label="Home Keywords"
                value={seoSettings.homeKeywords}
                onChange={(v) => handleChange('homeKeywords', v)}
              />

              <h3 className="text-base md:text-lg font-headline font-bold text-white uppercase mb-4 mt-8">About Page</h3>
              <InputGroup
                label="About Title"
                value={seoSettings.aboutTitle}
                onChange={(v) => handleChange('aboutTitle', v)}
              />
              <TextAreaGroup
                label="About Description"
                value={seoSettings.aboutDescription}
                onChange={(v) => handleChange('aboutDescription', v)}
                rows={2}
              />

              <h3 className="text-base md:text-lg font-headline font-bold text-white uppercase mb-4 mt-8">Products Page</h3>
              <InputGroup
                label="Products Title"
                value={seoSettings.productsTitle}
                onChange={(v) => handleChange('productsTitle', v)}
              />
              <TextAreaGroup
                label="Products Description"
                value={seoSettings.productsDescription}
                onChange={(v) => handleChange('productsDescription', v)}
                rows={2}
              />

              <h3 className="text-base md:text-lg font-headline font-bold text-white uppercase mb-4 mt-8">Contact Page</h3>
              <InputGroup
                label="Contact Title"
                value={seoSettings.contactTitle}
                onChange={(v) => handleChange('contactTitle', v)}
              />
              <TextAreaGroup
                label="Contact Description"
                value={seoSettings.contactDescription}
                onChange={(v) => handleChange('contactDescription', v)}
                rows={2}
              />
            </>
          )}
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="lg:sticky lg:top-6 space-y-4 md:space-y-6">
            <div className="bg-surface-container-highest rounded-xl p-4 md:p-6 border border-outline-variant/15">
              <h3 className="text-base md:text-lg font-headline font-bold text-white uppercase mb-4 flex items-center gap-2">
                <Icons.File className="text-primary-container" />
                Search Preview
              </h3>
              
              {/* Google Search Result Preview */}
              <div className="bg-background rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <div className="w-7 h-7 bg-primary-container rounded-full flex items-center justify-center">
                    <span className="text-on-primary font-bold text-xs">A</span>
                  </div>
                  <span>{seoSettings.siteName}</span>
                </div>
                <h4 className="text-blue-400 text-lg hover:underline cursor-pointer font-medium">
                  {seoSettings.defaultTitle}
                </h4>
                <p className="text-white/60 text-sm line-clamp-2">
                  {seoSettings.defaultDescription}
                </p>
                <div className="text-white/40 text-xs">
                  {seoSettings.siteUrl}
                </div>
              </div>

              <h3 className="text-lg font-headline font-bold text-white uppercase mb-4 mt-6 flex items-center gap-2">
                <Icons.Instagram className="text-primary-container" />
                Social Media Preview
              </h3>
              
              {/* Facebook/OG Preview */}
              <div className="bg-[#3b5998] rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">f</span>
                  </div>
                  <span className="text-white/80 text-sm">Facebook</span>
                </div>
                <div className="bg-white rounded-lg overflow-hidden">
                  <div className="h-32 bg-surface-container flex items-center justify-center">
                    <Icons.Image className="text-4xl text-white/20" />
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-gray-500 uppercase">{seoSettings.siteName.toLowerCase()}</div>
                    <div className="font-bold text-gray-900 text-sm line-clamp-1">{seoSettings.ogTitle}</div>
                    <div className="text-gray-600 text-xs line-clamp-2 mt-1">{seoSettings.ogDescription}</div>
                  </div>
                </div>
              </div>

              {/* Twitter Preview */}
              <div className="bg-[#1DA1F2] rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">𝕏</span>
                  </div>
                  <span className="text-white/80 text-sm">Twitter / X</span>
                </div>
                <div className="bg-white/10 rounded-lg overflow-hidden">
                  <div className="h-32 bg-surface-container flex items-center justify-center">
                    <Icons.Image className="text-4xl text-white/20" />
                  </div>
                  <div className="p-3">
                    <div className="font-bold text-white text-sm line-clamp-1">{seoSettings.ogTitle}</div>
                    <div className="text-white/70 text-xs line-clamp-2 mt-1">{seoSettings.ogDescription}</div>
                    <div className="text-white/50 text-xs mt-2">{seoSettings.siteUrl}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Score Tips */}
            <div className="bg-surface-container-highest rounded-xl p-6 border border-outline-variant/15">
              <h3 className="text-base md:text-lg font-headline font-bold text-white uppercase mb-4 flex items-center gap-2">
                <Icons.Certificate className="text-primary-container" />
                SEO Tips
              </h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Keep titles under 60 characters for best display</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Descriptions should be 150-160 characters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Use relevant keywords naturally in descriptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>OG images should be 1200x630px for best results</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Enable Analytics to track visitor behavior</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
interface InputGroupProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

function InputGroup({ label, value, onChange, placeholder, type = 'text' }: InputGroupProps) {
  return (
    <div>
      <label className="block text-white/80 font-headline uppercase text-[10px] md:text-xs mb-2 tracking-widest">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface-container border border-outline-variant/15 rounded-lg px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-white focus:outline-none focus:border-primary-container transition-colors"
      />
    </div>
  );
}

interface TextAreaGroupProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

function TextAreaGroup({ label, value, onChange, placeholder, rows = 3 }: TextAreaGroupProps) {
  return (
    <div>
      <label className="block text-white/80 font-headline uppercase text-[10px] md:text-xs mb-2 tracking-widest">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-surface-container border border-outline-variant/15 rounded-lg px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-white focus:outline-none focus:border-primary-container transition-colors resize-none"
      />
    </div>
  );
}
