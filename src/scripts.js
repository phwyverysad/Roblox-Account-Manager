
window.scriptsModule = (() => {
  let currentPage = 1;
  let currentQuery = '';
  let isFetching = false;
  let hasNextPage = true;

  function timeSince(dateString) {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " ปีที่แล้ว";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " เดือนที่แล้ว";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " วันที่แล้ว";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " ชั่วโมงที่แล้ว";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " นาทีที่แล้ว";
    return "เมื่อกี้";
  }

  async function copyScript(btn, slug) {
    if (btn.disabled) return;
    
    const originalHTML = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = '<div class="spin" style="width:14px;height:14px;border-width:2px;display:inline-block;margin-right:6px;"></div>กำลังดึงโค้ด...';
    btn.classList.add('loading');

    try {
      const data = await window.api.fetchPublicJson(`https://scriptblox.com/api/script/${slug}`);
      const code = data.script.script;

      await navigator.clipboard.writeText(code);

      btn.classList.remove('loading');
      btn.classList.add('success');
      btn.innerHTML = '<span class="material-icons-round" style="font-size:16px;">check</span> คัดลอกสำเร็จ!';
      
      if (window.toast) {
        window.toast('คัดลอกสคริปต์สำเร็จ!', 'ok');
      }
      
    } catch (err) {
      console.error('Copy Error:', err);
      btn.classList.remove('loading');
      btn.classList.add('error');
      btn.innerHTML = '<span class="material-icons-round" style="font-size:16px;">close</span> ผิดพลาด';
    }

    setTimeout(() => {
      btn.disabled = false;
      btn.classList.remove('loading', 'success', 'error');
      btn.innerHTML = originalHTML;
    }, 2500);
  }

  function fetchScripts(page = 1, append = false) {
    if (isFetching || !hasNextPage) return;
    isFetching = true;

    const resultsContainer = document.getElementById('scripts-results');
    const statusContainer = document.getElementById('scripts-status-container');
    const statusMessage = document.getElementById('scripts-status-message');
    const spinner = document.getElementById('scripts-loading-spinner');

    if (!resultsContainer) return;

    if (!append) {
      resultsContainer.innerHTML = '';
    }
    
    statusContainer.style.display = 'block';
    spinner.style.display = 'inline-block';
    statusMessage.textContent = append ? 'กำลังโหลดหน้าถัดไป...' : 'กำลังค้นหาข้อมูล...';

    let url = `https://scriptblox.com/api/script/fetch?page=${page}`;
    if (currentQuery.trim() !== '') {
      url = `https://scriptblox.com/api/script/search?q=${encodeURIComponent(currentQuery)}&page=${page}`;
    }

    window.api.fetchPublicJson(url)
      .then((data) => {
        if (!data || !data.result) throw new Error("API ไม่ตอบสนอง");
        const scripts = data.result.scripts;

        if (!scripts || scripts.length === 0) {
          if (!append) {
            spinner.style.display = 'none';
            statusMessage.textContent = 'ไม่พบสคริปต์ที่คุณค้นหา';
          } else {
            statusContainer.style.display = 'none';
          }
          hasNextPage = false;
          isFetching = false;
          return;
        }

        let addedCount = 0;
        for (const script of scripts) {
          
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
            imgSrc = `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225' viewBox='0 0 400 225'%3E%3Crect width='400' height='225' fill='%23111827'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' font-weight='bold' fill='%234b5563'%3ENo Image%3C/text%3E%3C/svg%3E`;
          }


          let viewsFormat = script.views > 999 ? (script.views/1000).toFixed(1) + 'k' : script.views;
          let gameName = script.game ? script.game.name : "Unknown Game";

          const card = document.createElement('div');
          card.classList.add('script-card');

          let isHomeFeed = (currentQuery.trim() === '');
          let onErrorAction = isHomeFeed 
            ? "this.closest('.script-card').style.display='none';" 
            : "this.onerror=null; this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'400\\' height=\\'225\\' viewBox=\\'0 0 400 225\\'%3E%3Crect width=\\'400\\' height=\\'225\\' fill=\\'%23111827\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' font-family=\\'sans-serif\\' font-size=\\'18\\' font-weight=\\'bold\\' fill=\\'%234b5563\\'%3ENo Image%3C/text%3E%3C/svg%3E';";

          card.innerHTML = `
            <div class="sc-img-wrap">
              <img src="${imgSrc}" loading="lazy" onerror="${onErrorAction}">
              <div class="sc-badge sc-views"><span class="material-icons-round">visibility</span> ${viewsFormat}</div>
              <div class="sc-badge sc-time">${timeSince(script.createdAt)}</div>
            </div>
            <div class="sc-content">
              <div class="sc-game">🎮 ${gameName}</div>
              <div class="sc-title" title="${script.title}">${script.title}</div>
              
              <button class="btn sc-copy-btn" onclick="window.scriptsModule.copyScript(this, '${script.slug}')">
                <span class="material-icons-round" style="font-size:16px;">content_copy</span> คัดลอกสคริปต์
              </button>
            </div>
          `;
          resultsContainer.appendChild(card);
          addedCount++;
        }

        if (currentQuery.trim() === '' && addedCount < 5 && data.result.nextPage) {
          isFetching = false;
          currentPage++;
          fetchScripts(currentPage, true);
          return;
        }

        if (data.result.nextPage) {
          hasNextPage = true;
          statusContainer.style.display = 'none';
        } else {
          hasNextPage = false;
          spinner.style.display = 'none';
          statusMessage.textContent = 'โหลดข้อมูลครบทั้งหมดแล้ว';
        }

        isFetching = false;
      })
      .catch((error) => {
        spinner.style.display = 'none';
        statusMessage.innerHTML = `<span style="color:var(--e);">โหลดล้มเหลว: ${error.message}</span>`;
        isFetching = false;
      });
  }

  function handleSearch() {
    const searchInput = document.getElementById('script-search-input');
    if (!searchInput) return;
    currentQuery = searchInput.value;
    currentPage = 1;
    hasNextPage = true;
    fetchScripts(currentPage, false);
  }

  function init() {
    const searchInput = document.getElementById('script-search-input');
    if (searchInput) {
      searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') handleSearch();
      });
    }

    const scrollTrigger = document.getElementById('scripts-scroll-trigger');
    const resultsContainer = document.getElementById('scripts-results');
    
    if (scrollTrigger && resultsContainer) {
      const scrollObserver = new IntersectionObserver((entries) => {
        const trigger = entries[0];
        if (trigger.isIntersecting && !isFetching && hasNextPage) {
          currentPage++;
          fetchScripts(currentPage, true);
        }
      }, {
        root: document.getElementById('scripts-scroller'),
        rootMargin: "200px"
      });
      scrollObserver.observe(scrollTrigger);
    }
  }

  // Auto-init on script load
  document.addEventListener("DOMContentLoaded", () => {
    init();
    // Initially do not fetch until the tab is clicked to save resources? 
    // Or fetch immediately. Let's fetch immediately so it's ready.
    fetchScripts(1, false);
  });
  
  // Also expose init in case it's needed
  return {
    handleSearch,
    copyScript,
    init,
    fetchScripts
  };
})();
