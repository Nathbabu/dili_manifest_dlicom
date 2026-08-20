// Dili Manifest - Clean Data Store (25 Character Matrix & Discord Role Colors)
const TWIN_STUDIO_DATA = {
  // Default clean state
  initialUser: {
    discordConnected: false,
    discordUsername: null,
    discordId: null,
    discordAvatar: null,
    discordRoles: [],
    joinedServerDate: null,
    
    xConnected: false,
    xUsername: "",
    xDlicomPosts: 0,
    xDlicomImpressions: "0",
    xEngagementRate: "0%",

    currentRole: "none", // Starts on 'none' (Basic Mascot)
    selectedCharacterId: "cadet-mint", // Active character design ID
    
    customQuote: "Connect Discord to manifest your sovereign digital twin.",
    twinId: null,
    hash: "0x0000...0000"
  },

  roles: {
    none: {
      id: "none",
      name: "No Role",
      badgeTitle: "COMMUNITY CADET",
      tierLabel: "CADET CHASSIS",
      rankNumber: "T0",
      color: "#83958c",
      borderClass: "border-[#3f3f46]",
      textClass: "text-[#83958c]",
      bgClass: "bg-[#27272a]/20",
      glowClass: "shadow-none",
      defaultCharacter: "cadet-mint",
      baseResonance: 40.0,
      description: "Default community mascot chassis. Connect your Discord to read your server roles and unlock your exclusive role characters."
    },
    dliever: {
      id: "dliever",
      name: "Dliever",
      badgeTitle: "TIER 01 // DLIEVER",
      tierLabel: "DLIEVER CONSTRUCT",
      rankNumber: "T1",
      color: "#ec49c0", // Discord Hot Pink
      borderClass: "border-[#ec49c0]",
      textClass: "text-[#ec49c0]",
      bgClass: "bg-[#ec49c0]/10",
      glowClass: "glow-pink",
      defaultCharacter: "dliever-pink",
      baseResonance: 75.0,
      description: "Unlocked via Discord 'Dliever' role. Features hot pink identity and unlocks exclusive Tier 1 character designs."
    },
    decoded: {
      id: "decoded",
      name: "Dcoded",
      badgeTitle: "TIER 02 // DCODED",
      tierLabel: "DCODED ASCENDED",
      rankNumber: "T2",
      color: "#d2e823", // Discord Cyber Lime-Yellow
      borderClass: "border-[#d2e823]",
      textClass: "text-[#d2e823]",
      bgClass: "bg-[#d2e823]/10",
      glowClass: "glow-yellow",
      defaultCharacter: "decoded-yellow",
      baseResonance: 88.0,
      description: "Unlocked via Discord 'Dcoded' role. Features cyber lime-yellow identity and unlocks exclusive Tier 2 Ascended character designs."
    },
    dco: {
      id: "dco",
      name: "DCO",
      badgeTitle: "TIER 03 // DCO SOVEREIGN",
      tierLabel: "LEGENDARY MYTHIC",
      rankNumber: "T3",
      color: "#e2e8f0", // Discord Platinum Silver / White
      borderClass: "border-[#e2e8f0]",
      textClass: "text-[#e2e8f0]",
      bgClass: "bg-[#e2e8f0]/10",
      glowClass: "glow-silver",
      defaultCharacter: "dco-cobalt-silver",
      baseResonance: 96.0,
      description: "Unlocked via Discord 'DCO' role. Features sovereign platinum-silver identity and unlocks exclusive Tier 3 Mythic character designs."
    }
  },

  // 32 Characters: 8 Cadet + 8 Dliever + 8 Dcoded + 8 DCO
  characters: {
        none: [
      {
        id: "cadet-mint",
        name: "Neon Mint Cadet",
        tier: "none",
        themeName: "Neon Mint",
        themeHex: "#00ffc2",
        image: "assets/characters/cadet-mint.png",
        resonanceBonus: 1.0,
        description: "Official Dlicom base mascot in neon mint hero suit with white 'D' emblem."
      },
      {
        id: "cadet-red",
        name: "Crimson Red Cadet",
        tier: "none",
        themeName: "Crimson Red",
        themeHex: "#ef4444",
        image: "assets/characters/cadet-red.png",
        resonanceBonus: 1.0,
        description: "Official Dlicom base mascot in crimson red hero suit with cape and white 'D' emblem."
      },
      {
        id: "cadet-blue",
        name: "Cobalt Blue Cadet",
        tier: "none",
        themeName: "Cobalt Blue",
        themeHex: "#3b82f6",
        image: "assets/characters/cadet-blue.png",
        resonanceBonus: 1.0,
        description: "Official Dlicom base mascot in cobalt blue hero suit with cape and white 'D' emblem."
      },
      {
        id: "cadet-pink",
        name: "Hot Pink Cadet",
        tier: "none",
        themeName: "Hot Pink",
        themeHex: "#ec49c0",
        image: "assets/characters/cadet-pink.png",
        resonanceBonus: 1.0,
        description: "Official Dlicom base mascot in vibrant hot pink hero suit with cape and white 'D' emblem."
      },
      {
        id: "cadet-yellow",
        name: "Cyber Yellow Cadet",
        tier: "none",
        themeName: "Cyber Yellow",
        themeHex: "#eab308",
        image: "assets/characters/cadet-yellow.png",
        resonanceBonus: 1.0,
        description: "Official Dlicom base mascot in cyber yellow hero suit with cape and white 'D' emblem."
      },
      {
        id: "cadet-cyan",
        name: "Sky Cyan Cadet",
        tier: "none",
        themeName: "Sky Cyan",
        themeHex: "#06b6d4",
        image: "assets/characters/cadet-cyan.png",
        resonanceBonus: 1.0,
        description: "Official Dlicom base mascot in sky cyan hero suit with cape and white 'D' emblem."
      },
      {
        id: "cadet-purple",
        name: "Electric Purple Cadet",
        tier: "none",
        themeName: "Electric Purple",
        themeHex: "#a855f7",
        image: "assets/characters/cadet-purple.png",
        resonanceBonus: 1.0,
        description: "Official Dlicom base mascot in electric purple hero suit with cape and white 'D' emblem."
      },
      {
        id: "cadet-orange",
        name: "Orange Burst Cadet",
        tier: "none",
        themeName: "Orange Burst",
        themeHex: "#f97316",
        image: "assets/characters/cadet-orange.png",
        resonanceBonus: 1.0,
        description: "Official Dlicom base mascot in orange burst hero suit with cape and white 'D' emblem."
      }
    ],
    dliever: [
      {
        id: "dliever-pink",
        name: "Hot Pink Cyber Visor",
        tier: "dliever",
        themeName: "Hot Pink",
        themeHex: "#ec49c0",
        image: "assets/characters/dliever-pink.png",
        resonanceBonus: 4.2,
        description: "High-contrast neon pink digital visor and glowing cyber circuitry."
      },
      {
        id: "dliever-mint",
        name: "Mint Circuit Construct",
        tier: "dliever",
        themeName: "Neon Mint",
        themeHex: "#00ffc2",
        image: "assets/characters/dliever-mint.png",
        resonanceBonus: 3.5,
        description: "Neon mint circuit matrix etched suit with Dlicom chest branding."
      },
      {
        id: "dliever-orange",
        name: "Orange Burst Courier",
        tier: "dliever",
        themeName: "Orange Burst",
        themeHex: "#f97316",
        image: "assets/characters/dliever-orange.png",
        resonanceBonus: 3.8,
        description: "Vibrant orange digital visor, matching shoulder wrap, and courier telemetry."
      },
      {
        id: "dliever-neon-mint",
        name: "Neon Mint Protocol",
        tier: "dliever",
        themeName: "Protocol Mint",
        themeHex: "#00ffc2",
        image: "assets/characters/dliever-neon-mint.png",
        resonanceBonus: 4.0,
        description: "Full optic relay visor, technical fabric wrap with 3D collar 'D' logo."
      },
      {
        id: "dliever-yellow",
        name: "Cyber Yellow Grid",
        tier: "dliever",
        themeName: "Cyber Yellow",
        themeHex: "#eab308",
        image: "assets/characters/dliever-yellow.png",
        resonanceBonus: 3.7,
        description: "Yellow optic visor, golden circuit traces, and technical fabric cape."
      },
      {
        id: "dliever-blue",
        name: "Cobalt Blue Telemetry",
        tier: "dliever",
        themeName: "Cobalt Blue",
        themeHex: "#3b82f6",
        image: "assets/characters/dliever-blue.png",
        resonanceBonus: 3.9,
        description: "Cobalt blue sensor visor, matching wrap, and high-frequency antenna glow."
      },
      {
        id: "dliever-red",
        name: "Crimson Red Core",
        tier: "dliever",
        themeName: "Crimson Red",
        themeHex: "#ef4444",
        image: "assets/characters/dliever-red.png",
        resonanceBonus: 4.1,
        description: "High-intensity crimson red digital visor and energy routing suit."
      },
      {
        id: "dliever-purple",
        name: "Electric Purple Aura",
        tier: "dliever",
        themeName: "Electric Purple",
        themeHex: "#a855f7",
        image: "assets/characters/dliever-purple.png",
        resonanceBonus: 4.2,
        description: "Electric purple visor, violet matrix wrap, and deep charcoal ambient gradient."
      }
    ],
    decoded: [
      {
        id: "decoded-yellow",
        name: "Cyber Lime-Yellow Dcoded",
        tier: "decoded",
        themeName: "Cyber Lime-Yellow",
        themeHex: "#d2e823",
        image: "assets/characters/decoded-yellow.png",
        resonanceBonus: 5.8,
        description: "Ascended glowing cyber lime-yellow construct with Dcoded cyber visor and D-scepter."
      },
      {
        id: "decoded-pink",
        name: "Hot Pink Dcoded",
        tier: "decoded",
        themeName: "Hot Pink",
        themeHex: "#ec49c0",
        image: "assets/characters/decoded-pink.png",
        resonanceBonus: 5.5,
        description: "Ascended neon pink holographic construct with glowing Dcoded cyber visor and scepter."
      },
      {
        id: "decoded-cyan",
        name: "Sky Cyan Dcoded",
        tier: "decoded",
        themeName: "Sky Cyan",
        themeHex: "#06b6d4",
        image: "assets/characters/decoded-cyan.png",
        resonanceBonus: 5.6,
        description: "Ascended vibrant cyan entity with luminous Dcoded telemetry and crystalline scepter."
      },
      {
        id: "decoded-orange",
        name: "Orange Burst Dcoded",
        tier: "decoded",
        themeName: "Orange Burst",
        themeHex: "#f97316",
        image: "assets/characters/decoded-orange.png",
        resonanceBonus: 5.2,
        description: "Ascended orange burst glassy body with glowing Dcoded quantum core and scepter."
      },
      {
        id: "decoded-mint",
        name: "Neon Mint Dcoded",
        tier: "decoded",
        themeName: "Neon Mint",
        themeHex: "#00ffc2",
        image: "assets/characters/decoded-mint.png",
        resonanceBonus: 5.3,
        description: "Ascended neon mint construct with glowing green Dcoded visor, mantle, and scepter."
      },
      {
        id: "decoded-red",
        name: "Crimson Red Dcoded",
        tier: "decoded",
        themeName: "Crimson Red",
        themeHex: "#ef4444",
        image: "assets/characters/decoded-red.png",
        resonanceBonus: 5.4,
        description: "Ascended high-intensity crimson red entity with pulsing Dcoded core and scepter."
      },
      {
        id: "decoded-blue",
        name: "Cobalt Blue Dcoded",
        tier: "decoded",
        themeName: "Cobalt Blue",
        themeHex: "#3b82f6",
        image: "assets/characters/decoded-blue.png",
        resonanceBonus: 5.6,
        description: "Ascended cobalt blue holographic construct with glowing Dcoded optics and staff."
      },
      {
        id: "decoded-purple",
        name: "Electric Purple Dcoded",
        tier: "decoded",
        themeName: "Electric Purple",
        themeHex: "#a855f7",
        image: "assets/characters/decoded-purple.png",
        resonanceBonus: 5.7,
        description: "Ascended electric purple entity with glowing violet Dcoded matrix and scepter."
      }
    ],
    dco: [
      {
        id: "dco-cobalt-silver",
        name: "Cobalt Silver Scepter",
        tier: "dco",
        themeName: "Cobalt Silver",
        themeHex: "#e2e8f0",
        image: "assets/characters/dco-cobalt-silver.png",
        resonanceBonus: 8.0,
        description: "Silver ocular crown, midnight blue velvet mantle, cobalt crystal staff, and blue D-wings."
      },
      {
        id: "dco-gold-purple",
        name: "Sovereign Gold & Velvet",
        tier: "dco",
        themeName: "Sovereign Gold",
        themeHex: "#ffd700",
        image: "assets/characters/dco-gold-purple.png",
        resonanceBonus: 7.0,
        description: "High-collared electric purple velvet cape with glowing gold circuitry & holographic D wings."
      },
      {
        id: "dco-orange-copper",
        name: "Orange Burst & Copper Crown",
        tier: "dco",
        themeName: "Copper Crown",
        themeHex: "#f97316",
        image: "assets/characters/dco-orange-copper.png",
        resonanceBonus: 7.2,
        description: "Regal copper ocular crown with glowing orange gems and dark brown velvet mantle."
      },
      {
        id: "dco-pink-chrome",
        name: "Hot Pink Chrome & Velvet",
        tier: "dco",
        themeName: "Pink Chrome",
        themeHex: "#ec49c0",
        image: "assets/characters/dco-pink-chrome.png",
        resonanceBonus: 7.5,
        description: "Chrome ocular crown with pink gems, black velvet mantle, and metallic crystal staff."
      },
      {
        id: "dco-mint-ceramic",
        name: "Neon Mint Ceramic Crown",
        tier: "dco",
        themeName: "Mint Ceramic",
        themeHex: "#00ffc2",
        image: "assets/characters/dco-mint-ceramic.png",
        resonanceBonus: 7.3,
        description: "Regal white ceramic ocular crown with glowing mint gems and slate-grey velvet mantle."
      },
      {
        id: "dco-yellow-matte",
        name: "Cyber Yellow & Matte Black",
        tier: "dco",
        themeName: "Matte Black",
        themeHex: "#d2e823",
        image: "assets/characters/dco-yellow-matte.png",
        resonanceBonus: 7.4,
        description: "Matte black ocular crown with glowing yellow gems and dark-grey velvet mantle."
      },
      {
        id: "dco-crimson-obsidian",
        name: "Crimson Red Obsidian",
        tier: "dco",
        themeName: "Crimson Obsidian",
        themeHex: "#ef4444",
        image: "assets/characters/dco-crimson-obsidian.png",
        resonanceBonus: 7.6,
        description: "Crimson obsidian crown with holographic DCO floating wireframe typography."
      },
      {
        id: "dco-electric-purple",
        name: "Royal Purple & Sovereign Gold",
        tier: "dco",
        themeName: "Obsidian Purple",
        themeHex: "#a855f7",
        image: "assets/characters/dco-electric-purple.png",
        resonanceBonus: 7.9,
        description: "Regal golden/purple ocular crown, electric purple velvet mantle with gold circuit embroidery."
      }
    ]
  },

  quotes: [
    "Sovereign on-chain architect decoding raw digital ether across the Dlicom matrix.",
    "Ascension is not an upgrade; it is the revelation of raw on-chain consciousness.",
    "Rooted in cryptographic consensus, manifested in sovereign visual aesthetics.",
    "Harmonizing decentralized data streams into pure digital power.",
    "Transmuting on-chain impressions into legendary digital artifacts."
  ]
};
