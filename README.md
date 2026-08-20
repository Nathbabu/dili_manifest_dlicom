# Dili Manifest Studio 🔮

> **Manifest your Sovereign Digital Twin with @DlicomApp**

Dili Manifest Studio is an interactive cyber-themed web application built for the **Dlicom Community**. It allows community members to authenticate via Discord, verify their server role, pull real-time Dlicom X analytics, customize their 3D mascot avatar, and export high-resolution manifest cards.

---

## ✨ Features

- **🛡️ 1-Click Discord OAuth2**: Verifies server membership, extracts guild join date, and unlocks exclusive role tiers (`Dliever`, `Dcoded`, `DCO`, or `No Role`).
- **📊 Real-Time Dlicom X Analytics**: Queries live Proof-of-Work metrics (Dlicom Impressions, Posts, and Engagement Rate) via `xerper.com`.
- **🦸 32 Character Matrix**: 8 unique mascot color variants for each of the 4 tiers:
  - **Cadet / Basic (No Role)**: 8 Hero Mascots with Capes
  - **Tier 1 (Dliever)**: 8 Cyber Visor Mascots
  - **Tier 2 (Dcoded)**: 8 Neon Glowing Dcoded Mascots
  - **Tier 3 (DCO)**: 8 Platinum-Silver Sovereign Mascots
- **🎨 1200×1600 High-Res Export**: 1-click clipboard copy and high-resolution PNG download.
- **🚀 Share on X**: Pre-filled tweet generator with creator attribution.
- **🌌 Ambient WebGL Shader & Cyber SFX**: Immersive visual and audio experience.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), TailwindCSS (CDN), WebGL Canvas, HTML5 Web Audio API
- **Backend**: Node.js, Express.js
- **Integrations**: Discord OAuth2 & Guild API, Xerper.com Analytics API

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Nathbabu/dili_manifest_dlicom.git
cd dili_manifest_dlicom
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
PORT=8080
BASE_URL=http://localhost:8080
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_GUILD_ID=your_dlicom_guild_id
```

### 4. Run the Server
```bash
npm start
```
Visit `http://localhost:8080` in your browser.

---

## 👥 Credits & Attribution

- **Made for the Dlicom Community by [@Crypto_Atanu](https://x.com/Crypto_Atanu) (Discord: `@nathbabu`)**
- Official mascot art & branding assets created via Stitch for the Dlicom Community.
