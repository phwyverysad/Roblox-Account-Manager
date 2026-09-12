
window.scriptsModule = (() => {
  let currentPage = 1;
  let nextPageNumber = 2;
  let totalPages = 1;
  let currentQuery = '';
  let isFetching = false;
  let hasNextPage = true;
  const seenScriptIds = new Set();
  let scrollListenerAttached = false;
  let intersectionObserver = null;

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function _t(key, ...args) {
    if (typeof window !== 'undefined' && window.t) {
      return window.t(key, ...args);
    }
    return key;
  }

  function timeSince(dateString) {
    if (typeof window !== 'undefined' && window.i18n && typeof window.i18n.formatTimeAgo === 'function') {
      return window.i18n.formatTimeAgo(dateString);
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "recently";
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
  }

  async function copyScript(btn, slug) {
    if (btn.disabled) return;
    
    const originalHTML = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = '<div class="spin" style="width:14px;height:14px;border-width:2px;display:inline-block;margin-right:6px;"></div>' + _t('กำลังดึงโค้ด...');
    btn.classList.add('loading');

    try {
      const data = await window.api.fetchPublicJson(`https://scriptblox.com/api/script/${encodeURIComponent(slug)}`);
      const code = data?.script?.script || data?.result?.script?.script || (typeof data?.script === 'string' ? data.script : null);
      if (!code) throw new Error(_t('ไม่พบเนื้อหาโค้ดสคริปต์'));

      let copied = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(code);
          copied = true;
        } catch {}
      }
      if (!copied) {
        const ta = document.createElement('textarea');
        ta.value = code;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }

      btn.classList.remove('loading');
      btn.classList.add('success');
      btn.innerHTML = '<span class="material-icons-round" style="font-size:16px;">check</span> ' + _t('คัดลอกสำเร็จ!');
      
      if (window.toast) {
        window.toast(_t('คัดลอกสคริปต์สำเร็จ!'), 'ok');
      }
      
    } catch (err) {
      console.error('Copy Error:', err);
      btn.classList.remove('loading');
      btn.classList.add('error');
      btn.innerHTML = '<span class="material-icons-round" style="font-size:16px;">close</span> ' + _t('ผิดพลาด');
    }

    setTimeout(() => {
      btn.disabled = false;
      btn.classList.remove('loading', 'success', 'error');
      btn.innerHTML = originalHTML;
    }, 2500);
  }

  function checkAutoLoadMore() {
    const scroller = document.getElementById('scripts-scroller');
    if (!scroller) return;
    if (scroller.scrollHeight <= scroller.clientHeight + 250 && hasNextPage && !isFetching) {
      loadNextPage();
    }
  }

  function loadNextPage() {
    if (isFetching || !hasNextPage) return;
    fetchScripts(nextPageNumber, true);
  }

  async function fetchScripts(page = 1, append = false) {
    if (isFetching || (append && !hasNextPage)) return;
    isFetching = true;

    const resultsContainer = document.getElementById('scripts-results');
    const statusContainer = document.getElementById('scripts-status-container');
    const statusMessage = document.getElementById('scripts-status-message');
    const spinner = document.getElementById('scripts-loading-spinner');
    const bottomLoader = document.getElementById('scripts-bottom-loader');
    const bottomText = document.getElementById('scripts-bottom-text');

    if (!resultsContainer) {
      isFetching = false;
      return;
    }

    if (!append) {
      resultsContainer.innerHTML = '';
      seenScriptIds.clear();
      currentPage = page;
      nextPageNumber = page + 1;
      totalPages = 1;
      hasNextPage = true;
      if (statusContainer) statusContainer.style.display = 'block';
      if (spinner) spinner.style.display = 'inline-block';
      if (statusMessage) statusMessage.textContent = _t('กำลังค้นหาและดึงข้อมูลสคริปต์...');
      if (bottomLoader) bottomLoader.style.display = 'none';
    } else {
      if (bottomLoader) {
        bottomLoader.style.display = 'block';
        const bottomSpin = bottomLoader.querySelector('.spin');
        if (bottomSpin) bottomSpin.style.display = 'inline-block';
        if (bottomText) bottomText.innerHTML = _t('กำลังโหลดสคริปต์หน้าถัดไป...');
      }
    }

    const trimmedQuery = currentQuery.trim();
    let data = null;
    let isSearchFallback = false;

    try {
      if (trimmedQuery === '') {
        // Primary: fetch
        try {
          const fetchUrl = `https://scriptblox.com/api/script/fetch?page=${page}`;
          data = await window.api.fetchPublicJson(fetchUrl);
        } catch {
          data = null;
        }

        // If fetch returns maintenance, null, or no scripts, fallback to trending
        if (!data || !data.result || !Array.isArray(data.result.scripts) || data.result.scripts.length === 0) {
          try {
            const trendingUrl = page > 1 ? `https://scriptblox.com/api/script/trending?page=${page}` : 'https://scriptblox.com/api/script/trending';
            const trendingData = await window.api.fetchPublicJson(trendingUrl);
            if (trendingData && trendingData.result && Array.isArray(trendingData.result.scripts) && trendingData.result.scripts.length > 0) {
              data = trendingData;
            }
          } catch {}
        }
      } else {
        // Query search
        try {
          const searchUrl = `https://scriptblox.com/api/script/search?q=${encodeURIComponent(trimmedQuery)}&page=${page}`;
          data = await window.api.fetchPublicJson(searchUrl);
        } catch {
          data = null;
        }

        // If search fails or returns maintenance error, fallback to trending with client-side filter
        if (!data || !data.result || !Array.isArray(data.result.scripts)) {
          try {
            const trendingData = await window.api.fetchPublicJson('https://scriptblox.com/api/script/trending');
            if (trendingData && trendingData.result && Array.isArray(trendingData.result.scripts)) {
              const q = trimmedQuery.toLowerCase();
              const filtered = trendingData.result.scripts.filter(s => {
                const titleMatch = s.title && s.title.toLowerCase().includes(q);
                const gameMatch = s.game && s.game.name && s.game.name.toLowerCase().includes(q);
                const slugMatch = s.slug && s.slug.toLowerCase().includes(q);
                const tagMatch = Array.isArray(s.tags) && s.tags.some(t => typeof t === 'string' && t.toLowerCase().includes(q));
                return titleMatch || gameMatch || slugMatch || tagMatch;
              });
              data = { result: { scripts: filtered, nextPage: null } };
              isSearchFallback = true;
            }
          } catch {}
        }
      }

      if (!data || !data.result || !Array.isArray(data.result.scripts)) {
        throw new Error(_t('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ ScriptBlox ได้'));
      }

      const scripts = data.result.scripts;

      if (scripts.length === 0 && !append) {
        if (spinner) spinner.style.display = 'none';
        if (statusMessage) {
          if (trimmedQuery !== '') {
            statusMessage.innerHTML = `
              <div style="color:var(--t2);margin-bottom:10px;">${_t('ไม่พบสคริปต์ที่ตรงกับ "{0}"', escapeHtml(trimmedQuery))}</div>
              <button class="btn btn-secondary" onclick="window.scriptsModule.loadTrendingFallback()">
                <span class="material-icons-round" style="font-size:16px;vertical-align:middle;margin-right:4px;">trending_up</span>${_t('ดูสคริปต์ยอดนิยม (Trending)')}
              </button>
            `;
          } else {
            statusMessage.textContent = _t('ไม่พบสคริปต์ในขณะนี้');
          }
        }
        hasNextPage = false;
        isFetching = false;
        return;
      }

      const fallbackSvg = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'400\\' height=\\'225\\' viewBox=\\'0 0 400 225\\'%3E%3Crect width=\\'400\\' height=\\'225\\' fill=\\'%23111827\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' font-family=\\'sans-serif\\' font-size=\\'18\\' font-weight=\\'bold\\' fill=\\'%234b5563\\'%3ENo Image%3C/text%3E%3C/svg%3E";
      const onErrorAction = `this.onerror=null; this.src='${fallbackSvg}';`;

      let addedCount = 0;
      for (const script of scripts) {
        const scriptKey = script._id || script.slug || (script.title + (script.game ? script.game.name : ''));
        if (seenScriptIds.has(scriptKey)) continue;
        seenScriptIds.add(scriptKey);

        let imgSrc = script.image;
        if (!imgSrc && script.game && script.game.imageUrl) {
          imgSrc = script.game.imageUrl;
        }

        if (imgSrc) {
          if (imgSrc.startsWith('//')) {
            imgSrc = 'https:' + imgSrc;
          } else if (imgSrc.startsWith('/')) {
            imgSrc = 'https://scriptblox.com' + imgSrc;
          }
        }

        if (!imgSrc || imgSrc.includes('no-script.webp')) {
          imgSrc = `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225' viewBox='0 0 400 225'%3E%3Crect width='400' height='225' fill='%23111827'/%3E%3Ctext x='50%25\\' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' font-weight='bold' fill='%234b5563'%3ENo Image%3C/text%3E%3C/svg%3E`;
        }

        let viewsFormat = script.views > 999 ? (script.views/1000).toFixed(1) + 'k' : (script.views || 0);
        let gameName = script.game ? script.game.name : "Unknown Game";
        let scriptTitle = script.title || "Untitled Script";
        let scriptSlug = script.slug || script._id || "";
        let safeSlug = String(scriptSlug).replace(/'/g, "\\'");

        const card = document.createElement('div');
        card.classList.add('script-card');

        card.innerHTML = `
          <div class="sc-img-wrap">
            <img src="${escapeHtml(imgSrc)}" loading="lazy" onerror="${onErrorAction}">
            <div class="sc-badge sc-views"><span class="material-icons-round">visibility</span> ${viewsFormat}</div>
            <div class="sc-badge sc-time">${timeSince(script.createdAt)}</div>
          </div>
          <div class="sc-content">
            <div class="sc-game"><span class="material-icons-round" style="font-size:14px;vertical-align:middle;margin-right:3px;">sports_esports</span>${escapeHtml(gameName)}</div>
            <div class="sc-title" title="${escapeHtml(scriptTitle)}">${escapeHtml(scriptTitle)}</div>
            
            <button class="btn sc-copy-btn" onclick="window.scriptsModule.copyScript(this, '${safeSlug}')">
              <span class="material-icons-round" style="font-size:16px;">content_copy</span> ${_t('คัดลอกสคริปต์')}
            </button>
          </div>
        `;
        resultsContainer.appendChild(card);
        addedCount++;
      }

      // Successful page load state tracking
      currentPage = page;
      if (data.result.totalPages) {
        totalPages = data.result.totalPages;
      }

      if (isSearchFallback) {
        hasNextPage = false;
        if (bottomLoader) bottomLoader.style.display = 'none';
        if (statusContainer) {
          statusContainer.style.display = 'block';
          if (spinner) spinner.style.display = 'none';
          if (statusMessage) {
            statusMessage.innerHTML = `<span class="material-icons-round" style="font-size:15px;vertical-align:middle;color:var(--w);margin-right:4px;">info</span>` + _t('ระบบค้นหาของ ScriptBlox กำลังปรับปรุง ได้แสดงผลลัพธ์ที่ตรงกันจากสคริปต์ยอดนิยม');
          }
        }
      } else if (typeof data.result.nextPage === 'number') {
        nextPageNumber = data.result.nextPage;
        hasNextPage = true;
        if (statusContainer) statusContainer.style.display = 'none';
        if (bottomLoader) bottomLoader.style.display = 'none';
      } else if (totalPages > 1 && page < totalPages) {
        nextPageNumber = page + 1;
        hasNextPage = true;
        if (statusContainer) statusContainer.style.display = 'none';
        if (bottomLoader) bottomLoader.style.display = 'none';
      } else if (scripts.length >= 10 && !isSearchFallback) {
        nextPageNumber = page + 1;
        hasNextPage = true;
        if (statusContainer) statusContainer.style.display = 'none';
        if (bottomLoader) bottomLoader.style.display = 'none';
      } else {
        hasNextPage = false;
        if (statusContainer) statusContainer.style.display = 'none';
        if (bottomLoader) {
          bottomLoader.style.display = 'block';
          const bottomSpin = bottomLoader.querySelector('.spin');
          if (bottomSpin) bottomSpin.style.display = 'none';
          if (bottomText) bottomText.innerHTML = '<span style="color:var(--t3);font-size:12px;">' + _t('โหลดสคริปต์ครบทั้งหมดแล้ว') + '</span>';
        }
      }

      isFetching = false;

      // If screen is tall and content does not overflow yet, auto-load next page
      setTimeout(checkAutoLoadMore, 120);

    } catch (error) {
      isFetching = false;
      if (!append) {
        if (spinner) spinner.style.display = 'none';
        if (statusContainer) statusContainer.style.display = 'block';
        if (statusMessage) {
          statusMessage.innerHTML = `
            <div style="color:var(--e);margin-bottom:8px;">${_t('โหลดล้มเหลว:')} ${escapeHtml(error.message || _t('ไม่สามารถเชื่อมต่อได้'))}</div>
            <button class="btn btn-secondary" onclick="window.scriptsModule.fetchScripts(1, false)">
              <span class="material-icons-round" style="font-size:15px;vertical-align:middle;margin-right:4px;">refresh</span>${_t('ลองใหม่อีกครั้ง')}
            </button>
          `;
        }
      } else {
        // If append failed, preserve cards and show retry button at the bottom
        if (bottomLoader) {
          bottomLoader.style.display = 'block';
          const bottomSpin = bottomLoader.querySelector('.spin');
          if (bottomSpin) bottomSpin.style.display = 'none';
          if (bottomText) {
            bottomText.innerHTML = `
              <div style="color:var(--t2);font-size:12px;margin-bottom:6px;">${_t('การโหลดสคริปต์หน้าถัดไปขัดข้องชั่วคราว')}</div>
              <button class="btn btn-secondary btn-sm" onclick="window.scriptsModule.loadNextPage()" style="padding:4px 12px;font-size:12px;">
                <span class="material-icons-round" style="font-size:14px;vertical-align:middle;margin-right:4px;">refresh</span>${_t('ลองโหลดต่อ')}
              </button>
            `;
          }
        }
      }
    }
  }

  function handleSearch() {
    const searchInput = document.getElementById('script-search-input');
    if (!searchInput) return;
    currentQuery = searchInput.value;
    currentPage = 1;
    nextPageNumber = 2;
    hasNextPage = true;
    fetchScripts(currentPage, false);
  }

  function loadTrendingFallback() {
    const searchInput = document.getElementById('script-search-input');
    if (searchInput) searchInput.value = '';
    currentQuery = '';
    currentPage = 1;
    nextPageNumber = 2;
    hasNextPage = true;
    fetchScripts(1, false);
  }

  function onShow() {
    const resultsContainer = document.getElementById('scripts-results');
    setupScrollEvents();
    if (resultsContainer && resultsContainer.children.length === 0 && !isFetching) {
      fetchScripts(1, false);
    } else {
      setTimeout(checkAutoLoadMore, 150);
    }
  }

  function setupScrollEvents() {
    const scroller = document.getElementById('scripts-scroller');
    const scrollTrigger = document.getElementById('scripts-scroll-trigger');

    if (scroller && !scrollListenerAttached) {
      let scrollScheduled = false;
      scroller.addEventListener('scroll', () => {
        if (!scrollScheduled) {
          scrollScheduled = true;
          requestAnimationFrame(() => {
            scrollScheduled = false;
            if (isFetching || !hasNextPage) return;
            const threshold = 600;
            if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - threshold) {
              loadNextPage();
            }
          });
        }
      }, { passive: true });
      scrollListenerAttached = true;
    }

    if (scrollTrigger && scroller && !intersectionObserver) {
      intersectionObserver = new IntersectionObserver((entries) => {
        const trigger = entries[0];
        if (trigger && trigger.isIntersecting && !isFetching && hasNextPage) {
          loadNextPage();
        }
      }, {
        root: scroller,
        rootMargin: "600px"
      });
      intersectionObserver.observe(scrollTrigger);
    }
  }

  function init() {
    const searchInput = document.getElementById('script-search-input');
    if (searchInput) {
      searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') handleSearch();
      });
    }

    setupScrollEvents();
  }

  // Auto-init on script load
  document.addEventListener("DOMContentLoaded", () => {
    init();
    fetchScripts(1, false);
  });
  
  return {
    handleSearch,
    copyScript,
    init,
    fetchScripts,
    loadNextPage,
    loadTrendingFallback,
    onShow
  };
})();
