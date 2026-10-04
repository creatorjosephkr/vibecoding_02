/**
 * Google Style Start Homepage JavaScript
 * - Pohang Hourly Weather (via Open-Meteo API)
 * - Google Search Engine Integration
 * - Daily & Random Inspirational Quotes
 * - Realtime Clock & Dark/Light Theme Switcher
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initGoogleSearch();
  initWeather();
  initRadar();
  initQuotes();
});

/* =========================================
   2. Dark / Light Theme Toggle
   ========================================= */
function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('google_start_theme');
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('google_start_theme', newTheme);
    });
  }
}

/* =========================================
   3. Google Search Integration
   ========================================= */
function initGoogleSearch() {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearBtn');
  const btnGoogleSearch = document.getElementById('btnGoogleSearch');
  const btnLuckySearch = document.getElementById('btnLuckySearch');
  const voiceSearchBtn = document.getElementById('voiceSearchBtn');
  const lensBtn = document.getElementById('lensBtn');

  // Show/Hide clear button based on input
  function updateClearBtn() {
    if (searchInput.value.trim().length > 0) {
      clearBtn.classList.add('visible');
    } else {
      clearBtn.classList.remove('visible');
    }
  }

  searchInput.addEventListener('input', updateClearBtn);

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    updateClearBtn();
    searchInput.focus();
  });

  // Hotkey: press '/' anywhere to focus search input
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // Google Search Button
  if (btnGoogleSearch) {
    btnGoogleSearch.addEventListener('click', () => {
      performSearch(searchInput.value);
    });
  }

  // I'm Feeling Lucky Button
  if (btnLuckySearch) {
    btnLuckySearch.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (!query) {
        window.location.href = 'https://www.google.com/doodles';
      } else {
        window.location.href = `https://www.google.com/search?btnI=I&q=${encodeURIComponent(query)}`;
      }
    });
  }

  // Submit Handler
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    performSearch(searchInput.value);
  });

  function performSearch(query) {
    const trimmed = query.trim();
    if (!trimmed) {
      searchInput.focus();
      return;
    }
    // If it looks like a URL, go there directly, otherwise search Google
    const isUrl = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i.test(trimmed);
    if (isUrl && !trimmed.includes(' ')) {
      const url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
      window.location.href = url;
    } else {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
    }
  }

  // Voice Search (Speech Recognition if supported)
  if (voiceSearchBtn) {
    voiceSearchBtn.addEventListener('click', () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        showToast('현재 브라우저에서는 음성 인식을 지원하지 않습니다.');
        return;
      }
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ko-KR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        showToast('음성을 듣고 있습니다... 말씀해 주세요.');
        recognition.start();

        recognition.onresult = (event) => {
          const speechResult = event.results[0][0].transcript;
          searchInput.value = speechResult;
          updateClearBtn();
          performSearch(speechResult);
        };

        recognition.onerror = () => {
          showToast('음성을 인식하지 못했습니다. 다시 시도해 주세요.');
        };
      } catch (err) {
        showToast('음성 인식을 시작할 수 없습니다.');
      }
    });
  }

  // Lens Button (visual search)
  if (lensBtn) {
    lensBtn.addEventListener('click', () => {
      showToast('Google 렌즈 이미지 검색 페이지로 이동합니다.');
      setTimeout(() => {
        window.open('https://images.google.com/', '_blank');
      }, 700);
    });
  }
}

/* =========================================
   4. Weather for Pohang (Open-Meteo API)
   ========================================= */
const POHANG_COORDS = {
  latitude: 36.0190,
  longitude: 129.3435,
};

// Weather Code Interpretation Map (WMO Code)
const WMO_MAP = {
  0: { label: '맑음', icon: 'sunny' },
  1: { label: '대체로 맑음', icon: 'partly_cloudy' },
  2: { label: '구름 조금', icon: 'partly_cloudy' },
  3: { label: '흐림', icon: 'cloudy' },
  45: { label: '안개', icon: 'fog' },
  48: { label: '짙은 안개', icon: 'fog' },
  51: { label: '약한 이슬비', icon: 'drizzle' },
  53: { label: '이슬비', icon: 'drizzle' },
  55: { label: '강한 이슬비', icon: 'drizzle' },
  61: { label: '약한 비', icon: 'rain' },
  63: { label: '비', icon: 'rain' },
  65: { label: '강한 비', icon: 'heavy_rain' },
  71: { label: '약한 눈', icon: 'snow' },
  73: { label: '눈', icon: 'snow' },
  75: { label: '폭설', icon: 'snow' },
  80: { label: '약한 소나기', icon: 'rain' },
  81: { label: '소나기', icon: 'rain' },
  82: { label: '강한 소나기', icon: 'heavy_rain' },
  95: { label: '뇌우', icon: 'thunder' },
  96: { label: '우박 동반 뇌우', icon: 'thunder' },
  99: { label: '강한 우박 뇌우', icon: 'thunder' },
};

