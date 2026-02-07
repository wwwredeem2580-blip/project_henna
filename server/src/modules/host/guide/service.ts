import { HostGuideProgress } from "../../../database/host/guide";
import { User } from "../../../database/auth/auth";
import CustomError from "../../../utils/CustomError";

export const getHostGuideProgressService = async (userId: string) => {
    let progress = await HostGuideProgress.findOne({ user: userId });

    if (!progress) {
        // Auto-create progress record if it doesn't exist
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError("User not found", 404);
        }

        progress = await HostGuideProgress.create({
            user: userId,
            completedItems: [],
            currentLevel: 1,
            earnedBadges: []
        });
    }

    return progress;
};

export const updateHostGuideProgressService = async (userId: string, completedItems: string[]) => {
    let progress = await HostGuideProgress.findOne({ user: userId });

    if (!progress) {
        progress = new HostGuideProgress({ user: userId });
    }

    // Logic to calculate level and badges could go here or be simple for now
    // For now, let's just update the items. 
    // If we want to gamify, we can count items and upgrade level.
    
    // De-duplicate items
    const uniqueItems = Array.from(new Set(completedItems));
    
    progress.completedItems = uniqueItems;
    
    // Simple level logic: 1 level per 5 items? Or just store what FE sends?
    // The requirement said "Level Up" on complete phases.
    // Maybe the FE sends the level too? Or we calculate it here.
    // Let's stick to simple item storage for now, and maybe basic level calc.
    // 5 phases. Let's say 1 level per phase completed?
    // But we don't know which items belong to which phase here easily without a map.
    // Let's just trust the FE state for "currentLevel" for now? 
    // No, better to calculate it or just let the FE update it explicitly if we want to be flexible.
    // Actually, the prompt says "Implement logic to trigger 'Level Up'".
    // Let's keep it simple: We save what we get. The FE can determine when to show the animation.
    // But for security, server should probably own the level.
    // Let's assume the FE sends the *newly* completed item, and we add it. 
    // But the payload here is `completedItems` (plural). 
    // Let's assume it's the *full list* of completed items.
    
    const count = uniqueItems.length;
    // Example: Level 1 = 0-5 items, Level 2 = 6-10, etc.
    let newLevel = 1;
    if (count >= 5) newLevel = 2;
    if (count >= 10) newLevel = 3;
    if (count >= 15) newLevel = 4;
    if (count >= 20) newLevel = 5;
    
    // Only level up, never level down (unless desired)
    if (newLevel > progress.currentLevel) {
        progress.currentLevel = newLevel;
        // Maybe add a badge?
        if (!progress.earnedBadges.includes(`level_${newLevel}`)) {
             progress.earnedBadges.push(`level_${newLevel}`);
        }
    }

    progress.lastUpdated = new Date();
    await progress.save();
    
    return progress;
};
