<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>LamaStudio | Independent Software Studio & Developer Tools</title>
  <meta name="description" content="Independent software studio building privacy-focused applications, lightweight utilities, and open developer systems tailored for regional performance in DG Khan, Pakistan.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://lamastudio.pk/">
  
  <link rel="icon" type="image/png" href="lamastudio/favicon.png">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;700&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
  
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <header class="site-header">
    <div class="util-row">
      <a href="index.html" class="brand">
        <div class="brand-mark" aria-hidden="true">L</div>
        <div>
          LamaStudio
          <small>Digital Ecosystem</small>
        </div>
      </a>
      
      <div class="header-actions">
        <button class="icon-btn asklama-trigger" id="askLamaTriggerBtn" onclick="toggleLamaChat()" aria-label="Open AskLama AI Agent">
          🤖 <span class="desktop-only">AskLama</span>
        </button>

        <button class="icon-btn theme-toggle" id="themeToggleBtn" aria-label="Toggle Theme">
          <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
        </button>

        <button class="icon-btn menu-toggle" id="menuToggleBtn" aria-label="Open Navigation Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  </header>

  <div class="sidebar-overlay" id="sidebarOverlay">
    <nav class="sidebar-drawer left-align" aria-label="Sidebar Navigation" id="sidebarDrawer">
      <div class="sidebar-header">
        <div class="brand">
          <div class="brand-mark" aria-hidden="true">L</div>
          <span>Menu</span>
        </div>
        <button class="sidebar-close" id="sidebarCloseBtn" aria-label="Close Menu">✕</button>
      </div>
      
      <div class="sidebar-quick">
        <a class="sidebar-quick-btn" href="index.html">Home Dashboard</a>
        <a class="sidebar-quick-btn" href="#apps">Apps &amp; Utilities</a>
        <a class="sidebar-quick-btn" href="#blog">Studio Blog</a>
        <a class="sidebar-quick-btn ai-agent-btn" href="javascript:void(0);" onclick="toggleLamaChat();">🤖 AskLama AI Agent</a>
      </div>

      <div class="sidebar-nav-group">
        <h5>Category Hubs</h5>
        <ul>
          <li><a href="categories/tech/">Tech &amp; Code</a></li>
          <li><a href="categories/developer-tools/">Developer Tools</a></li>
          <li><a href="categories/productivity/">Productivity</a></li>
          <li><a href="categories/network-security/">Network &amp; Security</a></li>
          <li><a href="categories/business/">Business</a></li>
          <li><a href="categories/sports/">Sports Hub</a></li>
          <li><a href="categories/travel/">Travel &amp; Tourism</a></li>
          <li><a href="categories/news/">Global News</a></li>
          <li><a href="categories/fashion/">Fashion &amp; Style</a></li>
          <li><a href="categories/education/">Education</a></li>
          <li><a href="categories/weather/">Weather Forecast</a></li>
          <li><a href="categories/health/">Health &amp; Wellness</a></li>
        </ul>
      </div>
    </nav>
  </div>

  <main id="main-content" class="site-main">
    
    <div class="ad-container ad-banner-top">
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
           data-ad-slot="1234567890"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    </div>

    <div class="category-strip">
      <div class="category-track two-line-wrap" id="categoryTrack">
        <a href="categories/tech/" class="cat-pill" style="--pc: var(--c-tech);"><span class="dot"></span>Tech &amp; Code</a>
        <a href="categories/developer-tools/" class="cat-pill" style="--pc: var(--c-travel);"><span class="dot"></span>Developer Tools</a>
        <a href="categories/productivity/" class="cat-pill" style="--pc: var(--c-health);"><span class="dot"></span>Productivity</a>
        <a href="categories/network-security/" class="cat-pill" style="--pc: var(--c-weather);"><span class="dot"></span>Network &amp; Security</a>
        <a href="categories/business/" class="cat-pill" style="--pc: var(--c-business);"><span class="dot"></span>Business</a>
        <a href="categories/sports/" class="cat-pill" style="--pc: var(--c-sports);"><span class="dot"></span>Sports Hub</a>
        <a href="categories/travel/" class="cat-pill" style="--pc: var(--c-travel);"><span class="dot"></span>Travel &amp; Tourism</a>
        <a href="categories/news/" class="cat-pill" style="--pc: var(--c-news);"><span class="dot"></span>Global News</a>
        <a href="categories/fashion/" class="cat-pill" style="--pc: var(--c-fashion);"><span class="dot"></span>Fashion &amp; Style</a>
        <a href="categories/education/" class="cat-pill" style="--pc: var(--c-education);"><span class="dot"></span>Education</a>
        <a href="categories/weather/" class="cat-pill" style="--pc: var(--c-weather);"><span class="dot"></span>Weather Forecast</a>
        <a href="categories/health/" class="cat-pill" style="--pc: var(--c-health);"><span class="dot"></span>Health &amp; Wellness</a>
      </div>
    </div>

    <div class="dashboard">
      <div class="hero-panel">
        <span class="eyebrow">Independent Studio · DG Khan, Pakistan</span>
        <h1>Resilient digital tools for <em>modern workflows</em></h1>
        <p class="lede">Building privacy-focused applications, lightweight utilities, and open developer systems tailored for regional performance.</p>
        <div class="hero-cta">
          <a href="#apps" class="btn-action">Explore Apps</a>
          <a href="#blog" class="btn-ghost">Read Studio Blog</a>
        </div>
      </div>

      <aside class="side-widgets" aria-label="Sidebar Content">
        <div class="widget">
          <div class="widget-head">
            <span class="widget-title">Featured Stream</span>
            <span class="live-dot" aria-hidden="true"><i></i>Live Video</span>
          </div>
          <div class="video-wrapper">
            <iframe 
              src="https://www.youtube-nocookie.com/embed/BwOW3MkqaKc" 
              title="LamaStudio Featured Video Stream" 
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
            </iframe>
          </div>
          <div class="social-buttons-grid">
            <a href="https://www.youtube.com/@lamastudio" target="_blank" rel="noopener noreferrer" class="btn-social btn-youtube">YouTube</a>
            <a href="https://www.facebook.com/lamastudiopk" target="_blank" rel="noopener noreferrer" class="btn-social btn-facebook">Facebook</a>
          </div>
        </div>

        <div class="widget ad-widget">
          <div class="widget-head"><span class="widget-title">Sponsored</span></div>
          <ins class="adsbygoogle"
               style="display:block"
               data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
               data-ad-slot="0987654321"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
          <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
        </div>
      </aside>
    </div>

    <section class="section" id="apps">
      <div class="section-head">
        <div>
          <span class="eyebrow">The Ecosystem</span>
          <h2>Apps &amp; utilities</h2>
        </div>
      </div>
      <div class="app-grid" id="appGrid">
        
        <article class="app-card" data-category="business" data-title="LamaVPN Pro" data-desc="A full WireGuard VPN client with on-device key generation, Android Keystore-backed encrypted storage, and built-in DNS-leak protection." data-price="Free / Pro Upgrade" style="--pc: var(--c-business);">
          <div class="app-icon" aria-hidden="true">🛡️</div>
          <span class="tag-pill">Privacy &amp; Security</span>
          <h3>LamaVPN Pro</h3>
          <p class="desc">A full WireGuard VPN client with on-device key generation, Android Keystore-backed encrypted storage, and built-in DNS-leak protection.</p>
          <div class="card-actions">
            <a href="apps/lamavpnpro/" class="btn-action">View App</a>
            <button class="btn-ghost open-modal-btn">Quick View</button>
          </div>
        </article>

        <article class="app-card" data-category="weather" data-title="LamaSky" data-desc="Local weather, prayer-aligned scheduling, and daily planning built around how users structure their day." data-price="Free" style="--pc: var(--c-weather);">
          <div class="app-icon" aria-hidden="true">🌤️</div>
          <span class="tag-pill">Weather &amp; Planning</span>
          <h3>LamaSky</h3>
          <p class="desc">Local weather, prayer-aligned scheduling, and daily planning built around how users structure their day.</p>
          <div class="card-actions">
            <a href="apps/lamasky/" class="btn-action">View App</a>
            <button class="btn-ghost open-modal-btn">Quick View</button>
          </div>
        </article>

        <article class="app-card" data-category="business" data-title="LamaMultiCalendar" data-desc="Gregorian, Hijri (with Ruet-e-Hilal offset), and Nanakshahi dates side by side, with home-screen widgets." data-price="Free" style="--pc: var(--c-business);">
          <div class="app-icon" aria-hidden="true">📅</div>
          <span class="tag-pill">Productivity</span>
          <h3>LamaMultiCalendar</h3>
          <p class="desc">Gregorian, Hijri (with Ruet-e-Hilal offset), and Nanakshahi dates side by side, with home-screen widgets.</p>
          <div class="card-actions">
            <a href="apps/lamamulticalendar/" class="btn-action">View App</a>
            <button class="btn-ghost open-modal-btn">Quick View</button>
          </div>
        </article>

        <article class="app-card" data-category="education" data-title="LamaIQMaster" data-desc="Adaptive cognitive training with a grade-based, bilingual question bank and server-hosted premium content." data-price="Freemium" style="--pc: var(--c-education);">
          <div class="app-icon" aria-hidden="true">🧠</div>
          <span class="tag-pill">Cognitive Training</span>
          <h3>LamaIQMaster</h3>
          <p class="desc">Adaptive cognitive training with a grade-based, bilingual question bank and server-hosted premium content.</p>
          <div class="card-actions">
            <a href="apps/lamaiqmaster/" class="btn-action">View App</a>
            <button class="btn-ghost open-modal-btn">Quick View</button>
          </div>
        </article>

        <article class="app-card" data-category="fashion" data-title="LamaPhotoResizer" data-desc="On-device AI subject segmentation for clean cutouts, with an optional cloud upgrade for harder backgrounds." data-price="Free" style="--pc: var(--c-fashion);">
          <div class="app-icon" aria-hidden="true">🖼️</div>
          <span class="tag-pill">Photo Tools</span>
          <h3>LamaPhotoResizer</h3>
          <p class="desc">On-device AI subject segmentation for clean cutouts, with an optional cloud upgrade for harder backgrounds.</p>
          <div class="card-actions">
            <a href="apps/lamaphotoresizer/" class="btn-action">View App</a>
            <button class="btn-ghost open-modal-btn">Quick View</button>
          </div>
        </article>

        <article class="app-card" data-category="software" data-title="LamaSync Engine" data-desc="High-performance local directory synchronization and automatic backup manager for power users." data-price="Coming Soon" style="--pc: var(--c-tech);">
          <div class="app-icon" aria-hidden="true">💻</div>
          <span class="tag-pill">Desktop Utility</span>
          <h3>LamaSync Engine</h3>
          <p class="desc">High-performance local directory synchronization and automatic backup manager for power users.</p>
          <div class="card-actions">
            <span class="btn-ghost disabled-badge">Coming Soon</span>
          </div>
        </article>
      </div>
    </section>

    <div class="ad-container ad-banner-mid">
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
           data-ad-slot="5556667788"
           data-ad-format="fluid"
           data-ad-layout-key="-fb+5w+4e-db+86"></ins>
      <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    </div>

    <section class="section" id="blog">
      <div class="section-head">
        <div>
          <span class="eyebrow">From the Studio</span>
          <h2>Latest articles</h2>
        </div>
      </div>
      <div class="blog-grid" id="blogGrid">
        
        <article class="blog-card article-card-style" data-category="tech" data-title="Building Robust Mobile Software in 2026" data-desc="Deep dive into modern developer tools, framework patterns, and efficient coding workflows for independent studios." data-price="Article" style="--pc: var(--c-tech);">
          <div class="blog-thumb" aria-hidden="true">💻</div>
          <div class="blog-body">
            <div class="blog-meta">
              <span class="tag-pill">Tech &amp; Code</span>
              <span class="read-time">6 min read</span>
            </div>
            <h3>Building Robust Mobile Software in 2026</h3>
            <p>Deep dive into modern developer tools, framework patterns, and efficient coding workflows for independent studios.</p>
            <hr style="border: 0; border-top: 1px solid var(--border); margin: 1.2rem 0;">
            <a href="blogs/tech.html" class="read-link">Read article →</a>
          </div>
        </article>

        <article class="blog-card article-card-style" data-category="developer-tools" data-title="10 Essential Developer Tools for Faster Workflows" data-desc="Essential utilities, JSON formatters, regex debuggers, and local code accelerators to supercharge development efficiency." data-price="Article" style="--pc: var(--c-travel);">
          <div class="blog-thumb" aria-hidden="true">🛠️</div>
          <div class="blog-body">
            <div class="blog-meta">
              <span class="tag-pill">Developer Tools</span>
              <span class="read-time">5 min read</span>
            </div>
            <h3>10 Essential Developer Tools for Faster Workflows</h3>
            <p>Essential utilities, JSON formatters, regex debuggers, and local code accelerators to supercharge development efficiency.</p>
            <hr style="border: 0; border-top: 1px solid var(--border); margin: 1.2rem 0;">
            <a href="blogs/developer-tools.html" class="read-link">Read article →</a>
          </div>
        </article>

        <article class="blog-card article-card-style" data-category="productivity" data-title="10 Systems and Micro-Tools to Master Deep Work" data-desc="Conquer distractions, optimize daily focus blocks, and streamline tasks using minimal habit systems and time-box utils." data-price="Article" style="--pc: var(--c-health);">
          <div class="blog-thumb" aria-hidden="true">⚡</div>
          <div class="blog-body">
            <div class="blog-meta">
              <span class="tag-pill">Productivity</span>
              <span class="read-time">5 min read</span>
            </div>
            <h3>10 Systems and Micro-Tools to Master Deep Work</h3>
            <p>Conquer distractions, optimize daily focus blocks, and streamline tasks using minimal habit systems and time-box utils.</p>
            <hr style="border: 0; border-top: 1px solid var(--border); margin: 1.2rem 0;">
            <a href="blogs/productivity.html" class="read-link">Read article →</a>
          </div>
        </article>

        <article class="blog-card article-card-style" data-category="network-security" data-title="10 Essential Security Defenses for Digital Privacy" data-desc="Protect user identity, audit network pipelines, and enforce zero-trust policies against modern cybersecurity vulnerabilities." data-price="Article" style="--pc: var(--c-weather);">
          <div class="blog-thumb" aria-hidden="true">🛡️</div>
          <div class="blog-body">
            <div class="blog-meta">
              <span class="tag-pill">Network &amp; Security</span>
              <span class="read-time">6 min read</span>
            </div>
            <h3>10 Essential Security Defenses for Digital Privacy</h3>
            <p>Protect user identity, audit network pipelines, and enforce zero-trust policies against modern cybersecurity vulnerabilities.</p>
            <hr style="border: 0; border-top: 1px solid var(--border); margin: 1.2rem 0;">
            <a href="blogs/network-security.html" class="read-link">Read article →</a>
          </div>
        </article>

        <article class="blog-card article-card-style" data-category="business" data-title="Local Payment Rails Are the New Table Stakes" data-desc="EasyPaisa, JazzCash, and Raast aren’t optional add-ons anymore — they’re how most of your users expect to pay." data-price="Article" style="--pc: var(--c-business);">
          <div class="blog-thumb" aria-hidden="true">💳</div>
          <div class="blog-body">
            <div class="blog-meta">
              <span class="tag-pill">Business</span>
              <span class="read-time">5 min read</span>
            </div>
            <h3>Local Payment Rails Are the New Table Stakes for Apps</h3>
            <p>EasyPaisa, JazzCash, and Raast aren’t optional add-ons anymore — they’re how most of your users expect to pay.</p>
            <hr style="border: 0; border-top: 1px solid var(--border); margin: 1.2rem 0;">
            <a href="blogs/business.html" class="read-link">Read article →</a>
          </div>
        </article>

        <article class="blog-card article-card-style" data-category="education" data-title="What EdTech Gets Wrong About Modern Classrooms" data-desc="Most education apps are built for a device, connection, and curriculum that doesn’t match the average classroom." data-price="Article" style="--pc: var(--c-education);">
          <div class="blog-thumb" aria-hidden="true">🎓</div>
          <div class="blog-body">
            <div class="blog-meta">
              <span class="tag-pill">Education</span>
              <span class="read-time">7 min read</span>
            </div>
            <h3>What EdTech Gets Wrong About Modern Classrooms</h3>
            <p>Most education apps are built for a device, connection, and curriculum that doesn’t match the average classroom.</p>
            <hr style="border: 0; border-top: 1px solid var(--border); margin: 1.2rem 0;">
            <a href="blogs/education.html" class="read-link">Read article →</a>
          </div>
        </article>

        <article class="blog-card article-card-style" data-category="health" data-title="Building Habit Apps That Don’t Guilt-Trip Users" data-desc="Streaks and shame notifications drive short-term engagement and long-term uninstalls. There’s a better way to design for consistency." data-price="Article" style="--pc: var(--c-health);">
          <div class="blog-thumb" aria-hidden="true">💚</div>
          <div class="blog-body">
            <div class="blog-meta">
              <span class="tag-pill">Health</span>
              <span class="read-time">4 min read</span>
            </div>
            <h3>Building Habit Apps That Don’t Guilt-Trip Users</h3>
            <p>Streaks and shame notifications drive short-term engagement and long-term uninstalls. There’s a better way to design for consistency.</p>
            <hr style="border: 0; border-top: 1px solid var(--border); margin: 1.2rem 0;">
            <a href="blogs/health.html" class="read-link">Read article →</a>
          </div>
        </article>

        <article class="blog-card article-card-style" data-category="fashion" data-title="Designing for Small Screens: Lessons from Fashion E-Commerce" data-desc="What clothing marketplaces get right about product photography, sizing charts, and thumb-friendly checkout." data-price="Article" style="--pc: var(--c-fashion);">
          <div class="blog-thumb" aria-hidden="true">👗</div>
          <div class="blog-body">
            <div class="blog-meta">
              <span class="tag-pill">Fashion</span>
              <span class="read-time">5 min read</span>
            </div>
            <h3>Designing for Small Screens: Lessons from Fashion E-Commerce</h3>
            <p>What clothing marketplaces get right about product photography, sizing charts, and thumb-friendly checkout.</p>
            <hr style="border: 0; border-top: 1px solid var(--border); margin: 1.2rem 0;">
            <a href="blogs/fashion.html" class="read-link">Read article →</a>
          </div>
        </article>

        <article class="blog-card article-card-style" data-category="weather" data-title="Why Weather Apps Feel Unreliable in South Asia" data-desc="Sparse ground stations and coarse forecast models mean most weather apps are guessing more than users realize." data-price="Article" style="--pc: var(--c-weather);">
          <div class="blog-thumb" aria-hidden="true">🌦️</div>
          <div class="blog-body">
            <div class="blog-meta">
              <span class="tag-pill">Weather</span>
              <span class="read-time">6 min read</span>
            </div>
            <h3>Why Weather Apps Feel Unreliable in South Asia</h3>
            <p>Sparse ground stations and coarse forecast models mean most weather apps are guessing more than users realize.</p>
            <hr style="border: 0; border-top: 1px solid var(--border); margin: 1.2rem 0;">
            <a href="blogs/weather.html" class="read-link">Read article →</a>
          </div>
        </article>

        <article class="blog-card article-card-style" data-category="sports" data-title="Local Sports Fan Engagement on Budget Handsets" data-desc="How lightweight tracking engines keep users connected during live matches without draining battery or data." data-price="Article" style="--pc: var(--c-sports);">
          <div class="blog-thumb" aria-hidden="true">⚽</div>
          <div class="blog-body">
            <div class="blog-meta">
              <span class="tag-pill">Sports</span>
              <span class="read-time">5 min read</span>
            </div>
            <h3>Local Sports Fan Engagement on Budget Handsets</h3>
            <p>How lightweight tracking engines keep users connected during live matches without draining battery or data.</p>
            <hr style="border: 0; border-top: 1px solid var(--border); margin: 1.2rem 0;">
            <a href="blogs/sports.html" class="read-link">Read article →</a>
          </div>
        </article>

        <article class="blog-card article-card-style" data-category="news" data-title="Delivering Low-Bandwidth News Feeds Effectively" data-desc="Optimizing payload sizes for intermittent regional internet coverage and seamless offline reading." data-price="Article" style="--pc: var(--c-news);">
          <div class="blog-thumb" aria-hidden="true">📰</div>
          <div class="blog-body">
            <div class="blog-meta">
              <span class="tag-pill">News</span>
              <span class="read-time">4 min read</span>
            </div>
            <h3>Delivering Low-Bandwidth News Feeds Effectively</h3>
            <p>Optimizing payload sizes for intermittent regional internet coverage and seamless offline reading.</p>
            <hr style="border: 0; border-top: 1px solid var(--border); margin: 1.2rem 0;">
            <a href="blogs/news.html" class="read-link">Read article →</a>
          </div>
        </article>

        <article class="blog-card article-card-style" data-category="travel" data-title="Building Tourism Guides for Northern Pakistan" data-desc="Offline map caches and localized trail references for remote mountain areas with limited connectivity." data-price="Article" style="--pc: var(--c-travel);">
          <div class="blog-thumb" aria-hidden="true">✈️</div>
          <div class="blog-body">
            <div class="blog-meta">
              <span class="tag-pill">Travel</span>
              <span class="read-time">6 min read</span>
            </div>
            <h3>Building Tourism Guides for Northern Pakistan</h3>
            <p>Offline map caches and localized trail references for remote mountain areas with limited connectivity.</p>
            <hr style="border: 0; border-top: 1px solid var(--border); margin: 1.2rem 0;">
            <a href="blogs/travel.html" class="read-link">Read article →</a>
          </div>
        </article>

      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="brand">
          <div class="brand-mark" aria-hidden="true">L</div>
          <div>
            LamaStudio
            <small>Digital Ecosystem</small>
          </div>
        </div>
        <p>Independent software studio building resilient tools for modern digital lifestyles.</p>
        <p class="footer-address">📍 Dera Ghazi Khan, Punjab, Pakistan</p>
      </div>
      
      <div class="footer-col">
        <h4>Category Hubs (1-6)</h4>
        <a href="categories/tech/">Tech &amp; Code</a>
        <a href="categories/developer-tools/">Developer Tools</a>
        <a href="categories/productivity/">Productivity</a>
        <a href="categories/network-security/">Network &amp; Security</a>
        <a href="categories/business/">Business</a>
        <a href="categories/sports/">Sports Hub</a>
      </div>

      <div class="footer-col">
        <h4>Category Hubs (7-12)</h4>
        <a href="categories/travel/">Travel &amp; Tourism</a>
        <a href="categories/news/">Global News</a>
        <a href="categories/fashion/">Fashion &amp; Style</a>
        <a href="categories/education/">Education</a>
        <a href="categories/weather/">Weather Forecast</a>
        <a href="categories/health/">Health &amp; Wellness</a>
      </div>

      <div class="footer-col">
        <h4>Studio &amp; Legal</h4>
        <a href="privacy-policy.html">Privacy Policy</a>
        <a href="terms.html">Terms of Service</a>
        <a href="about.html">About Studio</a>
        <a href="https://www.youtube.com/@lamastudio" target="_blank" rel="noopener noreferrer">YouTube Channel</a>
        <a href="https://www.facebook.com/lamastudiopk" target="_blank" rel="noopener noreferrer">Facebook Page</a>
      </div>
    </div>

    <div class="footer-bottom">
      <span>&copy; 2026 LamaStudio. All rights reserved.</span>
      <span>Built with performance and accessibility in mind.</span>
    </div>
  </footer>

  <div class="modal-overlay" id="modalOverlay">
    <div class="modal-box">
      <button class="modal-close" id="modalCloseBtn" aria-label="Close Modal">✕</button>
      <div class="app-icon" id="modalIcon" aria-hidden="true">✨</div>
      <h3 id="modalTitle">Modal Title</h3>
      <p id="modalDesc">Modal description goes here...</p>
      
      <div class="modal-pricing-box">
        <span>Access Tier / Version</span>
        <span class="price-tag" id="modalPrice">Free</span>
      </div>

      <div class="modal-actions">
        <button id="modalPrimaryBtn" class="btn-action">Access Now</button>
        <button id="modalCloseAction" class="btn-ghost-action">Close</button>
      </div>
    </div>
  </div>

  <script src="script.js"></script>
  <script src="ask-lama.js"></script>
</body>
</html>
