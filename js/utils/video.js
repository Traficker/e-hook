/**
 * Smart Video Embed Helper
 * Transforms YouTube watch links, shortened URLs, Vimeo links, or raw iframe strings
 * into clean, responsive embedded player URLs that display directly inside the web app.
 */

export function parseVideoUrl(input) {
  if (!input || typeof input !== 'string') {
    return {
      type: 'none',
      embedUrl: null
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

  // 1. YouTube standard URL: https://www.youtube.com/watch?v=VIDEO_ID
  const ytWatchMatch = cleaned.match(/(?:youtube\.com\/watch\?v=)([^&]+)/i);
  if (ytWatchMatch && ytWatchMatch[1]) {
    return {
      type: 'youtube',
      videoId: ytWatchMatch[1],
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytWatchMatch[1]}?autoplay=0&rel=0&modestbranding=1`
    };
  }

  // 2. YouTube short URL: https://youtu.be/VIDEO_ID
  const ytShortMatch = cleaned.match(/(?:youtu\.be\/)([^?&]+)/i);
  if (ytShortMatch && ytShortMatch[1]) {
    return {
      type: 'youtube',
      videoId: ytShortMatch[1],
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytShortMatch[1]}?autoplay=0&rel=0&modestbranding=1`
    };
  }

  // 3. YouTube embed URL: https://www.youtube.com/embed/VIDEO_ID
  const ytEmbedMatch = cleaned.match(/(?:youtube\.com\/embed\/)([^?&]+)/i);
  if (ytEmbedMatch && ytEmbedMatch[1]) {
    return {
      type: 'youtube',
      videoId: ytEmbedMatch[1],
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytEmbedMatch[1]}?autoplay=0&rel=0&modestbranding=1`
    };
  }

  // 4. Vimeo URL: https://vimeo.com/VIDEO_ID
  const vimeoMatch = cleaned.match(/(?:vimeo\.com\/)(?:video\/)?([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      videoId: vimeoMatch[1],
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?color=6366f1&title=0&byline=0&portrait=0`
    };
  }

  // Fallback direct iframe URL or standard video source
  return {
    type: 'custom',
    embedUrl: cleaned
  };
}

export function renderVideoContainer(videoUrl, title = 'Video de la Lección') {
  const parsed = parseVideoUrl(videoUrl);

  if (!parsed.embedUrl) {
    return `
      <div class="video-placeholder">
        <div class="placeholder-content">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
          <p>No hay enlace de video configurado para esta lección.</p>
          <small>Un administrador puede agregar el enlace de YouTube desde el panel de control.</small>
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
          Reproduciendo dentro de SkoolX
        </span>
        <span class="video-note">🔒 Transmisión incrustada segura sin redirección</span>
      </div>
    </div>
  `;
}

// Expose globally for admin editor preview (no module import required)
if (typeof window !== 'undefined') {
  window._parseVideoUrl = parseVideoUrl;
}