function getWeatherMeta(code) {
  return WMO_MAP[code] || { label: '맑음', icon: 'sunny' };
}

function getWeatherSvg(iconType, size = 32) {
  switch (iconType) {
    case 'sunny':
      return `
        <svg viewBox="0 0 64 64" width="${size}" height="${size}">
          <circle cx="32" cy="32" r="14" fill="#FBBC05"/>
          <g stroke="#FBBC05" stroke-width="4" stroke-linecap="round">
            <line x1="32" y1="6" x2="32" y2="12"/>
            <line x1="32" y1="52" x2="32" y2="58"/>
            <line x1="6" y1="32" x2="12" y2="32"/>
            <line x1="52" y1="32" x2="58" y2="32"/>
            <line x1="13.6" y1="13.6" x2="17.8" y2="17.8"/>
            <line x1="46.2" y1="46.2" x2="50.4" y2="50.4"/>
            <line x1="13.6" y1="50.4" x2="17.8" y2="46.2"/>
            <line x1="46.2" y1="17.8" x2="50.4" y2="13.6"/>
          </g>
        </svg>
      `;
    case 'partly_cloudy':
      return `
        <svg viewBox="0 0 64 64" width="${size}" height="${size}">
          <circle cx="24" cy="24" r="11" fill="#FBBC05"/>
          <path d="M46 48H20a10 10 0 0 1-1.5-19.89 14 14 0 0 1 27.2-2.11A9 9 0 0 1 46 48z" fill="#90CAF9"/>
          <path d="M46 46H20a8 8 0 0 1-1.2-15.91 12 12 0 0 1 23.3-1.69A7 7 0 0 1 46 46z" fill="#E1F5FE"/>
        </svg>
      `;
    case 'cloudy':
      return `
        <svg viewBox="0 0 64 64" width="${size}" height="${size}">
          <path d="M48 44H18a12 12 0 0 1-2.4-23.76 16 16 0 0 1 31.2-2.24A10 10 0 0 1 48 44z" fill="#B0BEC5"/>
          <path d="M48 42H20a10 10 0 0 1-2-19.8 14 14 0 0 1 27.3-1.8A8 8 0 0 1 48 42z" fill="#CFD8DC"/>
        </svg>
      `;
    case 'rain':
    case 'drizzle':
      return `
        <svg viewBox="0 0 64 64" width="${size}" height="${size}">
          <path d="M46 36H20a10 10 0 0 1-1.5-19.89 14 14 0 0 1 27.2-2.11A9 9 0 0 1 46 36z" fill="#78909C"/>
          <g stroke="#4285F4" stroke-width="3" stroke-linecap="round">
            <line x1="22" y1="44" x2="18" y2="52"/>
            <line x1="32" y1="44" x2="28" y2="52"/>
            <line x1="42" y1="44" x2="38" y2="52"/>
          </g>
        </svg>
      `;
    case 'heavy_rain':
      return `
        <svg viewBox="0 0 64 64" width="${size}" height="${size}">
          <path d="M46 34H18a10 10 0 0 1-1.5-19.89 14 14 0 0 1 27.2-2.11A9 9 0 0 1 46 34z" fill="#546E7A"/>
          <g stroke="#1976D2" stroke-width="3.5" stroke-linecap="round">
            <line x1="20" y1="42" x2="15" y2="54"/>
            <line x1="30" y1="42" x2="25" y2="54"/>
            <line x1="40" y1="42" x2="35" y2="54"/>
            <line x1="50" y1="42" x2="45" y2="54"/>
          </g>
        </svg>
      `;
    case 'snow':
      return `
        <svg viewBox="0 0 64 64" width="${size}" height="${size}">
          <path d="M46 36H20a10 10 0 0 1-1.5-19.89 14 14 0 0 1 27.2-2.11A9 9 0 0 1 46 36z" fill="#90A4AE"/>
          <g fill="#81D4FA">
            <circle cx="22" cy="46" r="2.5"/>
            <circle cx="32" cy="50" r="2.5"/>
            <circle cx="42" cy="46" r="2.5"/>
          </g>
        </svg>
      `;
    case 'thunder':
      return `
        <svg viewBox="0 0 64 64" width="${size}" height="${size}">
          <path d="M46 32H20a10 10 0 0 1-1.5-19.89 14 14 0 0 1 27.2-2.11A9 9 0 0 1 46 32z" fill="#455A64"/>
          <polygon points="34,34 24,46 32,46 28,58 42,42 34,42" fill="#FBBC05"/>
        </svg>
      `;
    case 'fog':
    default:
      return `
        <svg viewBox="0 0 64 64" width="${size}" height="${size}">
          <path d="M46 30H18a10 10 0 0 1-1.5-19.89 14 14 0 0 1 27.2-2.11A9 9 0 0 1 46 30z" fill="#B0BEC5"/>
          <line x1="16" y1="40" x2="48" y2="40" stroke="#90A4AE" stroke-width="3" stroke-linecap="round"/>
          <line x1="20" y1="46" x2="44" y2="46" stroke="#90A4AE" stroke-width="3" stroke-linecap="round"/>
        </svg>
      `;
  }
}

