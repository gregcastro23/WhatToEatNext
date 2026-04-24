'use client';

import React, { useState } from 'react';

/**
 * MobileNavToggle
 * Hamburger menu button that toggles a mobile navigation drawer.
 * Only renders on screens smaller than md breakpoint.
 */
export default function MobileNavToggle({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Hamburger button — visible only on mobile */}
            <button
                onClick={() => setOpen(!open)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/80 border border-purple-200 shadow-sm hover:bg-purple-100 transition-colors"
                aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={open}
            >
                {open ? (
                    <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                )}
            </button>

            {/* Mobile slide-down panel */}
            {open && (
                <div
                    className="md:hidden absolute left-0 right-0 top-full z-50 bg-gradient-to-b from-purple-50 to-orange-50 border-b-2 border-purple-200 shadow-xl animate-[slideDown_0.2s_ease-out]"
                    onClick={() => setOpen(false)}
                >
                    <nav className="flex flex-col gap-1 p-4 max-h-[70vh] overflow-y-auto" aria-label="Mobile navigation">
                        {children}
                    </nav>
                </div>
            )}
        </>
    );
}
