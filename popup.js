document.addEventListener('DOMContentLoaded', () => {
    // Pomodoro Timer
    let timeLeft = 25 * 60; // 25 minutes in seconds
    let timerId = null;
    let isRunning = false;
  
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');
    const startBtn = document.getElementById('start-timer');
    const pauseBtn = document.getElementById('pause-timer');
    const resetBtn = document.getElementById('reset-timer');
    const durationSelect = document.getElementById('timer-duration');
  
    function updateDisplay() {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      minutesDisplay.textContent = minutes.toString().padStart(2, '0');
      secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    }
  
    function startTimer() {
      if (!isRunning) {
        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        timerId = setInterval(() => {
          timeLeft--;
          updateDisplay();
          if (timeLeft === 0) {
            clearInterval(timerId);
            isRunning = false;
            new Notification('Pomodoro Timer', {
              body: 'Time is up! Take a break.',
              icon: 'icon48.png'
            });
            startBtn.disabled = false;
            pauseBtn.disabled = true;
          }
        }, 1000);
      }
    }
  
    function pauseTimer() {
      clearInterval(timerId);
      isRunning = false;
      startBtn.disabled = false;
      pauseBtn.disabled = true;
    }
  
    function resetTimer() {
      clearInterval(timerId);
      isRunning = false;
      timeLeft = parseInt(durationSelect.value) * 60;
      updateDisplay();
      startBtn.disabled = false;
      pauseBtn.disabled = true;
    }
  
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    durationSelect.addEventListener('change', resetTimer);
  
    // Content Blocking
    const toggles = {
      'yt-recommendations': document.getElementById('yt-recommendations'),
      'yt-shorts': document.getElementById('yt-shorts'),
      'ig-reels': document.getElementById('ig-reels')
    };
  
    // Load saved settings
    chrome.storage.sync.get(['ytRecommendations', 'ytShorts', 'igReels'], (result) => {
      toggles['yt-recommendations'].checked = result.ytRecommendations ?? false;
      toggles['yt-shorts'].checked = result.ytShorts ?? false;
      toggles['ig-reels'].checked = result.igReels ?? false;
    });
  
    // Save settings on change
    Object.entries(toggles).forEach(([key, element]) => {
      element.addEventListener('change', () => {
        const settings = {
          ytRecommendations: toggles['yt-recommendations'].checked,
          ytShorts: toggles['yt-shorts'].checked,
          igReels: toggles['ig-reels'].checked
        };
        chrome.storage.sync.set(settings);
        
        // Notify content script and reload page
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, settings);
            chrome.tabs.reload(tabs[0].id);
          }
        });
      });
    });
  });