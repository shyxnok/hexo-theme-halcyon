// 展示主题
console.log("%c Theme.Halcyon v" + '1.0.0' + " %c https://github.com/shyxnok/hexo-theme-Halcyon ", "color: white; background: rgb(12, 128, 230); padding:5px 0;", "padding:4px;border:1px solid rgb(12, 128, 230);");

/**
 * Halcyon Theme — main.js
 * Dark mode toggle, mobile menu, active nav
 */

(function () {
  'use strict';

  var THEME_KEY = 'halcyon-theme';
  var themeToggle = document.getElementById('theme-toggle');
  var html = document.documentElement;

  function getPreferredTheme() {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    var hljsLight = document.getElementById('hljs-light');
    var hljsDark = document.getElementById('hljs-dark');
    if (hljsLight && hljsDark) {
      hljsLight.disabled = theme === 'dark';
      hljsDark.disabled = theme === 'light';
    }
  }

  var currentTheme = getPreferredTheme();
  applyTheme(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      currentTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(currentTheme);
    });
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  var navToggle = document.getElementById('nav-toggle');
  var siteNav = document.getElementById('site-nav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = siteNav.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });
    siteNav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        siteNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === '/' && currentPath === '/') {
      link.classList.add('active');
    } else if (href !== '/' && currentPath.startsWith(href)) {
      link.classList.add('active');
    }
  });
})();



/**
 * 点击烟花粒子特效 - 独立抽离版
 * 依赖: anime.js
 */
const ClickFireworks = (function () {
  // 默认配置
  const defaultOptions = {
    particleNum: 30,          // 粒子数量
    colors: [                 // 粒子颜色组
      "rgba(255,182,185,.9)",
      "rgba(250,227,217,.9)",
      "rgba(187,222,214,.9)",
      "rgba(138,198,209,.9)"
    ],
    circleRadiusMin: 80,      // 外圈圆环最小半径
    circleRadiusMax: 160,     // 外圈圆环最大半径
    particleRadiusMin: 16,    // 粒子初始最小半径
    particleRadiusMax: 32,    // 粒子初始最大半径
    particleMoveMin: 50,      // 粒子移动最小距离
    particleMoveMax: 180      // 粒子移动最大距离
  };

  let canvasEl, ctx;
  let pointerX = 0;
  let pointerY = 0;
  let tapEvent = "click";
  let options = {};

  // 初始化画布
  function initCanvas() {
    canvasEl = document.createElement("canvas");
    canvasEl.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 9999999;
    `;
    document.body.appendChild(canvasEl);
    ctx = canvasEl.getContext("2d");
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize, false);
  }

  // 适配窗口大小
  function setCanvasSize() {
    canvasEl.width = window.innerWidth * 2;
    canvasEl.height = window.innerHeight * 2;
    canvasEl.style.width = window.innerWidth + "px";
    canvasEl.style.height = window.innerHeight + "px";
    ctx.scale(2, 2);
  }

  // 更新点击坐标
  function updateCoords(e) {
    pointerX = e.clientX || (e.touches && e.touches[0].clientX);
    pointerY = e.clientY || (e.touches && e.touches[0].clientY);
  }

  // 设置粒子运动方向
  function setParticuleDirection(p) {
    const angle = anime.random(0, 360) * Math.PI / 180;
    const value = anime.random(options.particleMoveMin, options.particleMoveMax);
    const radius = [-1, 1][anime.random(0, 1)] * value;
    return {
      x: p.x + radius * Math.cos(angle),
      y: p.y + radius * Math.sin(angle)
    };
  }

  // 创建粒子
  function createParticule(x, y) {
    const p = {};
    p.x = x;
    p.y = y;
    p.color = options.colors[anime.random(0, options.colors.length - 1)];
    p.radius = anime.random(options.particleRadiusMin, options.particleRadiusMax);
    p.endPos = setParticuleDirection(p);
    p.draw = function () {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
      ctx.fillStyle = p.color;
      ctx.fill();
    };
    return p;
  }

  // 创建中心圆环
  function createCircle(x, y) {
    const p = {};
    p.x = x;
    p.y = y;
    p.color = "#FFF";
    p.radius = 0.1;
    p.alpha = 0.5;
    p.lineWidth = 6;
    p.draw = function () {
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
      ctx.lineWidth = p.lineWidth;
      ctx.strokeStyle = p.color;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };
    return p;
  }

  // 渲染所有粒子/圆环
  function renderParticule(anim) {
    for (let i = 0; i < anim.animatables.length; i++) {
      anim.animatables[i].target.draw();
    }
  }

  // 执行粒子动画
  function animateParticules(x, y) {
    const circle = createCircle(x, y);
    const particules = [];
    for (let i = 0; i < options.particleNum; i++) {
      particules.push(createParticule(x, y));
    }

    // 动画时间线
    anime.timeline()
      .add({
        targets: particules,
        x: p => p.endPos.x,
        y: p => p.endPos.y,
        radius: 0.1,
        duration: anime.random(1200, 1800),
        easing: "easeOutExpo",
        update: renderParticule
      })
      .add({
        targets: circle,
        radius: anime.random(options.circleRadiusMin, options.circleRadiusMax),
        lineWidth: 0,
        alpha: {
          value: 0,
          easing: "linear",
          duration: anime.random(600, 800)
        },
        duration: anime.random(1200, 1800),
        easing: "easeOutExpo",
        update: renderParticule
      }, 0);
  }

  // 点击触发
  function bindEvent() {
    const render = anime({
      duration: Infinity,
      update: function () {
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      }
    });

    document.addEventListener(tapEvent, function (e) {
      render.play();
      updateCoords(e);
      animateParticules(pointerX, pointerY);
    }, false);
  }

  // 对外初始化入口
  function init(customOpts = {}) {
    // 合并配置
    options = Object.assign({}, defaultOptions, customOpts);
    initCanvas();
    bindEvent();
  }

  // 对外暴露方法
  return {
    init: init,
    // 手动触发烟花（可选）
    fire: function (x, y) {
      animateParticules(x, y);
    }
  };
})();

// ========== 启动特效 ==========
// 直接使用默认配置启动
ClickFireworks.init();

// ========== 加载动画 ==========
// 加载动画配置
const Loader = {
  timer: null,
  lock: false,

  // 显示加载动画
  show: function() {
    clearTimeout(this.timer);
    document.body.removeClass('loaded');
    loadCat.attr('style', 'display:block');
    Loader.lock = false;
  },

  // 延迟隐藏加载动画
  hide: function(sec) {
    if(!CONFIG.loader.start)
      sec = -1
    this.timer = setTimeout(this.vanish, sec||3000);
  },

  // 真正隐藏：执行淡出动画
  vanish: function() {
    if(Loader.lock) return;
    if(CONFIG.loader.start)
      transition(loadCat, 0)       // 淡出动画
    document.body.addClass('loaded');
    Loader.lock = true;
  }
}
document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');

  // 判断是否第一次访问
  const isFirstVisit = !localStorage.getItem('visited');

  if (isFirstVisit) {
    // 第一次：显示加载动画
    loader.style.display = 'flex';

    // 页面加载完成后隐藏
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
        // 标记：已经访问过了
        localStorage.setItem('visited', 'true');
      }, 3000);
    });
  } else {
    // 不是第一次：直接隐藏
    loader.style.display = 'none';
  }
});