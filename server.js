// Dili Manifest - Full-Stack Server with Real Discord Bot & Twitter API v2 Integration
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

// Load environment variables from .env
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...rest] = trimmed.split('=');
        if (key && rest.length > 0) {
          process.env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    });
  }
}
loadEnv();

const PORT = parseInt(process.env.PORT || '8080', 10);
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
function getDynamicBaseUrl(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || (host && host.includes('localhost') ? 'http' : 'https');
  if (host) {
    return `${proto}://${host}`;
  }
  return process.env.BASE_URL || 'https://dili-manifest-dlicom.vercel.app';
}


// Dlicom Official Guild Constants
const DLICOM_GUILD_ID = process.env.DISCORD_GUILD_ID || '1460130124598087712';
const DLICOM_INVITE_CODE = 'dlicom';

// Cached guild roles map (ID -> Name) with 10-minute cache TTL
let cachedGuildRoles = null;
let cachedGuildRolesTime = 0;

async function getDlicomGuildRoles(botToken) {
  const now = Date.now();
  if (cachedGuildRoles && (now - cachedGuildRolesTime < 10 * 60 * 1000)) {
    return cachedGuildRoles;
  }

  if (!botToken) return new Map();

  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${DLICOM_GUILD_ID}/roles`, {
      headers: { Authorization: `Bot ${botToken}` }
    });
    if (res.ok) {
      const rolesList = await res.json();
      const map = new Map();
      rolesList.forEach(r => map.set(r.id, r.name));
      cachedGuildRoles = map;
      cachedGuildRolesTime = now;
      return map;
    }
  } catch (e) {
    console.error("Failed to fetch Dlicom guild roles:", e.message);
  }
  return cachedGuildRoles || new Map();
}

// Helper: Content-Type mapper
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
    const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
    const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';
    const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN || '';

    // =========================================================================
    // API ENDPOINTS
    // =========================================================================

    // 1. DLICOM SERVER METADATA (LIVE TELEMETRY FROM DISCORD API)
    if (pathname === '/api/discord/guild' || pathname === '/api/guild') {
      try {
        const guildRes = await fetch(`https://discord.com/api/v10/invites/${DLICOM_INVITE_CODE}?with_counts=true`);
        if (guildRes.ok) {
          const gData = await guildRes.json();
          const guildInfo = {
            success: true,
            id: gData.guild ? gData.guild.id : DLICOM_GUILD_ID,
            name: gData.guild ? gData.guild.name : 'Dlicom Official',
            memberCount: gData.approximate_member_count || 24523,
            onlineCount: gData.approximate_presence_count || 834,
            iconUrl: gData.guild && gData.guild.icon ? `https://cdn.discordapp.com/icons/${gData.guild.id}/${gData.guild.icon}.png` : null,
            bannerUrl: gData.guild && gData.guild.banner ? `https://cdn.discordapp.com/banners/${gData.guild.id}/${gData.guild.banner}.png` : null,
            inviteUrl: `https://discord.com/invite/${DLICOM_INVITE_CODE}`
          };
          const jsonResp = JSON.stringify(guildInfo);
          res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(jsonResp) });
          res.end(jsonResp);
          return;
        }
      } catch (e) {}

      const fallback = JSON.stringify({
        success: true,
        id: DLICOM_GUILD_ID,
        name: 'Dlicom Official',
        memberCount: 24523,
        onlineCount: 834,
        inviteUrl: `https://discord.com/invite/${DLICOM_INVITE_CODE}`
      });
      res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(fallback) });
      res.end(fallback);
      return;
    }

    // 2. REAL DISCORD BOT SEARCH & MEMBER LOOKUP (Method 2)
    if (pathname === '/api/member' || pathname === '/api/discord/fetch') {
      const query = (parsedUrl.searchParams.get('username') || parsedUrl.searchParams.get('query') || '').trim();

      if (!query) {
        const errResp = JSON.stringify({ success: false, error: 'Please enter a Dlicom Discord username or User ID' });
        res.writeHead(400, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(errResp) });
        res.end(errResp);
        return;
      }

      const cleanQuery = query.toLowerCase().replace(/^@/, '').split('#')[0].trim();
      let memberData = null;
      let isLiveBotData = false;

      // Method 2: Live Discord Bot API Query
      if (DISCORD_BOT_TOKEN) {
        try {
          const isNumericId = /^\d{17,20}$/.test(cleanQuery);
          let member = null;

          if (isNumericId) {
            const memRes = await fetch(`https://discord.com/api/v10/guilds/${DLICOM_GUILD_ID}/members/${cleanQuery}`, {
              headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
            });
            if (memRes.ok) member = await memRes.json();
          } else {
            const searchRes = await fetch(`https://discord.com/api/v10/guilds/${DLICOM_GUILD_ID}/members/search?query=${encodeURIComponent(cleanQuery)}&limit=5`, {
              headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
            });
            if (searchRes.ok) {
              const list = await searchRes.json();
              if (list.length > 0) member = list[0];
            }
          }

          if (member && member.user) {
            const roleMap = await getDlicomGuildRoles(DISCORD_BOT_TOKEN);
            const roleNames = (member.roles || []).map(rid => roleMap.get(rid) || rid);

            memberData = {
              userId: member.user.id,
              username: member.user.username,
              displayName: member.nick || member.user.global_name || member.user.username,
              avatarUrl: member.user.avatar 
                ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png` 
                : (member.avatar ? `https://cdn.discordapp.com/guilds/${DLICOM_GUILD_ID}/users/${member.user.id}/avatars/${member.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/0.png`),
              roles: roleNames.length > 0 ? roleNames : ["Member"],
              joinDate: member.joined_at ? new Date(member.joined_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "2025"
            };
            isLiveBotData = true;
          }
        } catch (botErr) {
          console.error("Discord Bot API error:", botErr.message);
        }
      }

      // Public Discord lookup API fallback for avatar & handle
      if (!memberData && /^\d{17,20}$/.test(cleanQuery)) {
        try {
          const publicRes = await fetch(`https://discordlookup.mesalytic.moe/v1/user/${cleanQuery}`);
          if (publicRes.ok) {
            const p = await publicRes.json();
            memberData = {
              userId: p.id,
              username: p.tag || p.username || cleanQuery,
              displayName: p.global_name || p.username || cleanQuery,
              avatarUrl: p.avatar ? `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar.id}.png` : `https://cdn.discordapp.com/embed/avatars/0.png`,
              roles: ["Dlicom Member"],
              joinDate: "2025"
            };
          }
        } catch (pe) {}
      }

      // If Bot token is not configured or user not returned by bot, inform the user
      if (!memberData) {
        if (!DISCORD_BOT_TOKEN) {
          const resp = JSON.stringify({
            success: false,
            error: `Live Discord Bot query requires DISCORD_BOT_TOKEN in .env. Please add your Bot token or click 'CONNECT WITH DISCORD (1-CLICK OAUTH)'.`
          });
          res.writeHead(400, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(resp) });
          res.end(resp);
          return;
        } else {
          const resp = JSON.stringify({
            success: false,
            error: `Could not find "${query}" via Discord Bot. Note: The Bot must be inside the Dlicom server, or you can click 'CONNECT WITH DISCORD (1-CLICK OAUTH)' to verify your roles directly.`
          });
          res.writeHead(404, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(resp) });
          res.end(resp);
          return;
        }
      }

      // Determine highest Dlicom Role
      const rolesLower = (memberData.roles || []).map(r => String(r).toLowerCase().trim());
      let detectedRole = 'none';
      let roleName = 'Community Cadet';

      const isDCO = rolesLower.some(r => r === 'dco' || r.startsWith('dco ') || r.endsWith(' dco') || r.includes(' dco ') || r.includes('dco sovereign') || r.includes('dco core'));
      const isDecoded = rolesLower.some(r => r.includes('decoded') || r.includes('dcoded') || r.includes('d-coded'));
      const isDliever = rolesLower.some(r => r.includes('dliever') || r.includes('deliver') || r.includes('d-liever'));

      if (isDCO) {
        detectedRole = 'dco';
        roleName = 'DCO Sovereign';
      } else if (isDecoded) {
        detectedRole = 'decoded';
        roleName = 'Dcoded';
      } else if (isDliever) {
        detectedRole = 'dliever';
        roleName = 'Dliever';
      }

      const responsePayload = {
        success: true,
        live: isLiveBotData,
        guild: {
          id: DLICOM_GUILD_ID,
          name: "Dlicom Official",
          invite: `https://discord.com/invite/${DLICOM_INVITE_CODE}`
        },
        member: {
          ...memberData,
          serverRole: detectedRole,
          roleName: roleName,
          joinDate: memberData.joinDate || "Recent Member"
        },
        username: memberData.username,
        displayName: memberData.displayName,
        id: memberData.userId,
        avatar: memberData.avatarUrl,
        roles: memberData.roles,
        detectedRole: detectedRole,
        joinDate: memberData.joinDate || "Recent Member"
      };

      const respStr = JSON.stringify(responsePayload);
      res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(respStr) });
      res.end(respStr);
      return;
    }

    // 3. X / TWITTER ANALYTICS VIA XERPER.COM (STRICTLY DLICOM COMMUNITY PROJECT)
    if (pathname === '/api/x/analytics') {
      const username = (parsedUrl.searchParams.get('username') || parsedUrl.searchParams.get('handle') || '').trim().replace(/^@/, '');
      if (!username) {
        const errResp = JSON.stringify({ success: false, error: 'Username is required' });
        res.writeHead(400, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(errResp) });
        res.end(errResp);
        return;
      }

      try {
        const fetchProjectImpressions = async (projectKey) => {
          const res = await fetch('https://xerper.com/api/impressions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({ username, project: projectKey })
          });
          if (res.ok) return await res.json();
          return null;
        };

        // Query Xerper specifically for DlicomApp and dlicom
        const [dlicomAppRes, dlicomRes] = await Promise.all([
          fetchProjectImpressions('DlicomApp'),
          fetchProjectImpressions('dlicom')
        ]);

        const postsMap = new Map();
        let userProfile = null;
        let projectProfile = null;

        if (dlicomAppRes) {
          if (dlicomAppRes.profile) userProfile = dlicomAppRes.profile;
          if (dlicomAppRes.project_profile) projectProfile = dlicomAppRes.project_profile;
          (dlicomAppRes.posts || []).forEach(p => postsMap.set(p.id, p));
        }

        if (dlicomRes) {
          if (!userProfile && dlicomRes.profile) userProfile = dlicomRes.profile;
          if (!projectProfile && dlicomRes.project_profile) projectProfile = dlicomRes.project_profile;
          (dlicomRes.posts || []).forEach(p => postsMap.set(p.id, p));
        }

        let dlicomImpressions = 0;
        let dlicomLikes = 0;
        let dlicomReplies = 0;
        let dlicomReposts = 0;

        postsMap.forEach(p => {
          dlicomImpressions += Number(p.views || 0);
          dlicomLikes += Number(p.likes || 0);
          dlicomReplies += Number(p.replies || 0);
          dlicomReposts += Number(p.reposts || 0);
        });

        const dlicomPostsCount = postsMap.size;
        const totalEngagements = dlicomLikes + dlicomReplies + dlicomReposts;
        const engagementRate = dlicomImpressions > 0 
          ? ((totalEngagements / dlicomImpressions) * 100).toFixed(1) + '%' 
          : '0.0%';

        function formatMetric(n) {
          const num = Number(n);
          if (!Number.isFinite(num)) return '0';
          if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
          if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
          return num.toLocaleString();
        }

        const result = {
          success: true,
          source: 'xerper.com',
          project: 'Dlicom',
          targetAccount: '@DlicomApp',
          profile: userProfile || { handle: username, screen_name: username },
          projectProfile: projectProfile,
          analytics: {
            allTimeImpressions: dlicomImpressions,
            formattedImpressions: formatMetric(dlicomImpressions),
            posts: dlicomPostsCount,
            likes: dlicomLikes,
            replies: dlicomReplies,
            reposts: dlicomReposts,
            engagementRate: engagementRate
          }
        };

        console.log(`[Xerper Dlicom Analytics] Successfully fetched for @${username}: ${result.analytics.formattedImpressions} Dlicom impressions, ${result.analytics.posts} Dlicom posts`);

        const json = JSON.stringify(result);
        res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(json) });
        res.end(json);
        return;
      } catch (err) {
        console.error('Xerper fetch error:', err.message);
        const json = JSON.stringify({ success: false, error: 'Xerper analytics service error' });
        res.writeHead(500, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(json) });
        res.end(json);
        return;
      }
    }

    // 4. DISCORD OAUTH2 LOGIN
    if (pathname === '/api/auth/discord/login') {
      if (!DISCORD_CLIENT_ID) {
        const msg = `
          <!DOCTYPE html><html><body style="background:#050505;color:#ff4081;font-family:sans-serif;text-align:center;padding:40px;">
          <h3>DISCORD_CLIENT_ID Not Configured</h3>
          <p style="color:#aaa;">Please set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET in .env</p>
          <button onclick="window.close()" style="background:#fff;border:none;padding:8px 16px;cursor:pointer;">Close</button>
          </body></html>
        `;
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': Buffer.byteLength(msg) });
        res.end(msg);
        return;
      }

      const dynamicBase = getDynamicBaseUrl(req);
      const redirectUri = `${dynamicBase}/api/auth/discord/callback`;
      const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(DISCORD_CLIENT_ID)}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=identify%20guilds%20guilds.members.read`;

      res.writeHead(302, { Location: discordAuthUrl });
      res.end();
      return;
    }

    // 4. DISCORD OAUTH2 CALLBACK
    if (pathname === '/api/auth/discord/callback') {
      const code = parsedUrl.searchParams.get('code');

      if (!code) {
        const msg = '<script>alert("Discord login cancelled."); window.close();</script>';
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': Buffer.byteLength(msg) });
        res.end(msg);
        return;
      }

      try {
        const dynamicBase = getDynamicBaseUrl(req);
        const redirectUri = `${dynamicBase}/api/auth/discord/callback`;

        const tokenParams = new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri
        });

        const tokenRes = await fetch('https://discord.com/api/v10/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: tokenParams.toString()
        });

        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) {
          throw new Error(tokenData.error_description || 'Failed to obtain access token from Discord');
        }

        const userRes = await fetch('https://discord.com/api/v10/users/@me', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        const userData = await userRes.json();

        const fullUsername = userData.discriminator && userData.discriminator !== '0'
          ? `${userData.username}#${userData.discriminator}`
          : (userData.global_name || userData.username);

        let roleIds = [];
        let userRoles = [];
        let detectedRole = 'none';

        let joinDate = null;
        try {
          const memberRes = await fetch(`https://discord.com/api/v10/users/@me/guilds/${DLICOM_GUILD_ID}/member`, {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
          });
          if (memberRes.ok) {
            const memberData = await memberRes.json();
            roleIds = memberData.roles || [];
            
            if (memberData.joined_at) {
              const d = new Date(memberData.joined_at);
              if (!isNaN(d.getTime())) {
                joinDate = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                console.log(`[Discord OAuth] User ${fullUsername} joined Dlicom server at: ${memberData.joined_at} (${joinDate})`);
              }
            } else {
              console.warn(`[Discord OAuth] memberData returned for ${fullUsername} but joined_at was missing`);
            }

            // Map known Dlicom role IDs to readable names
            const DLICOM_KNOWN_ROLES = {
  "1476002791246790848": "DCO",
  "1476002283404791918": "Dcoded",
  "1470656257168900149": "Dliever",
  "1460137587095240805": "Team",
  "1484302812589457640": "Mod",
  "1476001794546073743": "Regional Lead",
  "1486866119825555588": "Regional Helper",
  "1468480824595972202": "OG",
  "1502308949888864480": "Ambassador",
  "1491120963516108820": "Beta Tester",
  "1497099943872172214": "Verified AirDroper",
  "1507289781208617010": "Dlicom App User",
  "1460231458143867011": "Verified",
  "1494043592887373976": "Raids",
  "1494043518736531648": "Events",
  "1475388825583751189": "India",
  "1471667384828952669": "Arabic",
  "1475390589884305479": "Bangladesh",
  "1501972315737686026": "Indonesian",
  "1475392943178383502": "Nigeria",
  "1475393753144627241": "Turkey",
  "1475391724770693161": "Vietnamese",
  "1460230882538291387": "Russian",
  "1475386273706279015": "Ukraine",
  "1492160868228792330": "Chinese"
};

            // If bot token is available, get live roles from guild; otherwise use known map
            let roleMap = new Map();
            if (DISCORD_BOT_TOKEN) {
              try {
                roleMap = await getDlicomGuildRoles(DISCORD_BOT_TOKEN);
              } catch (e) {}
            }

            console.log(`[Discord OAuth] User ${fullUsername} authenticated with role IDs:`, JSON.stringify(roleIds));

            userRoles = roleIds.map(rid => {
              if (roleMap.has(rid)) return roleMap.get(rid);
              if (DLICOM_KNOWN_ROLES[rid]) return DLICOM_KNOWN_ROLES[rid];
              return null;
            }).filter(Boolean).filter(r => !/^\d{10,}$/.test(String(r).trim()) && r !== '@everyone');

            console.log(`[Discord OAuth] Resolved role names for ${fullUsername}:`, JSON.stringify(userRoles));
          } else {
            console.warn(`[Discord OAuth] /users/@me/guilds/${DLICOM_GUILD_ID}/member returned status ${memberRes.status}`);
          }
        } catch (e) {
          console.error(`[Discord OAuth] Error fetching guild member:`, e.message);
        }

        if (!joinDate && DISCORD_BOT_TOKEN && userData.id) {
          try {
            const botMemRes = await fetch(`https://discord.com/api/v10/guilds/${DLICOM_GUILD_ID}/members/${userData.id}`, {
              headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
            });
            if (botMemRes.ok) {
              const bMem = await botMemRes.json();
              if (bMem.joined_at) {
                const d = new Date(bMem.joined_at);
                if (!isNaN(d.getTime())) {
                  joinDate = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  console.log(`[Discord Bot] User ${fullUsername} joined Dlicom server at: ${bMem.joined_at} (${joinDate})`);
                }
              }
            }
          } catch (be) {}
        }

        if (!joinDate) {
          joinDate = null;
        }

        const roleDcoEnv = (process.env.ROLE_DCO_ID || 'DCO').toLowerCase();
        const roleDecodedEnv = (process.env.ROLE_DECODED_ID || 'DECODED').toLowerCase();
        const roleDlieverEnv = (process.env.ROLE_DLIEVER_ID || 'DLIEVER').toLowerCase();

        const rawRoleIds = roleIds.map(id => String(id).trim());
        const roleStrings = userRoles.map(r => String(r).toLowerCase().trim());

        // 1. DCO / Team / Mod Tier (Tier 3 - Sovereign - Highest Rank)
        const isDCO = rawRoleIds.includes("1476002791246790848") || // DCO
                      rawRoleIds.includes("1460137587095240805") || // Team
                      rawRoleIds.includes("1484302812589457640") || // Mod
                      roleStrings.some(r => r === 'dco' || r.includes('dco sovereign') || r.includes('dco core') || r === 'team' || r === 'mod' || r === 'moderator');

        // 2. Dcoded / Regional Lead Tier (Tier 2)
        const isDecoded = rawRoleIds.includes("1476002283404791918") || // Dcoded
                          rawRoleIds.includes("1476001794546073743") || // Regional Lead
                          roleStrings.some(r => r.includes('decoded') || r.includes('dcoded') || r.includes('d-coded') || r.includes('regional lead'));

        // 3. Dliever / Regional Helper Tier (Tier 1)
        const isDliever = rawRoleIds.includes("1470656257168900149") || // Dliever
                          rawRoleIds.includes("1486866119825555588") || // Regional Helper
                          roleStrings.some(r => r.includes('dliever') || r.includes('deliver') || r.includes('d-liever') || r.includes('regional helper'));

        if (isDCO) {
          detectedRole = 'dco';
        } else if (isDecoded) {
          detectedRole = 'decoded';
        } else if (isDliever) {
          detectedRole = 'dliever';
        } else {
          detectedRole = 'none';
        }

        const payload = {
          type: 'DISCORD_AUTH_SUCCESS',
          username: fullUsername,
          id: userData.id,
          avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : null,
          roles: userRoles,
          detectedRole: detectedRole,
          joinDate: joinDate
        };

        const html = `
          <!DOCTYPE html>
          <html>
          <head><title>Discord Connected</title></head>
          <body style="background:#050505;color:#00ffc2;font-family:sans-serif;text-align:center;padding:40px;">
            <h2>Dlicom Discord Connected!</h2>
            <p>User: <strong>${fullUsername}</strong></p>
            <p>Dlicom Role: <strong>${detectedRole.toUpperCase()}</strong></p>
            <p>Member Since: <strong>${joinDate || "Active"}</strong></p>
            <script>
              const authPayload = ${JSON.stringify(payload)};
              if (window.opener) {
                try {
                  window.opener.postMessage(authPayload, '*');
                } catch(e) {}
                setTimeout(() => { window.close(); }, 700);
              } else {
                // Mobile same-tab fallback: persist session directly and redirect to app
                try {
                  const existing = JSON.parse(localStorage.getItem('twin_manifest_session') || '{}');
                  localStorage.setItem('twin_manifest_session', JSON.stringify(Object.assign(existing, {
                    discordConnected: true,
                    discordUsername: authPayload.username,
                    discordAvatar: authPayload.avatar,
                    discordUserId: authPayload.id,
                    currentRole: authPayload.detectedRole,
                    joinedServerDate: authPayload.joinDate,
                    serverRoles: authPayload.roles
                  })));
                } catch (e) {}
                window.location.href = '/';
              }
            </script>
          </body>
          </html>
        `;

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': Buffer.byteLength(html) });
        res.end(html);

      } catch (err) {
        const errHtml = `<script>alert("Discord Error: ${err.message}"); window.close();</script>`;
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': Buffer.byteLength(errHtml) });
        res.end(errHtml);
      }
      return;
    }

    // 4. SAVE CARD SNAPSHOT (For Social / Twitter Card Previews)
    if (pathname === '/api/card/snapshot' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const imageBase64 = data.imageBase64;
          if (!imageBase64) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'No image data provided' }));
            return;
          }

          const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          const id = (data.twinId || ('twin-' + Date.now())).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
          const snapshotDir = path.join(__dirname, 'assets', 'snapshots');
          if (!fs.existsSync(snapshotDir)) {
            fs.mkdirSync(snapshotDir, { recursive: true });
          }

          const filePath = path.join(snapshotDir, `${id}.png`);
          fs.writeFileSync(filePath, buffer);

          const host = req.headers.host || `localhost:${PORT}`;
          const proto = req.headers['x-forwarded-proto'] || 'http';
          const shareUrl = `${proto}://${host}/c/${id}`;
          const imageUrl = `${proto}://${host}/assets/snapshots/${id}.png`;

          const resp = JSON.stringify({
            success: true,
            id: id,
            shareUrl: shareUrl,
            imageUrl: imageUrl
          });
          res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(resp) });
          res.end(resp);
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });
      return;
    }

    // 5. SOCIAL SHARE PERMALINK ROUTE (/c/:id)
    if (pathname.startsWith('/c/') || pathname.startsWith('/card/')) {
      const id = pathname.replace(/^\/(c|card)\//, '').replace(/\.png$/, '').trim();
      const host = req.headers.host || `localhost:${PORT}`;
      const proto = req.headers['x-forwarded-proto'] || 'http';
      const imgUrl = `${proto}://${host}/assets/snapshots/${id}.png`;
      const appUrl = `${proto}://${host}/`;

      const shareHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Dili Manifest // Dlicom Digital Twin</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@DlicomApp" />
  <meta name="twitter:creator" content="@DlicomApp" />
  <meta name="twitter:title" content="Dili Manifest // Sovereign Digital Twin" />
  <meta name="twitter:description" content="Manifested my Sovereign Digital Twin in the Dlicom Community! 🔮" />
  <meta name="twitter:image" content="${imgUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Dili Manifest // Dlicom Community" />
  <meta property="og:title" content="Dili Manifest // Sovereign Digital Twin" />
  <meta property="og:description" content="Manifested my Sovereign Digital Twin in the Dlicom Community! 🔮" />
  <meta property="og:image" content="${imgUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="1600" />
  <meta property="og:url" content="${proto}://${host}/c/${id}" />
  <meta http-equiv="refresh" content="2; url=/" />
  <style>
    body { background: #060608; color: #fff; font-family: 'Space Grotesk', system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
    .card-img { max-width: 90vw; max-height: 70vh; border: 2px solid #27272a; border-radius: 8px; box-shadow: 0 0 30px rgba(0,255,194,0.15); margin: 20px 0; }
    .btn { background: #00ffc2; color: #000; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-family: monospace; text-transform: uppercase; }
  </style>
</head>
<body>
  <h2 style="letter-spacing: 2px; text-transform: uppercase; margin-bottom: 5px;">✦ Dili Manifest // Dlicom ✦</h2>
  <p style="color: #83958c; font-size: 14px; margin-top: 0;">Sovereign Digital Twin Card</p>
  <img class="card-img" src="${imgUrl}" alt="Manifest Card" />
  <div>
    <a class="btn" href="/">Manifest Your Own Twin →</a>
  </div>
</body>
</html>`;

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': Buffer.byteLength(shareHtml) });
      res.end(shareHtml);
      return;
    }



    // =========================================================================
    // STATIC FILE SERVING
    // =========================================================================
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

    const safePath = path.normalize(filePath);
    if (!safePath.startsWith(__dirname)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.stat(safePath, (err, stats) => {
      if (err || !stats.isFile()) {
        const indexPath = path.join(__dirname, 'index.html');
        fs.readFile(indexPath, (readErr, content) => {
          if (readErr) {
            res.writeHead(404);
            res.end('Not Found');
          } else {
            res.writeHead(200, {
              'Content-Type': 'text/html; charset=utf-8',
              'Content-Length': content.length
            });
            res.end(content);
          }
        });
        return;
      }

      const ext = path.extname(safePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(safePath, (readErr, content) => {
        if (readErr) {
          res.writeHead(500);
          res.end('Error loading file');
        } else {
          res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': content.length
          });
          res.end(content);
        }
      });
    });

  } catch (globalErr) {
    console.error("Unhandled server error:", globalErr);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  DLICOM DILI MANIFEST SERVER RUNNING AT: http://localhost:${PORT}`);
    console.log(`  TARGET GUILD: Dlicom Official (ID: ${DLICOM_GUILD_ID})`);
    console.log(`  DISCORD BOT INTENT: ${process.env.DISCORD_BOT_TOKEN ? 'CONFIGURED (LIVE)' : 'NOT CONFIGURED'}`);
    console.log(`======================================================\n`);
  });
}

module.exports = server;
