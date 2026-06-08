/**
 * Halcyon Theme — main.js
 * Dark mode toggle, mobile menu, active nav
 */
console.log("%c Theme.Halcyon v" + '1.0.0' + " %c https://github.com/shyxnok/hexo-theme-Halcyon ", "color: white; background: rgb(12, 128, 230); padding:5px 0;", "padding:4px;border:1px solid rgb(12, 128, 230);");

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
 * Mouse Click Particle Effect - Exact implementation from kaitaku.xyz
 * 鼠标点击粒子特效（已移除长按功能）
 */
(function() {
  // 开启严格模式，规避JS不规范写法，提升代码健壮性
  'use strict';

  // 存储所有粒子实例
  var balls = [];
  // 画布宽高
  var width, height;
  // 画布中心点坐标
  var origin;
  // 粒子偏移修正量
  var normal;
  // Canvas 2D绘图上下文
  var ctx;
  // 粒子配色数组（半透彩色）
  var colours = [
    'rgba(255,182,185,.9)',
    'rgba(250,227,217,.9)',
    'rgba(187,222,214,.9)',
    'rgba(138,198,209,.9)'
  ];
  // 存储点击产生的白色圆环波纹
  var rings = [];
  // 创建画布元素，用于渲染粒子和圆环
  var canvas = document.createElement('canvas');
  // 创建鼠标跟随圆点元素
  var pointer = document.createElement('span');

  /**
   * 特效初始化入口函数
   */
  function clickEffect() {
    // 将画布插入页面body
    document.body.appendChild(canvas);
    // 设置画布样式：全屏固定、层级最高、不拦截鼠标事件
    canvas.setAttribute('style', 'width: 100%; height: 100%; top: 0; left: 0; z-index: 99999; position: fixed; pointer-events: none;');
    // 给鼠标圆点添加样式类并插入页面
    pointer.classList.add('pointer');
    document.body.appendChild(pointer);

    // 检测浏览器是否支持Canvas和事件监听
    if (canvas.getContext && window.addEventListener) {
      // 获取2D绘图上下文
      ctx = canvas.getContext('2d');
      // 初始化画布尺寸
      updateSize();
      // 监听窗口大小变化，实时适配画布
      window.addEventListener('resize', updateSize, false);
      // 启动动画主循环
      loop();

      // 监听鼠标按下事件，生成粒子+圆环
      window.addEventListener('mousedown', function(e) {
        // 生成 30~50 个粒子，位置为鼠标点击坐标
        pushBalls(randBetween(30, 50), e.clientX, e.clientY);
        // 添加白色圆环波纹，初始半径6，透明度生命周期1
        rings.push({ x: e.clientX, y: e.clientY, r: 6, life: 1 });
      }, false);

    } else {
      // 浏览器不兼容时控制台提示
      console.log('canvas or addEventListener is unsupported!');
    }
  }

  /**
   * 更新画布尺寸（窗口缩放时调用）
   */
  function updateSize() {
    // 画布实际像素宽高放大2倍，适配高清屏
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    // 画布展示尺寸设为浏览器可视区域大小
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    // 绘图缩放2倍，保证高清绘制
    ctx.scale(2, 2);
    // 记录可视区域宽高
    width = (canvas.width = window.innerWidth);
    height = (canvas.height = window.innerHeight);
    // 记录画布中心点
    origin = { x: width / 2, y: height / 2 };
    // 初始化粒子偏移修正值
    normal = { x: width / 2, y: height / 2 };
  }

  /**
   * 粒子构造函数：创建单个粒子
   * @param {number} x - 粒子初始X坐标
   * @param {number} y - 粒子初始Y坐标
   */
  function Ball(x, y) {
    // 粒子当前坐标
    this.x = x;
    this.y = y;
    // 粒子飞行角度（0 ~ 360° 随机）
    this.angle = Math.PI * 2 * Math.random();
    // 粒子基础移动倍率（控制飞行距离）
    this.multiplier = randBetween(6, 12);
    // X轴方向速度
    this.vx = (this.multiplier + Math.random() * 0.6) * Math.cos(this.angle);
    // Y轴方向速度
    this.vy = (this.multiplier + Math.random() * 0.6) * Math.sin(this.angle);
    // 粒子初始半径（基础4~7 + 随机增量）
    this.r = randBetween(4, 7) + 1.5 * Math.random();
    // this.r = randBetween(3, 6) + 1 * Math.random(); // 备用更小半径配置
    // 随机选取一个粒子颜色
    this.color = colours[Math.floor(Math.random() * colours.length)];
  }

  /**
   * 粒子更新方法：每一帧更新位置、大小、速度
   */
  Ball.prototype.update = function() {
    // 更新粒子坐标
    this.x += this.vx - normal.x;
    this.y += this.vy - normal.y;
    // 动态修正偏移量
    normal.x = -2 / window.innerWidth * Math.sin(this.angle);
    normal.y = -2 / window.innerHeight * Math.cos(this.angle);
    // 粒子半径持续减小（逐渐消失）
    this.r -= 0.3;
    // 速度衰减（模拟摩擦力，越飞越慢）
    this.vx *= 0.9;
    this.vy *= 0.9;
  };

  /**
   * 批量创建粒子，加入粒子数组
   * @param {number} count - 粒子数量
   * @param {number} x - 生成中心点X
   * @param {number} y - 生成中心点Y
   */
  function pushBalls(count, x, y) {
    for (var i = 0; i < count; i++) {
      balls.push(new Ball(x, y));
    }
  }

  /**
   * 生成 [min, max) 之间的随机整数
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {number} 随机整数
   */
  function randBetween(min, max) {
    return Math.floor(Math.random() * max) + min;
  }

  /**
   * 动画主循环（每一帧执行）
   */
  function loop() {
    // 清空画布
    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // ========== 绘制白色扩散圆环波纹 ==========
    // 倒序遍历，避免删除元素导致下标错乱
    for (var j = rings.length - 1; j >= 0; j--) {
      var ring = rings[j];
      ctx.save(); // 保存绘图状态
      // 控制圆环整体透明度
      ctx.globalAlpha = ring.life * 0.5;
      ctx.strokeStyle = '#fff'; // 圆环描边颜色：白色
      ctx.lineWidth = 6; // 圆环线条宽度
      ctx.beginPath(); // 开启新路径
      // 绘制圆形圆环
      ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2, false);
      ctx.stroke(); // 执行描边
      ctx.restore(); // 恢复绘图状态

      // 圆环半径持续变大
      ring.r += 1.5;
      // 圆环生命周期递减（逐渐透明消失）
      ring.life -= 0.03;
      // 生命周期为0时，移除该圆环
      if (ring.life <= 0) rings.splice(j, 1);
    }
    
    // ========== 绘制所有彩色粒子 ==========
    for (var i = 0; i < balls.length; i++) {
      var b = balls[i];
      // 粒子半径小于0，跳过绘制（已消失）
      if (b.r < 0) continue;
      
      // 设置粒子填充色
      ctx.fillStyle = b.color;
      ctx.beginPath();
      // 绘制圆形粒子
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2, false);
      ctx.fill(); // 填充圆形
      
      // 更新粒子状态（位置、大小、速度）
      b.update();
    }

    // 清理超出可视区域/已消失的粒子
    removeBall();
    // 浏览器下一帧继续执行循环，保证动画流畅
    requestAnimationFrame(loop);
  }

  /**
   * 清理失效粒子（超出屏幕 / 半径过小）
   */
  function removeBall() {
    for (var i = 0; i < balls.length; i++) {
      var b = balls[i];
      // 判断粒子是否在可视区域外 或 完全缩小消失
      if (b.x + b.r < 0 || b.x - b.r > width ||
          b.y + b.r < 0 || b.y - b.r > height ||
          b.r < 0) {
        balls.splice(i, 1); // 从数组中移除该粒子
      }
    }
  }

  // 根据页面加载状态，启动特效
  if (document.readyState === 'loading') {
    // 页面还在加载，等待DOM加载完成后执行
    document.addEventListener('DOMContentLoaded', clickEffect);
  } else {
    // 页面已加载完毕，直接执行初始化
    clickEffect();
  }
})();