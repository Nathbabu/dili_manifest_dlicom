// Dili Manifest - Single Page Canvas Exporter & Social Dispatcher (25 Character Matrix)
const ShareKit = (function() {

  function renderCardToCanvas(options) {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');

    const roleInfo = options.roleInfo || TWIN_STUDIO_DATA.roles.dliever;
    const colorTheme = options.themeHex || roleInfo.color || '#00ffc2';

    // 1. Dark Void Background
    ctx.fillStyle = '#060608';
    ctx.fillRect(0, 0, 1200, 1600);

    // 2. Radial Ambient Gradient
    const bgGrad = ctx.createRadialGradient(600, 500, 50, 600, 600, 750);
    bgGrad.addColorStop(0, colorTheme + '28');
    bgGrad.addColorStop(0.5, '#0c0c12');
    bgGrad.addColorStop(1, '#050505');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 1600);

    // 3. Brutalist Cyber Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 40; x < 1200; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(1200, 1600);
      ctx.stroke();
    }
    for (let y = 40; y < 1600; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1200, y);
      ctx.stroke();
    }

    // 4. Heavy Outer Frame & Cyber Corners
    ctx.strokeStyle = colorTheme;
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, 1100, 1500);

    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, 1080, 1480);

    // Thick Corner Brackets
    const corner = 45;
    ctx.fillStyle = colorTheme;
    // Top-Left
    ctx.fillRect(40, 40, corner, 8);
    ctx.fillRect(40, 40, 8, corner);
    // Top-Right
    ctx.fillRect(1160 - corner, 40, corner, 8);
    ctx.fillRect(1152, 40, 8, corner);
    // Bottom-Left
    ctx.fillRect(40, 1552, corner, 8);
    ctx.fillRect(40, 1560 - corner, 8, corner);
    // Bottom-Right
    ctx.fillRect(1160 - corner, 1552, corner, 8);
    ctx.fillRect(1152, 1560 - corner, 8, corner);

    // 5. Header: Dili Manifest Logo & Dlicom Official Logo
    if (options.twinManifestLogo && options.twinManifestLogo.complete) {
      ctx.drawImage(options.twinManifestLogo, 90, 100, 64, 64);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(90, 100, 64, 64);
    }

    const textStartX = options.twinManifestLogo && options.twinManifestLogo.complete ? 170 : 90;

    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText("DILI MANIFEST", textStartX, 132);

    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.fillStyle = colorTheme;
    ctx.fillText("DLICOM COMMUNITY", textStartX, 160);

    // Role Badge
    const badgeText = (roleInfo.badgeTitle || "COMMUNITY CADET").toUpperCase();
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    const badgeWidth = ctx.measureText(badgeText).width + 32;
    ctx.fillStyle = colorTheme + '22';
    ctx.fillRect(1090 - badgeWidth, 110, badgeWidth, 48);
    ctx.strokeStyle = colorTheme;
    ctx.lineWidth = 2;
    ctx.strokeRect(1090 - badgeWidth, 110, badgeWidth, 48);
    ctx.fillStyle = colorTheme;
    ctx.fillText(badgeText, 1090 - badgeWidth + 16, 142);

    // Official Dlicom White Logo beside Role Badge
    if (options.dlicomLogo && options.dlicomLogo.complete) {
      const dlicomX = 1090 - badgeWidth - 52;
      ctx.drawImage(options.dlicomLogo, dlicomX, 116, 36, 36);
    }

    // 6. Mascot Display Box
    const imgBoxX = 90;
    const imgBoxY = 195;
    const imgBoxW = 1020;
    const imgBoxH = 680;

    ctx.fillStyle = '#08080c';
    ctx.fillRect(imgBoxX, imgBoxY, imgBoxW, imgBoxH);
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 2;
    ctx.strokeRect(imgBoxX, imgBoxY, imgBoxW, imgBoxH);

    // Mascot image rendering
    if (options.characterImg && options.characterImg.complete) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(imgBoxX, imgBoxY, imgBoxW, imgBoxH);
      ctx.clip();

      const imgAspect = options.characterImg.width / options.characterImg.height;
      let drawH = imgBoxH * 0.96;
      let drawW = drawH * imgAspect;
      if (drawW > imgBoxW * 0.96) {
        drawW = imgBoxW * 0.96;
        drawH = drawW / imgAspect;
      }
      const drawX = imgBoxX + (imgBoxW - drawW) / 2;
      const drawY = imgBoxY + (imgBoxH - drawH) / 2;
      ctx.drawImage(options.characterImg, drawX, drawY, drawW, drawH);

      // Character Design Badge Tag in Viewport
      const tagText = (options.characterTheme || "ACTIVE CHASSIS").toUpperCase();
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      const tagW = ctx.measureText(tagText).width + 24;
      ctx.fillStyle = 'rgba(6, 6, 10, 0.85)';
      ctx.fillRect(imgBoxX + imgBoxW - tagW - 20, imgBoxY + 20, tagW, 32);
      ctx.strokeStyle = colorTheme;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(imgBoxX + imgBoxW - tagW - 20, imgBoxY + 20, tagW, 32);
      ctx.fillStyle = colorTheme;
      ctx.fillText(tagText, imgBoxX + imgBoxW - tagW - 8, imgBoxY + 41);

      ctx.restore();
    }

    // Subtle Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    for (let y = imgBoxY; y < imgBoxY + imgBoxH; y += 8) {
      ctx.fillRect(imgBoxX, y, imgBoxW, 3);
    }

    // 7. Identity & Resonance Data Grid
    const dataY = 900;
    ctx.fillStyle = '#0c0c10';
    ctx.fillRect(90, dataY, 1020, 260);
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 2;
    ctx.strokeRect(90, dataY, 1020, 260);

    const stats = [
      { label: "DISCORD IDENTITY", value: options.discordUsername || "Unlinked", color: "#5865F2" },
      { label: "X / TWITTER HANDLE", value: options.xUsername ? `@${options.xUsername}` : "Unlinked", color: "#ffffff" },
      { label: "HIGHEST DISCORD ROLE", value: roleInfo.name.toUpperCase(), color: colorTheme },
      { label: "JOINED DLICOM SERVER", value: options.joinedServerDate || "Recent Member", color: colorTheme },
      { label: "DLICOM ALL-TIME IMPRESSIONS", value: options.xImpressions && options.xImpressions !== '0' ? options.xImpressions : "Verified", color: "#10b981" },
      { label: "DLICOM POSTS / ENGAGEMENT", value: options.xPosts ? `${options.xPosts} Posts (${options.xEngagement || '7.4%'})` : `${options.resonanceScore || "75.0"}%`, color: "#00ffc2" }
    ];

    stats.forEach((st, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cellX = 120 + col * 510;
      const cellY = dataY + 45 + row * 78;

      ctx.fillStyle = colorTheme;
      ctx.fillRect(cellX - 8, cellY - 18, 3, 50);

      ctx.font = 'bold 15px "JetBrains Mono", monospace';
      ctx.fillStyle = '#83958c';
      ctx.fillText(st.label, cellX + 10, cellY);

      ctx.font = 'bold 22px "Space Grotesk", sans-serif';
      ctx.fillStyle = st.color;
      ctx.fillText(st.value, cellX + 10, cellY + 28);
    });

    // 8. Active Character Design Bar
    const artY = 1180;
    ctx.fillStyle = '#0c0c10';
    ctx.fillRect(90, artY, 1020, 90);
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 2;
    ctx.strokeRect(90, artY, 1020, 90);

    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    ctx.fillStyle = '#83958c';
    ctx.fillText("ACTIVE CHARACTER DESIGN:", 120, artY + 30);

    const charTitle = options.characterName 
      ? `✦  ${options.characterName}  (${roleInfo.name})`
      : "✦  Cadet Chassis // Mint Mist (Community Cadet)";
    
    ctx.font = 'bold 18px "Space Grotesk", sans-serif';
    ctx.fillStyle = colorTheme;
    ctx.fillText(charTitle, 120, artY + 62);

    // 9. Custom Manifest Lore / Quote
    const quoteY = 1290;
    ctx.fillStyle = '#08080b';
    ctx.fillRect(90, quoteY, 1020, 85);
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 2;
    ctx.strokeRect(90, quoteY, 1020, 85);

    ctx.font = 'italic 18px "Inter", sans-serif';
    ctx.fillStyle = '#e5e2e1';
    const quote = `"${options.customQuote || "Sovereign on-chain architect decoding digital ether."}"`;
    ctx.fillText(quote, 120, quoteY + 48);

    // 10. Bottom Security Barcode & Community Footer
    const footerY = 1395;
    ctx.fillStyle = '#e5e2e1';

    // Barcode lines
    const barcodeX = 90;
    const bars = [4, 12, 6, 8, 14, 4, 18, 6, 4, 10, 16, 4, 8, 12, 4, 20, 6, 10, 4, 12, 6];
    let curX = barcodeX;
    bars.forEach((w) => {
      ctx.fillRect(curX, footerY, w, 32);
      curX += w + 6;
    });

    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.fillStyle = '#83958c';
    ctx.fillText(`HASH: ${options.hash || "0x7F9a...3B9A"} // VERIFIED`, 90, footerY + 54);

    ctx.font = 'bold 20px "Space Grotesk", sans-serif';
    ctx.fillStyle = colorTheme;
    ctx.fillText("DLICOM TWIN STUDIO", 810, footerY + 24);

    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.fillStyle = '#83958c';
    ctx.fillText("COMMUNITY EDITION // 2026", 810, footerY + 50);

    // 11. "MADE FOR DLICOM COMMUNITY" Prominent Footer Tag with Dlicom Logo & Xerper Attribution
    ctx.fillStyle = '#121218';
    ctx.fillRect(90, 1485, 1020, 45);
    ctx.strokeStyle = colorTheme + '66';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(90, 1485, 1020, 45);

    if (options.dlicomLogo && options.dlicomLogo.complete) {
      ctx.drawImage(options.dlicomLogo, 110, 1496, 22, 22);
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      ctx.fillStyle = colorTheme;
      ctx.fillText("MADE FOR DLICOM COMMUNITY", 142, 1513);

      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillStyle = '#83958c';
      
    } else {
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      ctx.fillStyle = colorTheme;
      ctx.fillText("MADE FOR DLICOM COMMUNITY", 110, 1513);
      
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillStyle = '#83958c';
      
    }

    return canvas;
  }

  function loadAssetsAndRender(options, callback) {
    const characterImg = new Image();
    characterImg.crossOrigin = "anonymous";
    characterImg.src = options.characterImgSrc || "assets/characters/cadet-base.png";

    const twinManifestLogo = new Image();
    twinManifestLogo.crossOrigin = "anonymous";
    twinManifestLogo.src = "assets/dili-manifest-logo.png";

    const dlicomLogo = new Image();
    dlicomLogo.crossOrigin = "anonymous";
    dlicomLogo.src = "assets/dlicom-logo.png";

    let loadedCount = 0;
    const totalImages = 3;

    const onImageDone = () => {
      loadedCount++;
      if (loadedCount >= totalImages) {
        options.characterImg = characterImg;
        options.twinManifestLogo = twinManifestLogo;
        options.dlicomLogo = dlicomLogo;
        const canvas = renderCardToCanvas(options);
        callback(canvas);
      }
    };

    characterImg.onload = onImageDone;
    characterImg.onerror = onImageDone;
    twinManifestLogo.onload = onImageDone;
    twinManifestLogo.onerror = onImageDone;
    dlicomLogo.onload = onImageDone;
    dlicomLogo.onerror = onImageDone;
  }

  return {
    copyCardImage: function(options, callback) {
      if (!navigator.clipboard || !navigator.clipboard.write) {
        if (callback) callback(false, "Clipboard image copying is not supported on this browser. Use Download PNG instead!");
        return;
      }

      // Create Promise for the blob immediately to preserve user activation context in Chrome/Safari/Edge
      const blobPromise = new Promise((resolve, reject) => {
        loadAssetsAndRender(options, (canvas) => {
          try {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Canvas render failed"));
            }, 'image/png');
          } catch (e) {
            reject(e);
          }
        });
      });

      try {
        const item = new ClipboardItem({ 'image/png': blobPromise });
        navigator.clipboard.write([item]).then(() => {
          CyberAudio.success();
          if (callback) callback(true);
        }).catch((err) => {
          console.warn('Clipboard promise write error, trying direct fallback:', err);
          blobPromise.then(blob => {
            const directItem = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([directItem]).then(() => {
              CyberAudio.success();
              if (callback) callback(true);
            }).catch((err2) => {
              console.warn('Direct fallback clipboard error:', err2);
              if (callback) callback(false, "Clipboard access was blocked by browser. Please use Download PNG!");
            });
          }).catch(err3 => {
            if (callback) callback(false, err3.message);
          });
        });
      } catch (err) {
        console.warn('ClipboardItem constructor error:', err);
        blobPromise.then(blob => {
          navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(() => {
            CyberAudio.success();
            if (callback) callback(true);
          }).catch((err2) => {
            if (callback) callback(false, err2.message);
          });
        }).catch(err3 => {
          if (callback) callback(false, err3.message);
        });
      }
    },

    downloadCard: function(options) {
      loadAssetsAndRender(options, (canvas) => {
        const link = document.createElement('a');
        link.download = `twin-manifest-${options.twinId || 'card'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        CyberAudio.success();
      });
    },

    shareToX: function(options) {
      const roleName = options.roleName || (options.roleInfo ? options.roleInfo.name : 'Dliever');
      const discordUser = options.discordUsername || 'Community Member';

      const tweetText = `Manifested my Sovereign Dili Twin with @DlicomApp! 🔮\n\nDiscord ID: ${discordUser} with Highest Role: ${roleName}\n\nMade via Dili Manifest Studio by @Crypto_Atanu\n\n#Dlicom #DiliManifest`;

      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      window.open(url, '_blank');
      CyberAudio.success();
    },

    copyShareLink: function() {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        CyberAudio.success();
      }).catch(() => {
        CyberAudio.error();
      });
      return url;
    }
  };
})();
