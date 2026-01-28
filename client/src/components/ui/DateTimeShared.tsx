import React, { useRef, useEffect } from 'react';

// Shared constants
export const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
export const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
export const AMPM = ['AM', 'PM'];
export const TIME_PRESETS = [
    { label: '9 am', h: 9, m: '00', p: 'AM' },
    { label: '12 pm', h: 12, m: '00', p: 'PM' },
    { label: '4 pm', h: 4, m: '00', p: 'PM' },
    { label: '6 pm', h: 6, m: '00', p: 'PM' }
];

export const ScrollColumn = ({ items, selected, onSelect }: { items: (string|number)[], selected: string|number, onSelect: (val: any) => void }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isScrolling = useRef(false);
    const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const ITEM_HEIGHT = 48;

    useEffect(() => {
        if (containerRef.current && !isScrolling.current) {
            const index = items.indexOf(selected as never);
            if (index !== -1) {
                containerRef.current.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' });
            }
        }
    }, [selected, items]);

    const handleScroll = () => {
        isScrolling.current = true;
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

        if (containerRef.current) {
            const scrollTop = containerRef.current.scrollTop;
            const index = Math.round(scrollTop / ITEM_HEIGHT);
            if (items[index] !== undefined && items[index] !== selected) {
                onSelect(items[index]);
            }
        }

        scrollTimeout.current = setTimeout(() => { isScrolling.current = false; }, 150);
    };

    return (
        <div className="relative h-[240px] w-full overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-24 z-10 pointer-events-none"></div>
            <div className="absolute inset-x-0 bottom-0 h-24 z-10 pointer-events-none"></div>
            <div ref={containerRef} onScroll={handleScroll} className="h-full no-scrollbar overflow-y-auto snap-y snap-mandatory py-[96px]">
                {items.map((item) => (
                    <div key={item} onClick={() => { isScrolling.current = false; onSelect(item); }} className={`snap-center h-[48px] flex items-center justify-center cursor-pointer transition-all duration-300 select-none ${item == selected ? 'text-2xl font-bold text-slate-900 scale-100 opacity-100' : 'text-lg font-medium text-slate-400 scale-90 opacity-40 hover:opacity-70 blur-[0.5px]'}`}>
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
};
