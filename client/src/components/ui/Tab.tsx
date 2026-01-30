import { useState } from 'react';

interface TabItem {
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface TabProps {
  tabs: TabItem[];
  initialTab?: number;
}

export default function Tab({ tabs, initialTab = 0 }: TabProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex hidden mx-auto max-w-[1080px] md:flex overflow-x-auto space-x-1 bg-slate-50 p-2">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
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
            onClick={() => setActiveTab(index)}
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