async function initWeather() {
  const refreshWeatherBtn = document.getElementById('refreshWeatherBtn');
  
  if (refreshWeatherBtn) {
    refreshWeatherBtn.addEventListener('click', () => {
      refreshWeatherBtn.style.transform = 'rotate(360deg)';
      refreshWeatherBtn.style.transition = 'transform 0.6s ease';
      setTimeout(() => {
        refreshWeatherBtn.style.transform = '';
        refreshWeatherBtn.style.transition = '';
      }, 600);
      fetchWeatherData();
    });
  }

  fetchWeatherData();
}

async function fetchWeatherData() {
  const currentTempEl = document.getElementById('currentTemp');
  const weatherDescEl = document.getElementById('weatherDesc');
  const apparentTempEl = document.getElementById('apparentTemp');
  const humidityValEl = document.getElementById('humidityVal');
  const windValEl = document.getElementById('windVal');
  const minMaxTempEl = document.getElementById('minMaxTemp');
  const currentWeatherIconEl = document.getElementById('currentWeatherIcon');
  const hourlySliderEl = document.getElementById('hourlySlider');

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${POHANG_COORDS.latitude}&longitude=${POHANG_COORDS.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul&forecast_days=2`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('날씨 API 응답 오류');
    const data = await res.json();

    // 1. Current Weather
    const cur = data.current;
    const curTemp = Math.round(cur.temperature_2m);
    const curApparent = Math.round(cur.apparent_temperature);
    const curHumidity = cur.relative_humidity_2m;
    const curWind = (cur.wind_speed_10m * (1000 / 3600)).toFixed(1); // convert km/h to m/s
    const weatherMeta = getWeatherMeta(cur.weather_code);

    currentTempEl.textContent = `${curTemp}°`;
    weatherDescEl.textContent = weatherMeta.label;
    apparentTempEl.textContent = `${curApparent}°`;
    humidityValEl.textContent = `${curHumidity}%`;
    windValEl.textContent = `${curWind} m/s`;
    currentWeatherIconEl.innerHTML = getWeatherSvg(weatherMeta.icon, 56);

    // Daily min/max for today
    if (data.daily && data.daily.temperature_2m_max && data.daily.temperature_2m_min) {
      const maxT = Math.round(data.daily.temperature_2m_max[0]);
      const minT = Math.round(data.daily.temperature_2m_min[0]);
      minMaxTempEl.textContent = `${maxT}° / ${minT}°`;
    }

    // 2. Hourly Forecast (Next 24 hours starting from current hour)
    const hourly = data.hourly;
    const now = new Date();
    const currentHourIndex = hourly.time.findIndex(timeStr => {
      const t = new Date(timeStr);
      return t.getDate() === now.getDate() && t.getHours() === now.getHours();
    });

    const startIndex = currentHourIndex >= 0 ? currentHourIndex : 0;
    const next24Hours = hourly.time.slice(startIndex, startIndex + 24);

    hourlySliderEl.innerHTML = '';

    next24Hours.forEach((timeStr, idx) => {
      const actualIdx = startIndex + idx;
      const forecastTime = new Date(timeStr);
      const hourNumber = forecastTime.getHours();
      const isNow = idx === 0;

      const timeLabel = isNow ? '지금' : `${hourNumber}시`;
      const temp = Math.round(hourly.temperature_2m[actualIdx]);
      const rainProb = hourly.precipitation_probability ? hourly.precipitation_probability[actualIdx] : 0;
      const code = hourly.weather_code[actualIdx];
      const hMeta = getWeatherMeta(code);

      const card = document.createElement('div');
      card.className = `hourly-card ${isNow ? 'active-hour' : ''}`;
      card.innerHTML = `
        <span class="hourly-card-time">${timeLabel}</span>
        <div class="hourly-card-icon">
          ${getWeatherSvg(hMeta.icon, 30)}
        </div>
        <span class="hourly-card-temp">${temp}°</span>
        <div class="hourly-card-rain" title="강수확률 ${rainProb}%">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
          </svg>
          <span>${rainProb}%</span>
        </div>
      `;

      hourlySliderEl.appendChild(card);
    });

  } catch (err) {
    console.error('날씨 데이터 로드 실패:', err);
    weatherDescEl.textContent = '날씨 로드 중 오류 발생';
    // Fallback UI
    useFallbackWeatherData();
  }
}

function useFallbackWeatherData() {
  const currentTempEl = document.getElementById('currentTemp');
  const weatherDescEl = document.getElementById('weatherDesc');
  const apparentTempEl = document.getElementById('apparentTemp');
  const humidityValEl = document.getElementById('humidityVal');
  const windValEl = document.getElementById('windVal');
  const minMaxTempEl = document.getElementById('minMaxTemp');
  const currentWeatherIconEl = document.getElementById('currentWeatherIcon');
  const hourlySliderEl = document.getElementById('hourlySlider');

  currentTempEl.textContent = '21°';
  weatherDescEl.textContent = '대체로 맑음 (포항)';
  apparentTempEl.textContent = '22°';
  humidityValEl.textContent = '58%';
  windValEl.textContent = '2.4 m/s';
  minMaxTempEl.textContent = '25° / 18°';
  currentWeatherIconEl.innerHTML = getWeatherSvg('partly_cloudy', 56);

  hourlySliderEl.innerHTML = '';
  const nowHour = new Date().getHours();
  for (let i = 0; i < 12; i++) {
    const h = (nowHour + i) % 24;
    const isNow = i === 0;
    const card = document.createElement('div');
    card.className = `hourly-card ${isNow ? 'active-hour' : ''}`;
    card.innerHTML = `
      <span class="hourly-card-time">${isNow ? '지금' : `${h}시`}</span>
      <div class="hourly-card-icon">
        ${getWeatherSvg(i % 3 === 0 ? 'sunny' : 'partly_cloudy', 30)}
      </div>
      <span class="hourly-card-temp">${21 - Math.floor(i / 3)}°</span>
      <div class="hourly-card-rain">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
        </svg>
        <span>10%</span>
      </div>
    `;
    hourlySliderEl.appendChild(card);
  }
}

/* =========================================
   5. Daily & Random Inspirational Quotes
   ========================================= */
const QUOTES = [
  {
    text: "오늘 할 수 있는 일에 온 힘을 다하라. 그러면 내일은 한 걸음 더 나아갈 수 있다.",
    author: "아이작 뉴턴 (Isaac Newton)",
    category: "성장과 전진"
  },
  {
    text: "인생은 용기의 양에 따라 줄어들거나 늘어난다.",
    author: "아나이스 닌 (Anaïs Nin)",
    category: "도전과 용기"
  },
  {
    text: "단순함이 궁극의 정교함이다.",
    author: "레오나르도 다빈치 (Leonardo da Vinci)",
    category: "통찰과 지혜"
  },
  {
    text: "우리가 두려워해야 할 유일한 것은 두려움 그 자체다.",
    author: "프랭클린 D. 루스벨트 (Franklin D. Roosevelt)",
    category: "극복과 의지"
  },
  {
    text: "천 리 길도 한 걸음부터 시작된다.",
    author: "노자 (Laozi)",
    category: "시작과 꾸준함"
  },
  {
    text: "가장 어두운 밤도 언젠가는 끝나고, 태양은 다시 떠오른다.",
    author: "빅토르 위고 (Victor Hugo)",
    category: "희망과 긍정"
  },
  {
    text: "행동은 모든 성공의 가장 기본적인 열쇠이다.",
    author: "파블로 피카소 (Pablo Picasso)",
    category: "실행력"
  },
  {
    text: "위대한 일을 해내는 유일한 방법은 당신이 하는 일을 사랑하는 것이다.",
    author: "스티브 잡스 (Steve Jobs)",
    category: "열정과 몰입"
  },
  {
    text: "어제와 똑같이 살면서 다른 미래를 기대하는 것은 정신병 초기증세다.",
    author: "알베르트 아인슈타인 (Albert Einstein)",
    category: "변화와 혁신"
  },
  {
    text: "꿈을 이루고자 하는 용기만 있다면 모든 꿈은 이루어질 수 있다.",
    author: "월트 디즈니 (Walt Disney)",
    category: "꿈과 도전"
  },
  {
    text: "작은 기회들로부터 종종 위대한 업적이 시작된다.",
    author: "데모스테네스 (Demosthenes)",
    category: "기회와 발견"
  },
  {
    text: "바람이 불지 않을 때 바람개비를 돌리는 방법은 앞으로 달려가는 것이다.",
    author: "데일 카네기 (Dale Carnegie)",
    category: "적극성과 실천"
  },
  {
    text: "지혜는 듣는 데서 오고, 후회는 말하는 데서 온다.",
    author: "영국 격언",
    category: "지혜와 겸손"
  },
  {
    text: "네 믿음은 네 생각이 되고, 네 생각은 네 말이 되며, 네 말은 네 행동이 된다.",
    author: "마하트마 간디 (Mahatma Gandhi)",
    category: "마음가짐"
  },
  {
    text: "성공이란 열정을 잃지 않고 실패를 거듭할 수 있는 능력이다.",
    author: "윈스턴 처칠 (Winston Churchill)",
    category: "회복탄력성"
  }
];

let currentQuoteIndex = 0;

function initQuotes() {
  const quoteTextEl = document.getElementById('quoteText');
  const quoteAuthorEl = document.getElementById('quoteAuthor');
  const quoteCategoryEl = document.getElementById('quoteCategory');
  const newQuoteBtn = document.getElementById('newQuoteBtn');
  const copyQuoteBtn = document.getElementById('copyQuoteBtn');
  const quoteBody = document.querySelector('.quote-body');

  // Select quote based on day of year by default
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  currentQuoteIndex = dayOfYear % QUOTES.length;
  renderQuote(currentQuoteIndex);

  function renderQuote(index) {
    const q = QUOTES[index];
    if (quoteBody) quoteBody.style.opacity = '0';
    
    setTimeout(() => {
      if (quoteTextEl) quoteTextEl.textContent = `"${q.text}"`;
      if (quoteAuthorEl) quoteAuthorEl.textContent = `— ${q.author}`;
      if (quoteCategoryEl) quoteCategoryEl.textContent = q.category;
      if (quoteBody) quoteBody.style.opacity = '1';
    }, 180);
  }

  // Next Random Quote
  if (newQuoteBtn) {
    newQuoteBtn.addEventListener('click', () => {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * QUOTES.length);
      } while (nextIndex === currentQuoteIndex && QUOTES.length > 1);
      
      currentQuoteIndex = nextIndex;
      renderQuote(currentQuoteIndex);
    });
  }

  // Copy Quote to Clipboard
  if (copyQuoteBtn) {
    copyQuoteBtn.addEventListener('click', async () => {
      const q = QUOTES[currentQuoteIndex];
      const copyContent = `"${q.text}" - ${q.author}`;

      try {
        await navigator.clipboard.writeText(copyContent);
        showToast('명언이 클립보드에 복사되었습니다.');
      } catch (err) {
        // Fallback copy
        const ta = document.createElement('textarea');
        ta.value = copyContent;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('명언이 클립보드에 복사되었습니다.');
      }
    });
  }
}

/* =========================================
   6. Precipitation Radar Toggle
   ========================================= */
function initRadar() {
  const toggleBtn = document.getElementById('radarToggleBtn');
  const radarContainer = document.getElementById('radarContainer');
  const toggleText = document.getElementById('radarToggleText');

  if (toggleBtn && radarContainer) {
    toggleBtn.addEventListener('click', () => {
      const isCollapsed = radarContainer.classList.toggle('collapsed');
      toggleBtn.classList.toggle('collapsed', isCollapsed);
      if (toggleText) {
        toggleText.textContent = isCollapsed ? '펼치기' : '접기';
      }
    });
  }
}

/* =========================================
   7. Toast Utility
   ========================================= */
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}
