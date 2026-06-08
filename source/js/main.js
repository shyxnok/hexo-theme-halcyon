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
 */
(function() {
  'use strict';

  var balls = [];
  var longPressed = false;
  var longPress;
  var multiplier = 0;
  var width, height;
  var origin;
  var normal;
  var ctx;
  var colours = ['rgba(255,182,185,.9)', 'rgba(250,227,217,.9)', 'rgba(187,222,214,.9)', 'rgba(138,198,209,.9)'];
  var rings = [];
  var canvas = document.createElement('canvas');
  var pointer = document.createElement('span');

  function clickEffect() {
    document.body.appendChild(canvas);
    canvas.setAttribute('style', 'width: 100%; height: 100%; top: 0; left: 0; z-index: 99999; position: fixed; pointer-events: none;');
    pointer.classList.add('pointer');
    document.body.appendChild(pointer);

    if (canvas.getContext && window.addEventListener) {
      ctx = canvas.getContext('2d');
      updateSize();
      window.addEventListener('resize', updateSize, false);
      loop();

      window.addEventListener('mousedown', function(e) {
        pushBalls(randBetween(30, 50), e.clientX, e.clientY);
        rings.push({ x: e.clientX, y: e.clientY, r: 6, life: 1 });
        document.body.classList.add('is-pressed');
        longPress = setTimeout(function() {
          document.body.classList.add('is-longpress');
          longPressed = true;
        }, 500);
      }, false);

      window.addEventListener('mouseup', function(e) {
        clearInterval(longPress);
        if (longPressed == true) {
          document.body.classList.remove('is-longpress');
          pushBalls(randBetween(50 + Math.ceil(multiplier), 100 + Math.ceil(multiplier)), e.clientX, e.clientY);
          longPressed = false;
        }
        document.body.classList.remove('is-pressed');
      }, false);

      window.addEventListener('mousemove', function(e) {
        var x = e.clientX;
        var y = e.clientY;
        pointer.style.top = y + 'px';
        pointer.style.left = x + 'px';
      }, false);
    } else {
      console.log('canvas or addEventListener is unsupported!');
    }
  }

  function updateSize() {
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(2, 2);
    width = (canvas.width = window.innerWidth);
    height = (canvas.height = window.innerHeight);
    origin = { x: width / 2, y: height / 2 };
    normal = { x: width / 2, y: height / 2 };
  }

  function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.angle = Math.PI * 2 * Math.random();
    if (longPressed == true) {
      this.multiplier = randBetween(14 + multiplier, 15 + multiplier);
    } else {
      this.multiplier = randBetween(6, 12);
    }
    this.vx = (this.multiplier + Math.random() * 0.6) * Math.cos(this.angle);
    this.vy = (this.multiplier + Math.random() * 0.6) * Math.sin(this.angle);
    this.r = randBetween(4, 7) + 1.5 * Math.random();
    // this.r = randBetween(3, 6) + 1 * Math.random();
    this.color = colours[Math.floor(Math.random() * colours.length)];
  }

  Ball.prototype.update = function() {
    this.x += this.vx - normal.x;
    this.y += this.vy - normal.y;
    normal.x = -2 / window.innerWidth * Math.sin(this.angle);
    normal.y = -2 / window.innerHeight * Math.cos(this.angle);
    this.r -= 0.3;
    this.vx *= 0.9;
    this.vy *= 0.9;
  };

  function pushBalls(count, x, y) {
    for (var i = 0; i < count; i++) {
      balls.push(new Ball(x, y));
    }
  }

  function randBetween(min, max) {
    return Math.floor(Math.random() * max) + min;
  }

  function loop() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw white rings
    for (var j = rings.length - 1; j >= 0; j--) {
      var ring = rings[j];
      ctx.save();
      ctx.globalAlpha = ring.life * 0.5;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2, false);
      ctx.stroke();
      ctx.restore();
      ring.r += 1.5;
      ring.life -= 0.03;
      if (ring.life <= 0) rings.splice(j, 1);
    }
    
    for (var i = 0; i < balls.length; i++) {
      var b = balls[i];
      if (b.r < 0) continue;
      
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2, false);
      ctx.fill();
      
      b.update();
    }
    if (longPressed == true) {
      multiplier += 0.2;
    } else if (!longPressed && multiplier >= 0) {
      multiplier -= 0.4;
    }
    removeBall();
    requestAnimationFrame(loop);
  }

  function removeBall() {
    for (var i = 0; i < balls.length; i++) {
      var b = balls[i];
      if (b.x + b.r < 0 || b.x - b.r > width || b.y + b.r < 0 || b.y - b.r > height || b.r < 0) {
        balls.splice(i, 1);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', clickEffect);
  } else {
    clickEffect();
  }
})();
