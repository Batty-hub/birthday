(() => {
  "use strict";

  const track = document.getElementById("pageTrack");
  const loadingBar = document.getElementById("loadingBar");
  const loadingNumber = document.getElementById("loadingNumber");
  const wishIntro = document.getElementById("wishIntro");
  const wishStatus = document.getElementById("wishStatus");
  const wishResult = document.getElementById("wishResult");
  const successLabel = wishResult.querySelector(".success-label");
  const wishQuote = wishResult.querySelector(".wish-quote");
  const installing = document.getElementById("installing");
  const brainWrap = document.getElementById("brainWrap");
  const installSuccess = document.getElementById("installSuccess");
  const successLines = [...installSuccess.querySelectorAll(".success-line")];
  const statsPanel = document.getElementById("statsPanel");
  const statRows = [...statsPanel.querySelectorAll(".stat-row")];
  const certificate = document.getElementById("certificate");

  let currentPage = 0;
  let isAnimatingPage = false;
  let wishHasPlayed = false;
  let touchStartY = 0;
  let touchStartX = 0;

  // 纵向分页切换，避免移动端页面出现横向滚动。
  function goToPage(pageIndex) {
    const nextPage = Math.max(0, Math.min(1, pageIndex));
    if (nextPage === currentPage || isAnimatingPage) return;

    currentPage = nextPage;
    isAnimatingPage = true;
    track.style.transform = `translate3d(0, -${currentPage * 100}vh, 0)`;
    window.setTimeout(() => { isAnimatingPage = false; }, 930);

    if (currentPage === 1 && !wishHasPlayed) {
      wishHasPlayed = true;
      playWishAnimation();
    }
  }

  // 第二屏只在第一次进入时播放，之后返回不会重新执行。
  function playWishAnimation() {
    // 阶段1：进入后等待约1秒，再让读取提示淡入。
    window.setTimeout(() => {
      wishIntro.classList.add("is-reading");
    }, 1000);

    // 读取提示淡入并停留后，再开始缓慢进度条。
    window.setTimeout(() => {
      runReadingProgress();
    }, 2650);

    function runReadingProgress() {
      const duration = 4300;
      const startedAt = performance.now();

      function updateProgress(now) {
        const progress = Math.min(100, Math.round(((now - startedAt) / duration) * 100));
        loadingBar.style.width = `${progress}%`;
        loadingNumber.textContent = `${progress}%`;
        if (progress < 100) {
          window.requestAnimationFrame(updateProgress);
        } else {
          afterReading();
        }
      }

      window.requestAnimationFrame(updateProgress);
    }

    function afterReading() {
      // 阶段3：100% 后停顿，再显示识别成功。
      window.setTimeout(() => {
        wishIntro.style.display = "none";
        wishResult.classList.add("is-visible");
        successLabel.classList.add("is-visible");

        // 阶段4：识别成功停留后，淡入愿望原文并给足阅读时间。
        window.setTimeout(() => {
          wishQuote.style.opacity = "1";
          wishQuote.style.animation = "fadeUp .85s ease both";
        }, 1550);

        // 阶段5：愿望原文停留约3秒后开始安装。
        window.setTimeout(startInstallation, 4650);
      }, 800);
    }

    function startInstallation() {
      installing.style.opacity = "1";

      // 安装提示停留约2秒后，大脑以渐入和缩放动画出现。
      window.setTimeout(() => {
        brainWrap.classList.add("is-visible");
      }, 2000);

      // 大脑完成出现并呼吸片刻后，显示安装成功。
      window.setTimeout(() => {
        installing.style.display = "none";
        brainWrap.classList.remove("is-visible");
        installSuccess.classList.add("is-visible");
        revealSuccessLines();
      }, 4650);
    }

    function revealSuccessLines() {
      // 标题先出现，下面三行每隔约0.55秒依次淡入。
      successLines.forEach((line, index) => {
        window.setTimeout(() => {
          line.classList.add("is-visible");
        }, 550 + index * 550);
      });

      // 阶段9：属性面板逐条出现，进度条各自缓慢填满。
      window.setTimeout(() => {
        statsPanel.classList.add("is-visible");
        statRows.forEach((row, index) => {
          window.setTimeout(() => {
            row.classList.add("is-visible");
          }, index * 450);
        });
      }, 2150);

      // 阶段10：所有属性完成后，再显示最后的认证小字。
      window.setTimeout(() => {
        certificate.classList.add("is-visible");
      }, 5050);
    }
  }

  // 鼠标滚轮：一次滚轮只切换一屏。
  window.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) < 8 || isAnimatingPage) return;
    event.preventDefault();
    goToPage(currentPage + (event.deltaY > 0 ? 1 : -1));
  }, { passive: false });

  // 手指滑动：只响应明显的纵向手势。
  window.addEventListener("touchstart", (event) => {
    const touch = event.changedTouches[0];
    touchStartY = touch.clientY;
    touchStartX = touch.clientX;
  }, { passive: true });

  window.addEventListener("touchend", (event) => {
    if (isAnimatingPage) return;
    const touch = event.changedTouches[0];
    const deltaY = touchStartY - touch.clientY;
    const deltaX = touchStartX - touch.clientX;
    if (Math.abs(deltaY) > 45 && Math.abs(deltaY) > Math.abs(deltaX) * 1.2) {
      goToPage(currentPage + (deltaY > 0 ? 1 : -1));
    }
  }, { passive: true });

  // 键盘辅助：电脑端可用方向键、PageUp/PageDown 或空格预览。
  window.addEventListener("keydown", (event) => {
    if (["ArrowDown", "PageDown", " "].includes(event.key)) {
      event.preventDefault();
      goToPage(currentPage + 1);
    } else if (["ArrowUp", "PageUp"].includes(event.key)) {
      event.preventDefault();
      goToPage(currentPage - 1);
    }
  });
})();