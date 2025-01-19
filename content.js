let settings = {
    ytRecommendations: false,
    ytShorts: false,
    igReels: false
  };
  
  // Updated selectors for YouTube Shorts
  const YOUTUBE_SELECTORS = {
    shorts: [
      'ytd-reel-shelf-renderer',           // Shorts shelf in home
      'ytd-rich-shelf-renderer',           // Alternative shorts shelf
      'ytd-mini-guide-entry-renderer[aria-label="Shorts"]', // Sidebar Shorts
      'a[title="Shorts"]',                 // Navigation Shorts
      '[page-subtype="shorts"]',           // Shorts page elements
      'ytd-guide-entry-renderer[title="Shorts"]', // Guide menu Shorts
      'ytd-reel-video-renderer',           // Individual Short videos
      'ytd-shorts',                        // Shorts container
      '#shorts-container'                  // Shorts container alternative
    ],
    recommendations: [
      'ytd-rich-grid-renderer',            // Home page recommendations
      'ytd-watch-next-secondary-results-renderer', // Video page recommendations
      '#related'                           // Related videos
    ]
  };
  
  // Load settings
  chrome.storage.sync.get(['ytRecommendations', 'ytShorts', 'igReels'], (result) => {
    settings = {
      ytRecommendations: result.ytRecommendations ?? false,
      ytShorts: result.ytShorts ?? false,
      igReels: result.igReels ?? false
    };
    applyBlocking();
  });
  
  // Listen for settings changes
  chrome.runtime.onMessage.addListener((message) => {
    settings = message;
    applyBlocking();
    return true;
  });
  
  function applyBlocking() {
    // Remove existing blocking styles
    const existingStyles = document.querySelectorAll('.nosuggs-style');
    existingStyles.forEach(style => style.remove());
    
    if (window.location.href.includes('youtube.com')) {
      if (settings.ytShorts) {
        YOUTUBE_SELECTORS.shorts.forEach(selector => hideElement(selector));
        // Redirect from /shorts URLs
        if (window.location.pathname.includes('/shorts')) {
          window.location.href = 'https://www.youtube.com';
        }
      }
      
      if (settings.ytRecommendations) {
        YOUTUBE_SELECTORS.recommendations.forEach(selector => hideElement(selector));
      }
    } else if (window.location.href.includes('instagram.com') && settings.igReels) {
      hideElement('div[role="tablist"]');
      if (window.location.pathname.includes('/reels')) {
        window.location.href = 'https://www.instagram.com';
      }
    }
  }
  
  function hideElement(selector) {
    const style = document.createElement('style');
    style.className = 'nosuggs-style';
    style.textContent = `${selector} { display: none !important; }`;
    document.head.appendChild(style);
  }
  
  // Run on page load and observe DOM changes
  applyBlocking();
  const observer = new MutationObserver(() => {
    if (settings.ytRecommendations || settings.ytShorts || settings.igReels) {
      applyBlocking();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });