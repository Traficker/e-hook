/**
 * Smart Media & Video Embed Helper
 * Transforms YouTube (standard, shorts), Instagram (posts, reels), TikTok, Vimeo links, 
 * or raw iframe strings into clean, responsive embedded player widgets that display directly inside the web app.
 */

export function parseVideoUrl(input) {
  if (!input || typeof input !== 'string') {
    return {
      type: 'none',
      embedUrl: null,
      isVertical: false
    };
  }

  let cleaned = input.trim();

  // If user pasted an <iframe> embed code snippet directly
  if (cleaned.includes('<iframe')) {
    const srcMatch = cleaned.match(/src=["']([^"']+)["']/);
    if (srcMatch && srcMatch[1]) {
      cleaned = srcMatch[1];
    }
  }

  // 1. YouTube Shorts: https://www.youtube.com/shorts/VIDEO_ID
  const ytShortsMatch = cleaned.match(/(?:youtube\.com\/shorts\/)([^/?#&]+)/i);
  if (ytShortsMatch && ytShortsMatch[1]) {
    return {
      type: 'youtube-shorts',
      platform: 'YouTube Shorts',
      videoId: ytShortsMatch[1],
      isVertical: true,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytShortsMatch[1]}?autoplay=0&rel=0&modestbranding=1`
    };
  }

  // 2. YouTube standard URL: https://www.youtube.com/watch?v=VIDEO_ID
  const ytWatchMatch = cleaned.match(/(?:youtube\.com\/watch\?v=)([^&]+)/i);
  if (ytWatchMatch && ytWatchMatch[1]) {
    return {
      type: 'youtube',
      platform: 'YouTube',
      videoId: ytWatchMatch[1],
      isVertical: false,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytWatchMatch[1]}?autoplay=0&rel=0&modestbranding=1`
    };
  }

  // 3. YouTube short URL: https://youtu.be/VIDEO_ID
  const ytShortMatch = cleaned.match(/(?:youtu\.be\/)([^?&]+)/i);
  if (ytShortMatch && ytShortMatch[1]) {
    return {
      type: 'youtube',
      platform: 'YouTube',
      videoId: ytShortMatch[1],
      isVertical: false,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytShortMatch[1]}?autoplay=0&rel=0&modestbranding=1`
    };
  }

  // 4. YouTube embed URL: https://www.youtube.com/embed/VIDEO_ID
  const ytEmbedMatch = cleaned.match(/(?:youtube\.com\/embed\/)([^?&]+)/i);
  if (ytEmbedMatch && ytEmbedMatch[1]) {
    return {
      type: 'youtube',
      platform: 'YouTube',
      videoId: ytEmbedMatch[1],
      isVertical: false,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytEmbedMatch[1]}?autoplay=0&rel=0&modestbranding=1`
    };
  }

  // 5. Instagram (Post, Reel, TV, Reels, Share):
  const igMatch = cleaned.match(/(?:instagram\.com|instagr\.am)\/(?:[a-zA-Z0-9_.]+\/)?(?:p|reel|reels|tv|share\/reel|share\/p)\/([a-zA-Z0-9_-]+)/i);
  if (igMatch && igMatch[1]) {
    const isReel = cleaned.toLowerCase().includes('/reel');
    return {
      type: 'instagram',
      platform: isReel ? 'Instagram Reel' : 'Instagram Post',
      videoId: igMatch[1],
      isVertical: true,
      embedUrl: `https://www.instagram.com/p/${igMatch[1]}/embed/`
    };
  }

  // 6. TikTok: https://www.tiktok.com/@user/video/ID or tiktok.com/v/ID
  const ttMatch = cleaned.match(/(?:tiktok\.com\/@?[^/]+\/video\/|tiktok\.com\/v\/)([0-9]+)/i);
  if (ttMatch && ttMatch[1]) {
    return {
      type: 'tiktok',
      platform: 'TikTok',
      videoId: ttMatch[1],
      isVertical: true,
      embedUrl: `https://www.tiktok.com/embed/v2/${ttMatch[1]}`
    };
  }

  // 7. Vimeo URL: https://vimeo.com/VIDEO_ID
  const vimeoMatch = cleaned.match(/(?:vimeo\.com\/)(?:video\/)?([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      platform: 'Vimeo',
      videoId: vimeoMatch[1],
      isVertical: false,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?color=6366f1&title=0&byline=0&portrait=0`
    };
  }

  // 8. Google Drive Video: https://drive.google.com/file/d/FILE_ID/view or open?id=FILE_ID
  const driveMatch = cleaned.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=))([^/?#&]+)/i);
  if (driveMatch && driveMatch[1]) {
    return {
      type: 'googledrive',
      platform: 'Google Drive Video',
      videoId: driveMatch[1],
      isVertical: false,
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`
    };
  }

  // Fallback direct iframe URL or standard video source
  return {
    type: 'custom',
    platform: 'Multimedia',
    isVertical: false,
    embedUrl: cleaned
  };
}

export function renderVideoContainer(videoUrl, title = 'Contenido Multimedia') {
  const parsed = parseVideoUrl(videoUrl);

  if (!parsed.embedUrl) {
    return `
      <div class="video-placeholder">
        <div class="placeholder-content">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
          <p>No hay contenido multimedia configurado.</p>
          <small>Un administrador puede agregar el enlace de YouTube, Instagram, TikTok o Vimeo.</small>
        </div>
      </div>
    `;
  }

  const isVertical = parsed.isVertical;
  const platformName = parsed.platform || 'Reproduciendo dentro de SkoolX';

  if (parsed.type === 'instagram') {
    return `
      <div class="video-player-wrapper instagram-clean-wrapper" style="max-width:480px; margin:0 auto; border-radius:var(--radius-lg); overflow:hidden; background:#000; box-shadow:0 12px 35px rgba(0,0,0,0.6);">
        <div class="instagram-frame-clipper" style="position:relative; width:100%; height:490px; overflow:hidden; background:#000;">
          <iframe
            src="${parsed.embedUrl}"
            title="${title}"
            style="position:absolute; top:0; left:0; width:100%; height:580px; border:none; display:block;"
            frameborder="0"
            scrolling="no"
            allowtransparency="true"
            allow="encrypted-media"
            loading="lazy">
          </iframe>
        </div>
        <div class="video-bar">
          <span class="video-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            ${platformName}
          </span>
          <span class="video-note">🔒 Reproducción integrada en SkoolX</span>
        </div>
      </div>
    `;
  }

  if (isVertical) {
    return `
      <div class="video-player-wrapper vertical-media-wrapper" style="max-width:440px; margin:0 auto;">
        <div style="position:relative; width:100%; height:540px; background:#000; border-radius:var(--radius-md); overflow:hidden;">
          <iframe
            src="${parsed.embedUrl}"
            title="${title}"
            style="width:100%; height:100%; border:none;"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowtransparency="true"
            allowfullscreen
            loading="lazy">
          </iframe>
        </div>
        <div class="video-bar">
          <span class="video-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            ${platformName}
          </span>
          <span class="video-note">🔒 Incrustado seguro sin redirección</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="video-player-wrapper">
      <div class="video-aspect-ratio">
        <iframe
          src="${parsed.embedUrl}"
          title="${title}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          loading="lazy">
        </iframe>
      </div>
      <div class="video-bar">
        <span class="video-tag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          ${platformName}
        </span>
        <span class="video-note">🔒 Transmisión incrustada segura sin redirección</span>
      </div>
    </div>
  `;
}

// Expose globally for news / admin editor preview
if (typeof window !== 'undefined') {
  window._parseVideoUrl = parseVideoUrl;
}

