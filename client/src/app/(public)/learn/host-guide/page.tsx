'use client';

import React, { useEffect, useState } from 'react';
import { GuidePhase } from '@/components/host/guide/GuidePhase';
import { GamificationHeader } from '@/components/host/guide/GamificationHeader';
import { GUIDE_PHASES, TOTAL_ITEMS } from './content';
import { apiClient } from '@/lib/api/client';
import { Loader2, Lock, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { LevelUpModal } from '@/components/host/guide/LevelUpModal';

// ... (existing helper function if any)

export default function HostGuidePage() {
  const [loading, setLoading] = useState(true);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<any>('/api/host/guide');
      setCompletedItems(data.completedItems || []);
      setCurrentLevel(data.currentLevel || 1);
      setEarnedBadges(data.earnedBadges || []);
      setIsAuthenticated(true);
    } catch (error) {
      console.log('User not authenticated or guide fetch failed', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (itemId: string) => {
    if (!isAuthenticated) return;

    const isCompleted = completedItems.includes(itemId);
    let newCompletedItems = [...completedItems];

    if (isCompleted) {
      newCompletedItems = newCompletedItems.filter(id => id !== itemId);
    } else {
      newCompletedItems.push(itemId);
    }

    // Optimistic update
    setCompletedItems(newCompletedItems);

    try {
      const data = await apiClient.post<any>('/api/host/guide/progress', {
        completedItems: newCompletedItems
      });
      
      // Check for level up
      if (data.currentLevel > currentLevel) {
        setShowLevelUpModal(true);
      }

      setCurrentLevel(data.currentLevel);
      setEarnedBadges(data.earnedBadges);
    } catch (error) {
      console.error('Failed to save progress', error);
      // Revert on error
      setCompletedItems(completedItems); 
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-brand-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-[896px] mx-auto pb-20">
      <LevelUpModal 
        isOpen={showLevelUpModal} 
        onClose={() => setShowLevelUpModal(false)} 
        newLevel={currentLevel} 
      />
      
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-3xl font-light text-neutral-800 mb-3">Host Operational Guide</h1>
        <p className="text-neutral-500">
          Master the art of event hosting. Follow this guide to ensure your event runs smoothly from publish to post-entry.
        </p>
      </div>

      {isAuthenticated ? (
        <GamificationHeader 
          currentLevel={currentLevel}
          completedItemsCount={completedItems.length}
          totalItemsCount={TOTAL_ITEMS}
          earnedBadges={earnedBadges}
        />
      ) : (
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-4">
           <div className="bg-brand-100 p-3 rounded-full text-brand-600">
              <Lock size={24} />
           </div>
           <div className="flex-1">
              <h3 className="font-semibold text-brand-900">Login to Track Progress</h3>
              <p className="text-sm text-brand-700">Sign in to save your checklist progress, earn badges, and level up your hosting skills!</p>
           </div>
           <Link href="/auth?tab=login" className="px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors">
              Login to Start
           </Link>
        </div>
      )}

      {/* Recommended Readings (Bonus) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
         <Link href="/learn/how-to-host-event" className="group p-4 rounded-xl border border-neutral-200 hover:border-brand-200 hover:shadow-sm transition-all bg-white flex items-center gap-3">
            <div className="bg-neutral-50 p-2.5 rounded-lg text-neutral-500 group-hover:text-brand-500 group-hover:bg-brand-50 transition-colors">
                <BookOpen size={20} />
            </div>
            <div>
                <h4 className="font-medium text-neutral-800 text-sm">How to Host</h4>
                <p className="text-xs text-neutral-500">The basics of creating an event</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-neutral-300 group-hover:text-brand-400 transition-colors" />
         </Link>
         <Link href="/learn/organizer-guidelines" className="group p-4 rounded-xl border border-neutral-200 hover:border-brand-200 hover:shadow-sm transition-all bg-white flex items-center gap-3">
             <div className="bg-neutral-50 p-2.5 rounded-lg text-neutral-500 group-hover:text-brand-500 group-hover:bg-brand-50 transition-colors">
                <BookOpen size={20} />
            </div>
            <div>
                <h4 className="font-medium text-neutral-800 text-sm">Organizer Guidelines</h4>
                <p className="text-xs text-neutral-500">Rules and best practices</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-neutral-300 group-hover:text-brand-400 transition-colors" />
         </Link>
      </div>

      {/* Guide Phases */}
      <div className="space-y-2">
         {GUIDE_PHASES.map((phase, index) => (
            <GuidePhase 
              key={phase.id}
              title={phase.title}
              description={phase.description}
              phaseNumber={phase.id}
              items={phase.items}
              completedItems={completedItems}
              onToggleItem={handleToggleItem}
              isLocked={!isAuthenticated}
            />
         ))}
      </div>

    </div>
  );
}
