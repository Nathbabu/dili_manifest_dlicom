// Twin Manifest - Single-Page Controller (25-Character Matrix + LocalStorage Persistence)
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Background Shader
  CyberShader.init('cyber-shader-canvas');

  const STORAGE_KEY = 'dlicom_twin_manifest_session_v4';

  // Application State
  const state = {
    user: JSON.parse(JSON.stringify(TWIN_STUDIO_DATA.initialUser)),
    roles: TWIN_STUDIO_DATA.roles,
    characters: TWIN_STUDIO_DATA.characters,
    quotes: TWIN_STUDIO_DATA.quotes,
    dlicomGuild: {
      name: "Dlicom Official",
      memberCount: "24,523",
      onlineCount: "834",
      inviteUrl: "https://discord.com/invite/dlicom"
    }
  };

  // LocalStorage Persistence
  function saveSession() {
    try {
      const sessionData = {
        discordConnected: state.user.discordConnected,
        discordUsername: state.user.discordUsername,
        discordId: state.user.discordId,
        discordAvatar: state.user.discordAvatar,
        serverRoles: state.user.serverRoles,
        joinedServerDate: state.user.joinedServerDate,
        currentRole: state.user.currentRole,
        selectedCharacterId: state.user.selectedCharacterId,
        xUsername: state.user.xUsername,
        xConnected: state.user.xConnected,
        customQuote: state.user.customQuote,
        savedAt: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    } catch (e) {
      console.warn('Could not save session to localStorage', e);
    }
  }

  function loadSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const sessionData = JSON.parse(raw);

      // Check if session is valid (keep for 30 days)
      const maxAge = 30 * 24 * 60 * 60 * 1000;
      if (sessionData.savedAt && (Date.now() - sessionData.savedAt) > maxAge) {
        localStorage.removeItem(STORAGE_KEY);
        return false;
      }

      state.user.discordConnected = Boolean(sessionData.discordConnected);
      state.user.discordUsername = sessionData.discordUsername || null;
      state.user.discordId = sessionData.discordId || null;
      state.user.discordAvatar = sessionData.discordAvatar || null;
      state.user.serverRoles = (sessionData.serverRoles || []).map(r => r === '1475392943178383502' ? 'Giveaways' : r).filter(r => !/^\d{10,}$/.test(String(r).trim()) && r !== '@everyone');
      state.user.joinedServerDate = sessionData.joinedServerDate || null;
      state.user.currentRole = sessionData.currentRole || 'none';
      state.user.selectedCharacterId = sessionData.selectedCharacterId || (state.roles[state.user.currentRole] || state.roles.none).defaultCharacter;
      state.user.xUsername = sessionData.xUsername || "";
      state.user.xConnected = Boolean(sessionData.xUsername);
      if (sessionData.customQuote) state.user.customQuote = sessionData.customQuote;

      return true;
    } catch (e) {
      console.warn('Could not restore session from localStorage', e);
      return false;
    }
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEY);
    state.user = JSON.parse(JSON.stringify(TWIN_STUDIO_DATA.initialUser));
    state.user.xUsername = "";
    state.user.xConnected = false;
    
    const directXInput = document.getElementById('x-direct-input');
    if (directXInput) directXInput.value = "";

    CyberAudio.click();
    showToast("Discord account disconnected.", "pink");
    renderApp();
  }

  // Fetch Live Dlicom Server Data
  async function loadDlicomGuildData() {
    try {
      const res = await fetch('/api/discord/guild');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          state.dlicomGuild.name = data.name;
          state.dlicomGuild.memberCount = Number(data.memberCount).toLocaleString();
          state.dlicomGuild.onlineCount = Number(data.onlineCount).toLocaleString();
          state.dlicomGuild.inviteUrl = data.inviteUrl || "https://discord.com/invite/dlicom";
        }
      }
    } catch (e) {}
  }

  // Toast Notification System
  function showToast(message, type = 'mint') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'pink' ? 'toast-pink' : type === 'gold' ? 'toast-gold' : ''}`;
    toast.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-sm ${type === 'pink' ? 'text-[#ec49c0]' : type === 'gold' ? 'text-[#d2e823]' : 'text-emerald-400'}">
            ${type === 'pink' ? 'bolt' : type === 'gold' ? 'verified' : 'check_circle'}
          </span>
          <span class="font-mono-tech text-xs text-white">${message}</span>
        </div>
        <button class="text-on-surface-variant hover:text-white text-xs">&times;</button>
      </div>
    `;

    toast.querySelector('button').addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    });

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  }

  // Get Active Character Object
  function getActiveCharacter() {
    const roleId = state.user.currentRole || 'none';
    const roleChars = state.characters[roleId] || state.characters.none;
    const active = roleChars.find(c => c.id === state.user.selectedCharacterId);
    return active || roleChars[0] || state.characters.none[0];
  }

  // Calculate Overall Resonance
  function calculateResonance() {
    if (!state.user.discordConnected) {
      return "0.0";
    }

    const roleId = state.user.currentRole;
    const roleInfo = state.roles[roleId] || state.roles.none;
    let base = roleInfo.baseResonance;

    // Add character design bonus
    const activeChar = getActiveCharacter();
    if (activeChar && activeChar.resonanceBonus) {
      base += activeChar.resonanceBonus;
    }

    // Add bonus if X connected/entered
    if (state.user.xConnected && state.user.xUsername) {
      base += 2.0;
    }

    return Math.min(99.9, base).toFixed(1);
  }

  // Main UI Re-render
  function renderApp() {
    const isConnected = state.user.discordConnected;
    const roleId = state.user.currentRole || 'none';
    const roleInfo = state.roles[roleId] || state.roles.none;
    const activeChar = getActiveCharacter();
    const resonance = calculateResonance();

    // 1. Top Bar Status Chips
    const discordChip = document.getElementById('top-discord-status');
    if (discordChip) {
      discordChip.innerHTML = isConnected 
        ? `<span class="w-1.5 h-1.5 rounded-full bg-[#5865F2] animate-pulse"></span> ${state.user.discordUsername}`
        : `<span class="text-on-surface-variant">Discord Unlinked</span>`;
    }

    const xChip = document.getElementById('top-x-status');
    if (xChip) {
      const handle = state.user.xUsername && state.user.xUsername.trim();
      xChip.innerHTML = handle 
        ? `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> @${handle}`
        : `<span class="text-on-surface-variant">X Unlinked</span>`;
    }

    // 2. Discord Section Status
    const discordNameDisplay = document.getElementById('discord-username-display');
    if (discordNameDisplay) {
      discordNameDisplay.innerText = isConnected ? state.user.discordUsername : "Not Connected";
    }

    const discordRoleBadge = document.getElementById('discord-role-badge');
    if (discordRoleBadge) {
      if (isConnected) {
        discordRoleBadge.innerText = roleInfo.name.toUpperCase();
        discordRoleBadge.className = `font-mono-tech text-xs px-2.5 py-0.5 border ${roleInfo.borderClass} ${roleInfo.textClass} ${roleInfo.bgClass} uppercase font-bold`;
      } else {
        discordRoleBadge.innerText = "UNLINKED";
        discordRoleBadge.className = `font-mono-tech text-xs px-2.5 py-0.5 border border-[#3f3f46] text-on-surface-variant bg-[#27272a]/20 uppercase font-bold`;
      }
    }

    const disconnectBtn = document.getElementById('btn-discord-disconnect');
    if (disconnectBtn) {
      if (isConnected) {
        disconnectBtn.classList.remove('hidden');
      } else {
        disconnectBtn.classList.add('hidden');
      }
    }

    // Display Server Roles List in UI with Exact Discord Role Pill Colors
    const rolesListContainer = document.getElementById('discord-server-roles-list');
    if (rolesListContainer) {
      const displayRoles = (state.user.serverRoles || []).map(r => r === '1475392943178383502' ? 'Giveaways' : r).filter(r => !/^\d{10,}$/.test(String(r).trim()) && r !== '@everyone');
      if (isConnected && displayRoles.length > 0) {
        const rolePillsHtml = displayRoles.map(roleName => {
          const rLower = String(roleName).toLowerCase();
          let dotColor = "bg-gray-400";
          let textColor = "text-[#ddd]";
          let bgColor = "bg-[#18181c]";
          let borderColor = "border-[#2c2c34]";

          // Discord-Accurate Role Colors
          if (rLower.includes('dco')) {
            dotColor = "bg-[#e2e8f0]"; // Platinum Silver
            textColor = "text-slate-100 font-bold";
            bgColor = "bg-slate-400/15";
            borderColor = "border-slate-300/40";
          } else if (rLower.includes('decoded') || rLower.includes('dcoded')) {
            dotColor = "bg-[#d2e823]"; // Lime-Yellow
            textColor = "text-[#d2e823] font-bold";
            bgColor = "bg-[#d2e823]/15";
            borderColor = "border-[#d2e823]/40";
          } else if (rLower.includes('dliever') || rLower.includes('deliver')) {
            dotColor = "bg-[#ec49c0]"; // Hot Pink
            textColor = "text-[#ec49c0] font-bold";
            bgColor = "bg-[#ec49c0]/15";
            borderColor = "border-[#ec49c0]/40";
          } else if (rLower.includes('og') || rLower.includes('early')) {
            dotColor = "bg-amber-400"; // Gold / Amber
            textColor = "text-amber-200 font-bold";
            bgColor = "bg-amber-500/15";
            borderColor = "border-amber-500/40";
          } else if (rLower.includes('ambassador')) {
            dotColor = "bg-purple-400"; // Royal Violet
            textColor = "text-purple-200 font-bold";
            bgColor = "bg-purple-500/15";
            borderColor = "border-purple-500/40";
          } else if (rLower.includes('booster')) {
            dotColor = "bg-pink-400"; // Server Booster Pink
            textColor = "text-pink-200 font-bold";
            bgColor = "bg-pink-500/15";
            borderColor = "border-pink-500/40";
          } else if (rLower.includes('mod') || rLower.includes('admin')) {
            dotColor = "bg-cyan-400"; // Mod Cyan
            textColor = "text-cyan-200 font-bold";
            bgColor = "bg-cyan-500/15";
            borderColor = "border-cyan-500/40";
          } else if (rLower.includes('app user') || rLower.includes('dlicom')) {
            dotColor = "bg-blue-400";
            textColor = "text-blue-200";
            bgColor = "bg-blue-500/15";
            borderColor = "border-blue-500/30";
          } else if (rLower.includes('verified')) {
            dotColor = "bg-emerald-400";
            textColor = "text-emerald-200";
            bgColor = "bg-emerald-500/15";
            borderColor = "border-emerald-500/30";
          }

          return `
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${borderColor} ${bgColor} ${textColor} text-[11px] font-mono-tech">
              <span class="w-2 h-2 rounded-full ${dotColor}"></span>
              <span>${roleName}</span>
            </div>
          `;
        }).join('');

        rolesListContainer.innerHTML = `
          <div class="mt-3.5 pt-3.5 border-t border-[#27272a]">
            <div class="font-mono-tech text-[10px] text-on-surface-variant uppercase mb-2 flex items-center justify-between">
              <span>Dlicom Verified Roles:</span>
              <span class="text-emerald-400 font-bold">✓ Synced from Discord (Saved)</span>
            </div>
            <div class="flex flex-wrap gap-1.5">
              ${rolePillsHtml}
            </div>
          </div>
        `;
      } else {
        rolesListContainer.innerHTML = '';
      }
    }

            // 3. Section 3: Role Character Selector
    const armoryTierBadge = document.getElementById('armory-tier-badge');
    const selectorIntroEl = document.getElementById('character-selector-intro');
    const designsGridEl = document.getElementById('character-designs-grid');

    if (designsGridEl) {
      if (!isConnected) {
        if (armoryTierBadge) {
          armoryTierBadge.innerText = "LOCKED // CONNECT DISCORD";
          armoryTierBadge.className = "font-mono-tech text-[10px] text-on-surface-variant font-bold uppercase";
        }
        if (selectorIntroEl) {
          selectorIntroEl.innerText = "Connect your Dlicom Discord account above to automatically unlock your verified role tier and character designs.";
        }
        designsGridEl.className = "block";
        designsGridEl.innerHTML = `
          <div class="p-8 border border-[#27272a] bg-[#09090b] text-center">
            <div class="w-12 h-12 mx-auto rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center mb-3 text-on-surface-variant">
              <span class="material-symbols-outlined text-2xl text-on-surface-variant">lock</span>
            </div>
            <h4 class="font-display font-bold text-white text-base tracking-wide uppercase">Character Matrix Locked</h4>
            <p class="font-mono-tech text-xs text-on-surface-variant mt-2 max-w-md mx-auto leading-relaxed">
              Connect your Dlicom Discord above. Your verified server role will automatically unlock your corresponding character gallery.
            </p>
          </div>
        `;
      } else if (roleId === 'none') {
        const cadetChars = state.characters.none || [];
        if (armoryTierBadge) {
          armoryTierBadge.innerText = `COMMUNITY CADET (${cadetChars.length} DESIGNS)`;
          armoryTierBadge.className = "font-mono-tech text-[10px] text-[#00ffc2] font-bold uppercase";
        }
        if (selectorIntroEl) {
          selectorIntroEl.innerHTML = `You are authenticated as <strong class="text-white">Community Cadet</strong>. Click any of your 8 basic mascot designs to equip it, or upgrade your role in Discord to unlock higher tiers:`;
        }

        designsGridEl.className = "grid grid-cols-2 sm:grid-cols-4 gap-3";
        designsGridEl.innerHTML = cadetChars.map((c) => {
          const isSelected = c.id === activeChar.id;
          return `
            <div class="character-select-card group relative p-2.5 border ${isSelected ? 'border-[#00ffc2] bg-[#00ffc2]/10 shadow-[0_0_15px_rgba(0,255,194,0.25)]' : 'border-[#27272a] bg-[#0c0c10] hover:border-white/50'} transition-all cursor-pointer flex flex-col justify-between" data-char-id="${c.id}">
              <!-- Thumbnail Viewport -->
              <div class="w-full aspect-square bg-[#060608] border ${isSelected ? 'border-white/60' : 'border-[#27272a]'} p-2 flex items-center justify-center relative overflow-hidden mb-2">
                <img src="${c.image}" alt="${c.name}" class="w-full h-full object-contain filter drop-shadow-[0_0_8px_${c.themeHex}44] group-hover:scale-105 transition-transform" />
                
                <!-- Theme Dot & Tag -->
                <div class="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/80 px-1.5 py-0.5 border border-[#27272a]">
                  <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${c.themeHex}"></span>
                  <span class="font-mono-tech text-[8px] text-white">${c.themeName}</span>
                </div>

                ${isSelected ? `
                  <div class="absolute bottom-1.5 right-1.5 bg-[#00ffc2] text-black px-1.5 py-0.5 font-mono-tech text-[8px] font-black uppercase">
                    ACTIVE
                  </div>
                ` : ''}
              </div>

              <!-- Info -->
              <div class="mb-2">
                <div class="font-display font-bold text-xs text-white truncate" title="${c.name}">${c.name}</div>
                <div class="font-mono-tech text-[9px] text-[#83958c] mt-0.5">+1.0% Resonance</div>
              </div>

              <!-- Button -->
              <button class="w-full font-mono-tech text-[9px] py-1 uppercase font-bold border transition-all ${isSelected ? 'bg-[#00ffc2] text-black border-[#00ffc2] shadow-[0_0_8px_rgba(0,255,194,0.4)]' : 'border-[#27272a] text-on-surface-variant group-hover:text-white group-hover:border-white'}">
                ${isSelected ? 'EQUIPPED' : 'EQUIP'}
              </button>
            </div>
          `;
        }).join('');

        designsGridEl.querySelectorAll('.character-select-card').forEach(card => {
          card.addEventListener('click', () => {
            const charId = card.dataset.charId;
            selectCharacter(charId);
          });
        });
      } else {
        // Higher Role Unlocked: Show exclusive designs for that specific role only
        const roleChars = state.characters[roleId] || [];
        if (armoryTierBadge) {
          armoryTierBadge.innerText = `${roleInfo.name.toUpperCase()} UNLOCKED (${roleChars.length} DESIGNS)`;
          armoryTierBadge.className = `font-mono-tech text-[10px] ${roleInfo.textClass} font-bold uppercase`;
        }
        if (selectorIntroEl) {
          selectorIntroEl.innerHTML = `Showing <strong class="${roleInfo.textClass}">exclusive ${roleInfo.name} characters</strong>. Click any design to equip it onto your live Sovereign Manifest Card:`;
        }

        designsGridEl.className = "grid grid-cols-2 sm:grid-cols-4 gap-3";
        designsGridEl.innerHTML = roleChars.map((c) => {
          const isSelected = c.id === activeChar.id;
          return `
            <div class="character-select-card group relative p-2.5 border ${isSelected ? `${roleInfo.borderClass} ${roleInfo.bgClass} shadow-[0_0_15px_${roleInfo.color}33]` : 'border-[#27272a] bg-[#0c0c10] hover:border-white/50'} transition-all cursor-pointer flex flex-col justify-between" data-char-id="${c.id}">
              <!-- Thumbnail Viewport -->
              <div class="w-full aspect-square bg-[#060608] border ${isSelected ? 'border-white/60' : 'border-[#27272a]'} p-2 flex items-center justify-center relative overflow-hidden mb-2">
                <img src="${c.image}" alt="${c.name}" class="w-full h-full object-contain filter drop-shadow-[0_0_8px_${c.themeHex}44] group-hover:scale-105 transition-transform" />
                
                <!-- Theme Dot & Tag -->
                <div class="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/80 px-1.5 py-0.5 border border-[#27272a]">
                  <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${c.themeHex}"></span>
                  <span class="font-mono-tech text-[8px] text-white">${c.themeName}</span>
                </div>

                ${isSelected ? `
                  <div class="absolute bottom-1.5 right-1.5 bg-white text-black px-1.5 py-0.5 font-mono-tech text-[8px] font-black uppercase">
                    ACTIVE
                  </div>
                ` : ''}
              </div>

              <!-- Info -->
              <div class="mb-2">
                <div class="font-display font-bold text-xs text-white truncate" title="${c.name}">${c.name}</div>
                <div class="font-mono-tech text-[9px] ${roleInfo.textClass} mt-0.5">+${c.resonanceBonus}% Resonance</div>
              </div>

              <!-- Button -->
              <button class="w-full font-mono-tech text-[9px] py-1 uppercase font-bold border transition-all ${isSelected ? 'bg-white text-black border-white shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'border-[#27272a] text-on-surface-variant group-hover:text-white group-hover:border-white'}">
                ${isSelected ? 'EQUIPPED' : 'EQUIP'}
              </button>
            </div>
          `;
        }).join('');

        designsGridEl.querySelectorAll('.character-select-card').forEach(card => {
          card.addEventListener('click', () => {
            const charId = card.dataset.charId;
            selectCharacter(charId);
          });
        });
      }
    }

    // 4. Live Manifest Card (Right Column)
    const cardBorderEl = document.getElementById('manifest-card-wrapper');
    if (cardBorderEl) {
      cardBorderEl.className = `relative w-full max-w-[420px] mx-auto border-2 ${isConnected ? roleInfo.borderClass : 'border-[#3f3f46]'} bg-[#060608] p-5 md:p-6 ${isConnected ? roleInfo.glowClass : ''} transition-all duration-300`;
    }

    const cardRoleBadge = document.getElementById('card-role-badge');
    if (cardRoleBadge) {
      cardRoleBadge.innerText = isConnected ? roleInfo.badgeTitle.toUpperCase() : "UNLINKED CADET";
      cardRoleBadge.className = `font-mono-tech text-[10px] ${isConnected ? `${roleInfo.borderClass} ${roleInfo.textClass} ${roleInfo.bgClass}` : 'border-[#3f3f46] text-on-surface-variant bg-[#27272a]/20'} border px-2 py-0.5 font-bold uppercase`;
    }

    // Mascot Viewport: Collage (Unconnected) vs Single (Connected)
    const collageEl = document.getElementById('card-mascot-collage');
    const singleEl = document.getElementById('card-mascot-single');
    const cardMascotImg = document.getElementById('card-mascot-image');
    const cardHudTag = document.getElementById('card-character-hud-tag');

    if (isConnected) {
      if (collageEl) {
        collageEl.classList.add('hidden');
        collageEl.classList.remove('grid');
      }
      if (singleEl) {
        singleEl.classList.remove('hidden');
        singleEl.classList.add('flex');
      }
      if (cardMascotImg) {
        cardMascotImg.src = activeChar.image;
      }
      if (cardHudTag) {
        cardHudTag.innerText = activeChar.themeName ? activeChar.themeName.toUpperCase() : roleInfo.name.toUpperCase();
      }
    } else {
      if (collageEl) {
        collageEl.classList.remove('hidden');
        collageEl.classList.add('grid');
      }
      if (singleEl) {
        singleEl.classList.add('hidden');
        singleEl.classList.remove('flex');
      }
      if (cardHudTag) {
        cardHudTag.innerText = "RARITY MATRIX (4 TIERS)";
      }
    }

    const mascotAuraEl = document.getElementById('card-mascot-aura');
    if (mascotAuraEl) {
      if (isConnected && roleId !== 'none') {
        mascotAuraEl.style.background = `radial-gradient(circle, ${activeChar.themeHex || roleInfo.color}35 0%, transparent 70%)`;
        mascotAuraEl.style.opacity = "0.45";
      } else {
        mascotAuraEl.style.background = "none";
        mascotAuraEl.style.opacity = "0";
      }
    }

    const cardDiscordHandle = document.getElementById('card-discord-handle');
    if (cardDiscordHandle) {
      cardDiscordHandle.innerText = isConnected ? state.user.discordUsername : "Not Connected";
    }

    const cardXHandle = document.getElementById('card-x-handle');
    if (cardXHandle) {
      const handle = state.user.xUsername && state.user.xUsername.trim();
      cardXHandle.innerText = handle ? `@${handle}` : "Not Entered";
    }

    const cardResonanceScore = document.getElementById('card-resonance-score');
    if (cardResonanceScore) {
      cardResonanceScore.innerText = `${resonance}%`;
      cardResonanceScore.className = `font-display font-black text-xl ${isConnected ? roleInfo.textClass : 'text-on-surface-variant'}`;
    }

    const cardJoinedDate = document.getElementById('card-joined-date');
    if (cardJoinedDate) {
      cardJoinedDate.innerText = isConnected ? (state.user.joinedServerDate || "Dlicom Member") : "Unlinked";
      cardJoinedDate.className = `font-display font-bold text-xs ${isConnected ? roleInfo.textClass : 'text-on-surface-variant'}`;
    }

    const cardRoleName = document.getElementById('card-role-name');
    if (cardRoleName) {
      cardRoleName.innerText = isConnected ? roleInfo.name.toUpperCase() : "NO ROLE";
      cardRoleName.className = `font-display font-bold text-sm ${isConnected ? roleInfo.textClass : 'text-on-surface-variant'}`;
    }

    const cardImpressionsEl = document.getElementById('card-x-impressions');
    if (cardImpressionsEl) {
      cardImpressionsEl.innerText = state.user.xDlicomImpressions && state.user.xDlicomImpressions !== '0'
        ? state.user.xDlicomImpressions
        : '--';
    }

    const cardPostsEl = document.getElementById('card-x-posts');
    if (cardPostsEl) {
      cardPostsEl.innerText = state.user.xDlicomPosts > 0
        ? `${state.user.xDlicomPosts} (${state.user.xEngagementRate || '0%'})`
        : '--';
    }

    const cardCharacterName = document.getElementById('card-character-name');
    if (cardCharacterName) {
      cardCharacterName.innerText = isConnected ? `${activeChar.name} (${roleInfo.name})` : "Connect Discord to Manifest";
    }

    const cardQuote = document.getElementById('card-manifest-quote');
    if (cardQuote) {
      cardQuote.innerText = `"${state.user.customQuote}"`;
    }
  }

  // Select Character
  function selectCharacter(charId) {
    state.user.selectedCharacterId = charId;
    saveSession();
    CyberAudio.equip();
    const activeChar = getActiveCharacter();
    showToast(`Equipped character: ${activeChar.name}`, "mint");
    renderApp();
  }

  // Apply Role Automatically After Dlicom Discord Sync
  function applyRole(roleId) {
    state.user.currentRole = roleId || 'none';
    const roleInfo = state.roles[state.user.currentRole] || state.roles.none;
    state.user.selectedCharacterId = roleInfo.defaultCharacter;

    saveSession();
    CyberAudio.ascend();
    renderApp();
  }

  // Handle Real Discord OAuth Login Success
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'DISCORD_AUTH_SUCCESS') {
      const data = event.data;
      state.user.discordConnected = true;
      state.user.discordUsername = data.username;
      state.user.discordId = data.id;
      state.user.serverRoles = (data.roles || []).map(r => r === '1475392943178383502' ? 'Giveaways' : r).filter(r => !/^\d{10,}$/.test(String(r).trim()) && r !== '@everyone');
      if (data.joinDate) state.user.joinedServerDate = data.joinDate;
      if (data.avatar) state.user.discordAvatar = data.avatar;

      applyRole(data.detectedRole || 'none');
      CyberAudio.success();
      showToast(`Connected ${data.username}! Joined: ${data.joinDate || 'Active'}`, 'mint');
    }
  });

  // =========================================================================
  // BIND ACTIONS
  // =========================================================================

  // 1. OAuth2 Discord Login (1-Click)
  const oauthDiscordBtn = document.getElementById('btn-oauth-discord');
  if (oauthDiscordBtn) {
    oauthDiscordBtn.addEventListener('click', () => {
      CyberAudio.click();
      const popupWidth = 500;
      const popupHeight = 750;
      const left = window.screenX + (window.outerWidth - popupWidth) / 2;
      const top = window.screenY + (window.outerHeight - popupHeight) / 2;
      window.open(
        '/api/auth/discord/login',
        'DiscordAuth',
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},status=no,resizable=yes`
      );
    });
  }

  // Disconnect Button
  const disconnectBtn = document.getElementById('btn-discord-disconnect');
  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', () => {
      clearSession();
    });
  }

  // 2. Direct X Handle Input & Live Analytics via xerper.com
  let xAnalyticsTimer = null;

  async function fetchXAnalytics(rawUsername) {
    const cleanUser = (rawUsername || '').trim().replace(/^@/, '');
    const statusEl = document.getElementById('x-analytics-status');
    const summaryEl = document.getElementById('x-analytics-summary');
    const cardImpressionsEl = document.getElementById('card-x-impressions');
    const cardPostsEl = document.getElementById('card-x-posts');

    if (!cleanUser) {
      if (statusEl) statusEl.classList.add('hidden');
      if (cardImpressionsEl) cardImpressionsEl.innerText = '--';
      if (cardPostsEl) cardPostsEl.innerText = '--';
      state.user.xDlicomImpressions = "0";
      state.user.xDlicomPosts = 0;
      state.user.xEngagementRate = "0%";
      return;
    }

    if (statusEl) {
      statusEl.classList.remove('hidden');
      if (summaryEl) summaryEl.innerHTML = `<span class="animate-pulse text-[#83958c]">Fetching @${cleanUser} stats from xerper.com...</span>`;
    }

    try {
      const res = await fetch(`/api/x/analytics?username=${encodeURIComponent(cleanUser)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.analytics) {
          const a = data.analytics;
          state.user.xDlicomImpressions = a.formattedImpressions || '0';
          state.user.xDlicomPosts = a.posts || 0;
          state.user.xEngagementRate = a.engagementRate || '0%';
          saveSession();

          if (statusEl) {
            statusEl.classList.remove('hidden');
            if (summaryEl) {
              summaryEl.innerHTML = `<span class="text-emerald-400 font-bold">✓ ${a.formattedImpressions} Dlicom Impressions</span> <span class="text-white/60">· ${a.posts} Dlicom Posts · ${a.engagementRate} Eng</span>`;
            }
          }

          if (cardImpressionsEl) cardImpressionsEl.innerText = a.formattedImpressions || '0';
          if (cardPostsEl) cardPostsEl.innerText = `${a.posts} (${a.engagementRate})`;

          const cardResonance = document.getElementById('card-resonance-score');
          if (cardResonance) {
            cardResonance.innerText = `${calculateResonance()}%`;
          }
          
          showToast(`✓ Dlicom X Analytics loaded: ${a.formattedImpressions} Impressions (${a.posts} Posts)!`, 'mint');
        }
      } else {
        if (summaryEl) summaryEl.innerHTML = `<span class="text-on-surface-variant text-[10px]">No Xerper data found for @${cleanUser}</span>`;
        if (cardImpressionsEl) cardImpressionsEl.innerText = '0';
        if (cardPostsEl) cardPostsEl.innerText = '0 (0%)';
      }
    } catch (err) {
      console.warn('Xerper fetch error:', err);
    }
  }

  const directXInput = document.getElementById('x-direct-input');
  if (directXInput) {
    directXInput.value = state.user.xUsername || '';
    directXInput.addEventListener('input', (e) => {
      const val = e.target.value.trim().replace(/^@/, '');
      state.user.xUsername = val;
      state.user.xConnected = Boolean(val);
      saveSession();
      
      const cardXHandle = document.getElementById('card-x-handle');
      if (cardXHandle) {
        cardXHandle.innerText = val ? `@${val}` : "Not Entered";
      }
      const topXStatus = document.getElementById('top-x-status');
      if (topXStatus) {
        topXStatus.innerHTML = val 
          ? `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> @${val}`
          : `<span class="text-on-surface-variant">X Unlinked</span>`;
      }
      const cardResonance = document.getElementById('card-resonance-score');
      if (cardResonance) {
        cardResonance.innerText = `${calculateResonance()}%`;
      }

      clearTimeout(xAnalyticsTimer);
      if (val.length >= 2) {
        xAnalyticsTimer = setTimeout(() => {
          fetchXAnalytics(val);
        }, 600);
      }
    });

    directXInput.addEventListener('change', (e) => {
      const val = e.target.value.trim().replace(/^@/, '');
      if (val) {
        clearTimeout(xAnalyticsTimer);
        fetchXAnalytics(val);
      }
    });
  }

  // 3. Custom Quote Input & Randomizer
  const randomizeQuoteBtn = document.getElementById('btn-randomize-quote');
  if (randomizeQuoteBtn) {
    randomizeQuoteBtn.addEventListener('click', () => {
      const randomIndex = Math.floor(Math.random() * state.quotes.length);
      state.user.customQuote = state.quotes[randomIndex];
      const inputQuote = document.getElementById('input-custom-quote');
      if (inputQuote) inputQuote.value = state.user.customQuote;
      saveSession();
      CyberAudio.click();
      renderApp();
    });
  }

  const inputQuote = document.getElementById('input-custom-quote');
  if (inputQuote) {
    inputQuote.value = state.user.customQuote;
    inputQuote.addEventListener('input', (e) => {
      state.user.customQuote = e.target.value;
      saveSession();
      const cardQuote = document.getElementById('card-manifest-quote');
      if (cardQuote) cardQuote.innerText = `"${state.user.customQuote}"`;
    });
  }

  // 4. Copy Card Image (Clipboard)
  function handleCopyCardImage() {
    if (!state.user.discordConnected) {
      showToast("Please connect your Discord account first!", "pink");
      const discordBtn = document.getElementById('btn-oauth-discord');
      if (discordBtn) discordBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!state.user.xUsername || !state.user.xUsername.trim()) {
      showToast("Please enter your X (Twitter) username first!", "pink");
      if (directXInput) {
        directXInput.focus();
        directXInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        directXInput.classList.add('border-[#ec49c0]');
        setTimeout(() => directXInput.classList.remove('border-[#ec49c0]'), 2500);
      }
      return;
    }

    const roleInfo = state.roles[state.user.currentRole] || state.roles.none;
    const activeChar = getActiveCharacter();
    const resonance = calculateResonance();
    const cleanXHandle = state.user.xUsername.trim().replace(/^@/, '');

    CyberAudio.click();
    showToast("Copying card image to clipboard...", "mint");

    ShareKit.copyCardImage({
      roleInfo: roleInfo,
      twinId: state.user.twinId || `${roleInfo.name.toUpperCase()}-01`,
      discordUsername: state.user.discordUsername || "Unlinked",
      joinedServerDate: state.user.joinedServerDate,
      xUsername: cleanXHandle,
      xImpressions: state.user.xDlicomImpressions,
      xPosts: state.user.xDlicomPosts,
      xEngagement: state.user.xEngagementRate,
      resonanceScore: resonance,
      customQuote: state.user.customQuote,
      characterImgSrc: activeChar.image,
      characterName: activeChar.name,
      characterTheme: activeChar.themeName,
      themeHex: roleInfo.color || activeChar.themeHex,
      hash: state.user.hash
    }, (success, errMsg) => {
      if (success) {
        showToast("✓ Card image copied! Paste (Ctrl+V) anywhere!", "mint");
      } else {
        showToast(errMsg || "Could not copy image directly. You can use Download PNG instead!", "pink");
      }
    });
  }

  const copyCardImageBtn = document.getElementById('btn-copy-card-image');
  if (copyCardImageBtn) {
    copyCardImageBtn.addEventListener('click', handleCopyCardImage);
  }

  const topCopyCardBtn = document.getElementById('btn-card-top-copy');
  if (topCopyCardBtn) {
    topCopyCardBtn.addEventListener('click', handleCopyCardImage);
  }

  // 5. Download PNG Card (Compulsory Checks for Discord & X Username)
  const downloadCardBtn = document.getElementById('btn-download-card');
  if (downloadCardBtn) {
    downloadCardBtn.addEventListener('click', () => {
      if (!state.user.discordConnected) {
        showToast("Please connect your Discord account first!", "pink");
        const discordBtn = document.getElementById('btn-oauth-discord');
        if (discordBtn) discordBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      if (!state.user.xUsername || !state.user.xUsername.trim()) {
        showToast("Please enter your X (Twitter) username first!", "pink");
        if (directXInput) {
          directXInput.focus();
          directXInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          directXInput.classList.add('border-[#ec49c0]');
          setTimeout(() => directXInput.classList.remove('border-[#ec49c0]'), 2500);
        }
        return;
      }

      const roleInfo = state.roles[state.user.currentRole] || state.roles.none;
      const activeChar = getActiveCharacter();
      const resonance = calculateResonance();
      const cleanXHandle = state.user.xUsername.trim().replace(/^@/, '');

      CyberAudio.click();
      showToast("Generating high-resolution 1200x1600 card...", "mint");

      ShareKit.downloadCard({
        roleInfo: roleInfo,
        twinId: state.user.twinId || `${roleInfo.name.toUpperCase()}-01`,
        discordUsername: state.user.discordUsername || "Unlinked",
        joinedServerDate: state.user.joinedServerDate,
        xUsername: cleanXHandle,
        xImpressions: state.user.xDlicomImpressions,
        xPosts: state.user.xDlicomPosts,
        xEngagement: state.user.xEngagementRate,
        resonanceScore: resonance,
        customQuote: state.user.customQuote,
        characterImgSrc: activeChar.image,
        characterName: activeChar.name,
        characterTheme: activeChar.themeName,
        themeHex: roleInfo.color || activeChar.themeHex,
        hash: state.user.hash
      });
    });
  }

  // 6. Share on X Button (Compulsory Checks for Discord & X Username, @DlicomApp tag)
  const shareXBtn = document.getElementById('btn-share-on-x');
  if (shareXBtn) {
    shareXBtn.addEventListener('click', () => {
      if (!state.user.discordConnected) {
        showToast("Please connect your Discord account first!", "pink");
        const discordBtn = document.getElementById('btn-oauth-discord');
        if (discordBtn) discordBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      if (!state.user.xUsername || !state.user.xUsername.trim()) {
        showToast("Please enter your X (Twitter) username first!", "pink");
        if (directXInput) {
          directXInput.focus();
          directXInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          directXInput.classList.add('border-[#ec49c0]');
          setTimeout(() => directXInput.classList.remove('border-[#ec49c0]'), 2500);
        }
        return;
      }

      const roleInfo = state.roles[state.user.currentRole] || state.roles.none;
      const activeChar = getActiveCharacter();
      const resonance = calculateResonance();
      const cleanXHandle = state.user.xUsername.trim().replace(/^@/, '');

      showToast("Opening Twitter / X tweet window...", "mint");

      ShareKit.shareToX({
        roleInfo: roleInfo,
        twinId: state.user.twinId || `${roleInfo.name.toUpperCase()}-${cleanXHandle || '01'}`,
        discordUsername: state.user.discordUsername || "Unlinked",
        joinedServerDate: state.user.joinedServerDate,
        xUsername: cleanXHandle,
        xImpressions: state.user.xDlicomImpressions,
        xPosts: state.user.xDlicomPosts,
        xEngagement: state.user.xEngagementRate,
        resonanceScore: resonance,
        customQuote: state.user.customQuote,
        characterImgSrc: activeChar.image,
        characterName: activeChar.name,
        characterTheme: activeChar.themeName,
        themeHex: roleInfo.color || activeChar.themeHex,
        hash: state.user.hash
      });
    });
  }

  // 7. Copy Card Link
  const copyLinkBtn = document.getElementById('btn-copy-card-link');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
      ShareKit.copyShareLink();
      showToast("Manifest link copied to clipboard!", "mint");
    });
  }

  // 8. Audio & Shader Toggles
  const toggleAudioBtn = document.getElementById('btn-toggle-audio');
  if (toggleAudioBtn) {
    toggleAudioBtn.addEventListener('click', () => {
      const isMuted = CyberAudio.toggleMute();
      toggleAudioBtn.innerHTML = `<span class="material-symbols-outlined text-lg">${isMuted ? 'volume_off' : 'volume_up'}</span>`;
      showToast(isMuted ? "Sound Muted" : "Sound Enabled", isMuted ? "pink" : "mint");
    });
  }

  const toggleShaderBtn = document.getElementById('btn-toggle-shader');
  if (toggleShaderBtn) {
    toggleShaderBtn.addEventListener('click', () => {
      const isEnabled = CyberShader.toggle();
      toggleShaderBtn.innerHTML = `<span class="material-symbols-outlined text-lg">${isEnabled ? 'blur_on' : 'blur_off'}</span>`;
      showToast(isEnabled ? "Shader Active" : "Shader Paused", isEnabled ? "mint" : "pink");
    });
  }

  // Auto-fetch join date if missing in restored session
  async function refreshMemberJoinDate() {
    if (!state.user.discordConnected || state.user.joinedServerDate) return;
    const query = state.user.discordId || state.user.discordUsername;
    if (!query) return;
    try {
      const res = await fetch(`/api/member?username=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.member && data.member.joinDate) {
          state.user.joinedServerDate = data.member.joinDate;
          saveSession();
          renderApp();
        }
      }
    } catch (e) {}
  }

  // Initial Load with LocalStorage Persistence
  const restored = loadSession();
  if (restored && state.user.discordConnected) {
    console.log('Restored previous Discord session for', state.user.discordUsername);
    refreshMemberJoinDate();
  }

  if (state.user.xUsername) {
    fetchXAnalytics(state.user.xUsername);
  }

  loadDlicomGuildData();
  renderApp();
});
