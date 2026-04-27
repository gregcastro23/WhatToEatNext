'use client';

import React, { useState } from 'react';

/**
 * MobileNavToggle
 * Hamburger menu button that toggles a mobile navigation drawer.
 * Only renders on screens smaller than xl breakpoint.
 */
export default function MobileNavToggle({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Hamburger button — visible only on mobile/tablet */}
            <button
                onClick={() => setOpen(!open)}
                className="xl:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-purple-900/80 border border-purple-400/60 shadow-lg shadow-purple-900/40 hover:bg-purple-800/90 hover:border-purple-300 transition-all duration-200 backdrop-blur-sm"
                aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={open}
            >
                {open ? (
                    <svg className="w-5 h-5 text-purple-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5 text-purple-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                )}
            </button>

            {/* Mobile slide-down panel — dark glassmorphism */}
            {open && (
                <div
                    className="xl:hidden absolute left-0 right-0 top-full z-50 shadow-2xl shadow-purple-900/50"
                    onClick={() => setOpen(false)}
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-[#08080e]/95 backdrop-blur-xl border-b-2 border-purple-500/40"
                        style={{ backgroundImage: 'radial-gradient(ellipse at top, rgba(109,40,217,0.15) 0%, transparent 70%)' }}
                    />
                    <nav
                        className="relative flex flex-col gap-1.5 p-4 max-h-[75vh] overflow-y-auto"
                        aria-label="Mobile navigation"
                        onClick={e => e.stopPropagation()}
                    >
                        {children}
                    </nav>
                </div>
            )}
        </>
    );
}
