export const EVENT_TEMPLATES: Record<string, string[]> = {
  concert: [
    "Get ready for an unforgettable night at {title}! Join us for a spectacular musical experience featuring top-tier performances and an electric atmosphere. Whether you're a die-hard fan or just looking for a great night out, this is the event to be at. {tagline_section} Don't miss out on what promises to be the highlight of the season!",
    "Experience the magic of live music at {title}. We're bringing you an evening filled with incredible rhythm, soul-stirring melodies, and high-energy vibes. {tagline_section} Gather your friends and make memories that will last a lifetime. Book your spot now!",
    "{title} is here to rock your world! Prepare for a sonic journey that will keep you on your feet all night long. With a lineup designed to impress and a venue set for the perfect sound, this concert is a must-attend. {tagline_section} Grab your tickets before they sell out!"
  ],
  sports: [
    "Witness history in the making at {title}! The stakes are high and the energy is palpable as top competitors face off in this thrilling showdown. {tagline_section} Be part of the roaring crowd and cheer for your favorites. Secure your seats today for an adrenaline-pumping experience!",
    "It's game time at {title}! Join fellow sports enthusiasts for a display of skill, passion, and competitive spirit. {tagline_section} Whether you're rooting for the home team or just love the game, this event delivers non-stop action. Get your tickets now!",
    "Feel the rush of the game at {title}. We're set for an intense battle that will keep you on the edge of your seat. {tagline_section} Bring your team colors and get ready to shout! This is more than just a game; it's an experience."
  ],
  conference: [
    "Expand your horizons at {title}, the premier gathering for industry leaders and innovators. {tagline_section} Engage in thought-provoking discussions, network with professionals, and gain actionable insights to drive your success. Register now to secure your place at the forefront of the industry.",
    "Join the conversation at {title}. We're bringing together the brightest minds to explore the latest trends and challenges. {tagline_section} With keynotes, panels, and networking opportunities, this conference is your gateway to new opportunities. Don't miss this chance to learn and grow.",
    "Elevate your career at {title}. Connect with experts, discover cutting-edge strategies, and find inspiration for your next big project. {tagline_section} This is the event where ideas meet action. Sign up today and be part of the future."
  ],
  festival: [
    "Celebrate life, culture, and community at {title}! immerse yourself in a vibrant atmosphere filled with music, art, and delicious food. {tagline_section} There's something for everyone to enjoy. Come with your family and friends for a joyous day out!",
    "Step into a world of wonder at {title}. We've curated a festival experience that dazzles the senses and warms the heart. {tagline_section} explore unique stalls, enjoy live entertainment, and make new friends. It's a celebration you won't want to miss!",
    "{title} invites you to the ultimate celebration! Join the festivities and soak up the good vibes. {tagline_section} From sunrise to sunset, we promise fun, laughter, and unforgettable moments. Get your tickets and let the party begin!"
  ],
  theater: [
    "Experience the drama, the emotion, and the art at {title}. Our latest production promises to captivate your imagination and touch your heart. {tagline_section} With stellar performances and stunning set design, this is theater at its finest. Reserve your seats for a magical evening.",
    "The curtain rises at {title}! Join us for a powerful performance that tells a story like no other. {tagline_section} Whether you love comedy or tragedy, this show delivers purely entertainment. Don't wait—book your tickets for a night of culture and creativity.",
    "Immerse yourself in the world of storytelling at {title}. Witness a masterpiece unfold on stage, brought to life by a talented cast. {tagline_section} It's an experience that will stay with you long after the final bow. Get your tickets today!"
  ],
  comedy: [
    "Get ready to laugh until it hurts at {title}! We've gathered the funniest acts for a night of non-stop comedy. {tagline_section} Leave your worries at the door and enjoy an evening of hilarity and good vibes. Grab your tickets and bring your sense of humor!",
    "{title} is bringing the jokes! Join us for a comedy showcase that guarantees belly laughs and great times. {tagline_section} Perfect for a date night or a hang out with friends. Don't miss the funniest event of the year—book now!",
    "Comedy night done right at {title}. Prepare for sharp wit, hilarious anecdotes, and a room full of laughter. {tagline_section} It's the perfect way to unwind and have a blast. Tickets are selling fast, so get yours today!"
  ],
  networking: [
    "Connect, collaborate, and grow at {title}. This is your opportunity to meet like-minded professionals and expand your network. {tagline_section} With a relaxed atmosphere and structured activities, making new connections has never been easier. Register now!",
    "Unlock new opportunities at {title}. Whether you're looking for partners, mentors, or clients, this is the place to be. {tagline_section} Bring your business cards and your best elevator pitch. Join us for an evening of productive networking.",
    "Build meaningful connections at {title}. We bring together a diverse group of individuals eager to share ideas and opportunities. {tagline_section} Don't miss this chance to strengthen your professional circle. Sign up today!"
  ],
  workshop: [
    "Master new skills at {title}. Our hands-on workshop is designed to give you practical knowledge and confidence. {tagline_section} Led by industry experts, this session is perfect for beginners and pros alike. Reserve your spot and start learning!",
    "Get creative at {title}! Join us for an interactive session where you'll learn, create, and inspire. {tagline_section} All materials are provided—just bring your enthusiasm. Space is limited, so book your ticket now to secure your place.",
    "Level up your game at {title}. Dive deep into the subject matter with focused training and personalized guidance. {tagline_section} Whether for career or hobby, this workshop delivers value. Don't miss out—register today!"
  ],
  other: [
    "Welcome to {title}, an event like no other! We've planned a unique experience just for you. {tagline_section} Expect the unexpected and get ready for a memorable time. Join us and be part of something special.",
    "Join us at {title} for an exciting gathering. We're bringing people together for a common purpose and a great time. {tagline_section} It's going to be an event to remember. Get your tickets and see what it's all about!",
    "Discover something new at {title}. We're hosting a special event that promises to engage and entertain. {tagline_section} Come with an open mind and leave with great memories. We can't wait to see you there!"
  ]
};

export const generateDescription = (
  category: string,
  title: string,
  tagline?: string
): string => {
  const normalizedCategory = category.toLowerCase();
  
  // Fallback to 'other' if category doesn't exist
  const templates = EVENT_TEMPLATES[normalizedCategory] || EVENT_TEMPLATES['other'];
  
  // Pick a random template
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Format tagline section
  const taglineSection = tagline ? `${tagline}.` : "";
  
  // Replace placeholders
  return template
    .replace(/{title}/g, title || "this event")
    .replace(/{tagline_section}/g, taglineSection);
};
