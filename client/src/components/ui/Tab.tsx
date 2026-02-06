import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface TabItem {
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  key?: string;
}

interface TabProps {
  tabs: TabItem[];
  initialTab?: number;
}

export default function Tab({ tabs, initialTab = 0 }: TabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Get tab from URL params
  const urlTab = searchParams.get('tab');
  
  // Find tab index from URL
  const getTabIndexFromUrl = () => {
    if (!urlTab) return initialTab;
    const tabIndex = tabs.findIndex(tab => tab.key === urlTab);
    return tabIndex >= 0 ? tabIndex : initialTab;
  };

  // Update active tab when URL changes
  useEffect(() => {
    const tabIndex = getTabIndexFromUrl();
    setActiveTab(tabIndex);
  }, [urlTab, tabs]);

  // Handle tab change
  const handleTabChange = (index: number) => {
    setActiveTab(index);
    
    // Update URL
    const newParams = new URLSearchParams(searchParams.toString());
    if (tabs[index]?.key) {
      newParams.set('tab', tabs[index].key);
    } else {
      newParams.delete('tab');
    }
    
    router.push(`?${newParams.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex hidden mx-auto max-w-[1080px] md:flex overflow-x-auto space-x-1 bg-slate-50 p-2">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabChange(index)}
            className={`flex-1 rounded-tr-md whitespace-nowrap rounded-bl-md px-4 py-2 text-sm font-medium transition-all ${
              activeTab === index
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex max-w-[1080px] mx-auto md:hidden overflow-x-auto space-x-1 bg-slate-50 p-2">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabChange(index)}
            className={`flex-1 rounded-tr-md whitespace-nowrap rounded-bl-md px-4 py-2 text-sm font-medium transition-all ${
              activeTab === index
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-600'
            }`}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6 max-w-[1080px] mx-auto">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
}