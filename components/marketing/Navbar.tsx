'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight, UserCheck } from 'lucide-react';
import type { Batch } from '@/lib/types';
import { useRegistration } from '@/components/site/registration-context';

interface NavbarProps {
  activeBatch?: Batch | null;
}

export const Navbar: React.FC<NavbarProps> = ({ activeBatch }) => {
  const { openRegistration: onJoinClick } = useRegistration();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'Masterclass', href: '#current-batch' },
    { label: "What You'll Learn", href: '#modules' },
    { label: '6-Day Roadmap', href: '#roadmap' },
    { label: 'Mentor', href: '#mentor' },
    { label: 'Student Experiences', href: '#speakers' },
    { label: 'FAQs', href: '#faqs' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const elem = document.querySelector(href);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="main-navbar"
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3'
          : 'bg-white border-b border-slate-100 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 group cursor-pointer"
            id="navbar-brand-logo"
          >
            <img src="/logo.jpeg" alt="The Umbrella Network" className="w-20 h-20 rounded-xl object-contain" />
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg leading-tight flex items-center gap-1.5">
                The Umbrella Network
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
                CA Harsh Kaushik
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6" id="desktop-nav-links">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Right CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/admin/login"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-slate-200 transition-all flex items-center gap-1"
              title="Admin Portal"
              id="nav-admin-link"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>

            <button
              onClick={() => onJoinClick(activeBatch || undefined)}
              id="navbar-join-cta"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Join Masterclass – ₹999 <span className="text-blue-100 line-through">₹1999</span></span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => onJoinClick(activeBatch || undefined)}
              className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg"
              id="mobile-nav-join-mini"
            >
              ₹999
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Menu"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 gap-1 py-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onJoinClick(activeBatch || undefined);
              }}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md text-base"
              id="mobile-dropdown-join-cta"
            >
              <span>Join Masterclass – ₹999</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between px-2 pt-1 text-xs text-slate-500">
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="underline hover:text-slate-800"
              >
                Admin Login
              </Link>
              <span className="font-semibold text-blue-700">{activeBatch?.batch_number || 'Batch'} Open</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
