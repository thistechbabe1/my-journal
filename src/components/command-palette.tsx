'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  BookOpen,
  Target,
  User,
  ClipboardList,
  Compass,
  CornerDownLeft,
  X
} from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: 'Journal' | 'Goal' | 'Review' | 'Identity' | 'Navigation';
  url: string;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const router = useRouter();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Toggle Command Palette on Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      
      // Close on Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleCustomToggle = () => {
      setIsOpen((prev) => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('toggle-search', handleCustomToggle);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('toggle-search', handleCustomToggle);
    };
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
      performSearch('');
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  const handleSelect = (item: SearchResult) => {
    router.push(item.url);
    setIsOpen(false);
  };

  // Perform search across tables
  const performSearch = async (searchTerm: string) => {
    if (!user) return;

    // Static Navigation Results
    const staticNavs: SearchResult[] = [
      { id: 'nav-dash', title: 'Dashboard', subtitle: 'View daily priorities, life wheel & habits', category: 'Navigation', url: '/' },
      { id: 'nav-ident', title: 'Identity Hub', subtitle: 'Reflect on core values, traits & legacy', category: 'Identity', url: '/identity' },
      { id: 'nav-jour', title: 'Daily Journal', subtitle: 'Write journal entries and view history', category: 'Journal', url: '/journal' },
      { id: 'nav-goal', title: 'Goals & Vision', subtitle: 'Manage categories and milestones', category: 'Goal', url: '/goals' },
      { id: 'nav-rev', title: 'Reviews', subtitle: 'Weekly, monthly, quarterly & annual reflection', category: 'Review', url: '/reviews' },
      { id: 'nav-hab', title: 'Habits Tracker', subtitle: 'Log daily completions & streaks', category: 'Navigation', url: '/habits' }
    ];

    if (!searchTerm.trim()) {
      setResults(staticNavs);
      return;
    }

    const term = searchTerm.toLowerCase();

    try {
      // 1. Fetch journals
      const { data: journals } = await supabase.from('journal_entries').select('*').eq('user_id', user.id);
      const journalResults: SearchResult[] = (journals || [])
        .filter((j: any) => j.content.toLowerCase().includes(term) || (j.learned && j.learned.toLowerCase().includes(term)))
        .map((j: any) => ({
          id: j.id,
          title: `Journal - ${new Date(j.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}`,
          subtitle: j.content.substring(0, 80) + '...',
          category: 'Journal',
          url: `/journal?id=${j.id}`
        }));

      // 2. Fetch goals
      const { data: goals } = await supabase.from('goals').select('*').eq('user_id', user.id);
      const goalResults: SearchResult[] = (goals || [])
        .filter((g: any) => g.title.toLowerCase().includes(term) || (g.description && g.description.toLowerCase().includes(term)))
        .map((g: any) => ({
          id: g.id,
          title: `Goal: ${g.title}`,
          subtitle: `Category: ${g.category} | Progress: ${g.progress}%`,
          category: 'Goal',
          url: '/goals'
        }));

      // 3. Filter Navigations
      const filteredNavs = staticNavs.filter(
        (n) => n.title.toLowerCase().includes(term) || n.subtitle.toLowerCase().includes(term)
      );

      // Merge and limit
      const merged = [...filteredNavs, ...goalResults, ...journalResults].slice(0, 8);
      setResults(merged);
      setSelectedIndex(0);
    } catch (err) {
      console.error('Command palette search error:', err);
    }
  };

  useEffect(() => {
    performSearch(query);
  }, [query]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Journal':
        return <BookOpen size={16} className="text-sharon-primary" />;
      case 'Goal':
        return <Target size={16} className="text-sharon-accent-dark dark:text-sharon-accent" />;
      case 'Review':
        return <ClipboardList size={16} className="text-blue-500" />;
      case 'Identity':
        return <User size={16} className="text-emerald-500" />;
      default:
        return <Compass size={16} className="text-sharon-muted" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 dialog-overlay">
          {/* Overlay backdrop animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0"
            onClick={() => setIsOpen(false)}
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            ref={containerRef}
            className="w-full max-w-2xl bg-card border border-card-border rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 max-h-[480px]"
            onKeyDown={handleKeyDown}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-card-border">
              <Search size={18} className="text-sharon-muted shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search anything... (e.g. goals, journal logs, core values)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-sm placeholder-sharon-muted py-0.5 text-foreground"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-sharon-muted hover:bg-sharon-muted-light/60 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto flex-1 p-2 space-y-0.5 scrollbar-thin">
              {results.length > 0 ? (
                results.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-sharon-primary-light/10 dark:bg-sharon-primary/20 text-foreground'
                          : 'text-sharon-muted hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-sharon-muted-light/50 flex items-center justify-center shrink-0">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate text-foreground">{item.title}</p>
                          <p className="text-[11px] text-sharon-muted truncate mt-0.5">{item.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] font-bold tracking-wider uppercase bg-sharon-muted-light px-2 py-0.5 rounded text-sharon-muted border border-card-border">
                          {item.category}
                        </span>
                        {isSelected && (
                          <div className="flex items-center text-[10px] text-sharon-muted gap-0.5 animate-pulse pl-1">
                            <span className="text-[10px]">Go</span>
                            <CornerDownLeft size={10} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm font-semibold text-sharon-muted">No results found</p>
                  <p className="text-xs text-sharon-muted/70 mt-1">
                    Try searching for different keywords or journal entries.
                  </p>
                </div>
              )}
            </div>

            {/* Dialog Footer */}
            <div className="px-4 py-2 bg-sharon-muted-light/30 border-t border-card-border flex items-center justify-between text-[10px] text-sharon-muted shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 bg-card border border-card-border rounded font-sans shadow-sm">↑↓</kbd> navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 bg-card border border-card-border rounded font-sans shadow-sm">Enter</kbd> select
                </span>
              </div>
              <span>Press <kbd className="px-1 bg-card border border-card-border rounded shadow-sm">Esc</kbd> to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
