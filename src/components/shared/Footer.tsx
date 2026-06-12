'use client';

import React from 'react';
import { Mail, Phone, Twitter, Linkedin, Instagram, MapPin, Youtube } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { CampusCredLogo } from './CampusCredLogo';
import { useAppStore } from '@/store';
import type { AppView } from '@/store';
import { PLATFORM_TAGLINE, PLATFORM_DOMAIN } from '@/lib/constants';

interface FooterLink {
  label: string;
  view: AppView;
}

const aboutLinks: FooterLink[] = [
  { label: 'About Us', view: 'landing' },
  { label: 'How It Works', view: 'landing' },
  { label: 'Blog', view: 'landing' },
  { label: 'Careers', view: 'landing' },
];

const studentLinks: FooterLink[] = [
  { label: 'Browse Tasks', view: 'landing' },
  { label: 'Certificates', view: 'landing' },
  { label: 'Portfolio Builder', view: 'landing' },
  { label: 'Leaderboard', view: 'landing' },
];

const companyLinks: FooterLink[] = [
  { label: 'Post Internships', view: 'company-register' },
  { label: 'Find Talent', view: 'company-register' },
  { label: 'Pricing', view: 'landing' },
  { label: 'Success Stories', view: 'landing' },
];

const socialLinks = [
  { icon: <Twitter className="h-4 w-4" />, href: '#', label: 'Twitter' },
  { icon: <Linkedin className="h-4 w-4" />, href: '#', label: 'LinkedIn' },
  { icon: <Instagram className="h-4 w-4" />, href: '#', label: 'Instagram' },
  { icon: <Youtube className="h-4 w-4" />, href: '#', label: 'YouTube' },
];

/**
 * Footer
 *
 * Design rules:
 * - Navy background (#0A0F2C) — use WHITE logo variant
 * - Logo centered at top, height 32px, links to landing
 * - 4px spacing grid throughout
 * - Text: white at various opacities (60% for links, 40% for copyright, 50% for descriptions)
 * - Column headings: Electric Blue Light (#60A5FA), uppercase tracking-wider, 12px font-semibold
 * - Links: 14px white/60%, hover → electric-light
 * - No glassmorphism, no animated social icons
 * - Social icons: 36x36 rounded-lg, white/5% bg, hover → white/10% bg + white text
 * - Section vertical spacing: 80px desktop / 48px mobile
 * - Contact items: 20px gap between icon and text
 */
export function Footer() {
  const { navigate } = useAppStore();

  return (
    <footer className="navy-bg text-white">
      <div className="mx-auto max-w-7xl px-4 pt-20 pb-8 sm:px-6 lg:px-8">
        {/* Centered Logo — white version, height 32px */}
        <div className="flex justify-center mb-12">
          <button
            onClick={() => navigate('landing')}
            className="focus:outline-none"
            aria-label="CampusCred Home"
          >
            <CampusCredLogo size={32} variant="white" />
          </button>
        </div>

        {/* Top Section — 5 columns */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="max-w-xs text-sm leading-relaxed text-white/50">
              {PLATFORM_TAGLINE} — India&apos;s most trusted student career ecosystem for real-world experience and verified credentials.
            </p>
            {/* Verification badge */}
            <div className="flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full border w-fit" style={{ backgroundColor: 'rgba(212,175,55,0.10)', borderColor: 'rgba(212,175,55,0.20)' }}>
              <CampusCredLogo size={24} variant="icon" />
              <span className="text-[12px] font-semibold" style={{ color: '#E8C84A' }}>Officially Verified Platform</span>
            </div>
            {/* Social Links — no animation, clean hover */}
            <div className="flex items-center gap-3 pt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:text-white"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.10)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* About Column */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#60A5FA' }}>
              About
            </h3>
            <ul className="flex flex-col gap-2.5">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.view)}
                    className="text-sm text-white/60 transition-colors hover:text-electric-light focus:outline-none"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For Students Column */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#60A5FA' }}>
              For Students
            </h3>
            <ul className="flex flex-col gap-2.5">
              {studentLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.view)}
                    className="text-sm text-white/60 transition-colors hover:text-electric-light focus:outline-none"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For Companies Column */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#60A5FA' }}>
              For Companies
            </h3>
            <ul className="flex flex-col gap-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.view)}
                    className="text-sm text-white/60 transition-colors hover:text-electric-light focus:outline-none"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#60A5FA' }}>
              Contact
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="mailto:creatorsports81@gmail.com"
                  className="flex items-center gap-2.5 text-sm text-white/60 transition-colors hover:text-electric-light"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  creatorsports81@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:9096341850"
                  className="flex items-center gap-2.5 text-sm text-white/60 transition-colors hover:text-electric-light"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  9096341850
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2.5 text-sm text-white/60">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Maharashtra, Pune, Mumbai</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Separator */}
        <Separator className="my-8" style={{ backgroundColor: 'rgba(255,255,255,0.10)' }} />

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} CampusCred. Developed under BrutalTools
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('landing')}
              className="text-xs text-white/40 transition-colors hover:text-white/60 focus:outline-none"
            >
              Terms of Service
            </button>
            <span className="text-white/20">|</span>
            <button
              onClick={() => navigate('landing')}
              className="text-xs text-white/40 transition-colors hover:text-white/60 focus:outline-none"
            >
              Privacy Policy
            </button>
            <span className="text-white/20">|</span>
            <button
              onClick={() => navigate('landing')}
              className="text-xs text-white/40 transition-colors hover:text-white/60 focus:outline-none"
            >
              Cookie Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
