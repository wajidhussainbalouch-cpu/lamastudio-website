<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LamaStudio — Next-Gen App Store</title>
    
    <!-- Meta Descriptions & Keywords -->
    <meta name="description" content="LamaStudio is an independent Android app studio building LamaVPN Pro, LamaSky, LamaIQMaster, LamaMultiCalendar, LamaPhotoResizer, LamaPark, LamaSync, and LamaStore.">
    <meta name="keywords" content="LamaStudio, LamaVPN Pro, LamaSky, LamaIQMaster, LamaMultiCalendar, LamaPhotoResizer, LamaPark, LamaSync, LamaStore,">
    <link rel="canonical" href="https://lamastudio.pk/">

    <!-- Website Favicon for Chrome & Browsers -->
    <link rel="icon" type="image/png" href="favicon.png">
    <link rel="apple-touch-icon" href="favicon.png">
</head>

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:title" content="LamaStudio — Next-Gen App & Software Store">
<meta property="og:description" content="Privacy tools, weather tracking, calendars, learning tools, utilities, parking management, cloud sync, and app store solutions — built independently in DG Khan, Pakistan.">
<meta property="og:image" content="https://lamastudio.pk/assets/og-cover.png">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="data:,">
<link rel="stylesheet" href="{{ asset("style.css") }}">
<style>
/* Prevent horizontal page scrolling */
html, body {
    max-width: 100%;
    overflow-x: hidden;
    box-sizing: border-box;
}
*, *:before, *:after {
    box-sizing: inherit;
}

/* Mobile-Friendly Adjustments for Topbar Links & Overflow */
@media (max-width: 768px) {
    .topbar .topbar-links {
        display: none !important; /* Hide crowded links on small mobile screens; use hamburger/sidebar instead */
    }
    .topbar {
        padding: 10px 15px;
    }
}

/* App Card Theme Colors & Glowing Borders */
.app-card[data-app="vpn"] {
    border: 1px solid rgba(94, 232, 197, 0.4);
    box-shadow: 0 0 15px rgba(94, 232, 197, 0.15);
}
.app-card[data-app="vpn"]:hover {
    border-color: rgba(94, 232, 197, 0.8);
    box-shadow: 0 0 25px rgba(94, 232, 197, 0.3);
}

.app-card[data-app="sky"] {
    border: 1px solid rgba(56, 189, 248, 0.4);
    box-shadow: 0 0 15px rgba(56, 189, 248, 0.15);
}
.app-card[data-app="sky"]:hover {
    border-color: rgba(56, 189, 248, 0.8);
    box-shadow: 0 0 25px rgba(56, 189, 248, 0.3);
}

.app-card[data-app="iq"] {
    border: 1px solid rgba(168, 85, 247, 0.4);
    box-shadow: 0 0 15px rgba(168, 85, 247, 0.15);
}
.app-card[data-app="iq"]:hover {
    border-color: rgba(168, 85, 247, 0.8);
    box-shadow: 0 0 25px rgba(168, 85, 247, 0.3);
}

.app-card[data-app="calendar"] {
    border: 1px solid rgba(251, 191, 36, 0.4);
    box-shadow: 0 0 15px rgba(251, 191, 36, 0.15);
}
.app-card[data-app="calendar"]:hover {
    border-color: rgba(251, 191, 36, 0.8);
    box-shadow: 0 0 25px rgba(251, 191, 36, 0.3);
}

.app-card[data-app="resizer"] {
    border: 1px solid rgba(244, 114, 182, 0.4);
    box-shadow: 0 0 15px rgba(244, 114, 182, 0.15);
}
.app-card[data-app="resizer"]:hover {
    border-color: rgba(244, 114, 182, 0.8);
    box-shadow: 0 0 25px rgba(244, 114, 182, 0.3);
}

.app-card[data-app="park"] {
    border: 1px solid rgba(249, 115, 22, 0.4); /* Vibrant Amber/Orange for LamaPark */
    box-shadow: 0 0 15px rgba(249, 115, 22, 0.15);
}
.app-card[data-app="park"]:hover {
    border-color: rgba(249, 115, 22, 0.8);
    box-shadow: 0 0 25px rgba(249, 115, 22, 0.3);
}

.app-card[data-app="sync"] {
    border: 1px solid rgba(129, 140, 248, 0.4);
    box-shadow: 0 0 15px rgba(129, 140, 248, 0.15);
}
.app-card[data-app="sync"]:hover {
    border-color: rgba(129, 140, 248, 0.8);
    box-shadow: 0 0 25px rgba(129, 140, 248, 0.3);
}

.app-card[data-app="store"] {
    border: 1px solid rgba(20, 184, 166, 0.4); /* Unique Theme Color: Teal for LamaStore */
    box-shadow: 0 0 15px rgba(20, 184, 166, 0.15);
}
.app-card[data-app="store"]:hover {
    border-color: rgba(20, 184, 166, 0.8);
    box-shadow: 0 0 25px rgba(20, 184, 166, 0.3);
}

/* Typography & Layout Inside App Cards */
.app-card-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 1rem;
}

/* Big and intensely glowing theme icons */
.app-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.app-card[data-app="vpn"] .app-icon {
    background: rgba(94, 232, 197, 0.2);
    color: #5EE8C5;
    box-shadow: 0 0 20px #5EE8C5, inset 0 0 10px rgba(94, 232, 197, 0.5);
}

.app-card[data-app="sky"] .app-icon {
    background: rgba(56, 189, 248, 0.2);
    color: #38bdf8;
    box-shadow: 0 0 20px #38bdf8, inset 0 0 10px rgba(56, 189, 248, 0.5);
}

.app-card[data-app="iq"] .app-icon {
    background: rgba(168, 85, 247, 0.2);
    color: #a855f7;
    box-shadow: 0 0 20px #a855f7, inset 0 0 10px rgba(168, 85, 247, 0.5);
}

.app-card[data-app="calendar"] .app-icon {
    background: rgba(251, 191, 36, 0.2);
    color: #fbbf24;
    box-shadow: 0 0 20px #fbbf24, inset 0 0 10px rgba(251, 191, 36, 0.5);
}

.app-card[data-app="resizer"] .app-icon {
    background: rgba(244, 114, 182, 0.2);
    color: #f472b6;
    box-shadow: 0 0 20px #f472b6, inset 0 0 10px rgba(244, 114, 182, 0.5);
}

.app-card[data-app="park"] .app-icon {
    background: rgba(249, 115, 22, 0.2);
    color: #f97316;
    box-shadow: 0 0 20px #f97316, inset 0 0 10px rgba(249, 115, 22, 0.5);
}

.app-card[data-app="sync"] .app-icon {
    background: rgba(129, 140, 248, 0.2);
    color: #818cf8;
    box-shadow: 0 0 20px #818cf8, inset 0 0 10px rgba(129, 140, 248, 0.5);
}

.app-card[data-app="store"] .app-icon {
    background: rgba(20, 184, 166, 0.2);
    color: #14b8a6;
    box-shadow: 0 0 20px #14b8a6, inset 0 0 10px rgba(20, 184, 166, 0.5);
}

.app-title-area h3 {
    color: #ffffff !important;
    font-size: 1.05rem;
    margin: 0 0 2px 0;
    font-weight: 600;
    white-space: nowrap;
}

.app-version {
    font-size: 0.75rem;
    font-weight: 500;
}

.app-card p {
    color: #94a3b8 !important;
    margin-bottom: 1rem;
}

/* App Tags Forced into a Single Non-Scrolling Line with Smaller Text */
.app-tags {
    display: flex;
    flex-wrap: nowrap;
    gap: 6px;
    overflow: hidden;
    margin-bottom: 1rem;
    width: 100%;
}

.app-card[data-app="vpn"] .app-tag { color: #5EE8C5; border-color: rgba(94, 232, 197, 0.4); }
.app-card[data-app="sky"] .app-tag { color: #38bdf8; border-color: rgba(56, 189, 248, 0.4); }
.app-card[data-app="iq"] .app-tag { color: #a855f7; border-color: rgba(168, 85, 247, 0.4); }
.app-card[data-app="calendar"] .app-tag { color: #fbbf24; border-color: rgba(251, 191, 36, 0.4); }
.app-card[data-app="resizer"] .app-tag { color: #f472b6; border-color: rgba(244, 114, 182, 0.4); }
.app-card[data-app="park"] .app-tag { color: #f97316; border-color: rgba(249, 115, 22, 0.4); }
.app-card[data-app="sync"] .app-tag { color: #818cf8; border-color: rgba(129, 140, 248, 0.4); }
.app-card[data-app="store"] .app-tag { color: #14b8a6; border-color: rgba(20, 184, 166, 0.4); }

.app-tag {
    background: transparent;
    border: 1px solid;
    padding: 2px 6px;
    border-radius: 12px;
    font-size: 0.65rem;
    white-space: nowrap;
    letter-spacing: -0.2px;
}

/* Sidebar Boxed Navigation with Glow and Selection Fill */
.sidebar .nav-link {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    margin-bottom: 6px;
    border-radius: 8px;
    border: 1px solid transparent;
    transition: all 0.2s ease;
    text-decoration: none;
    color: #cbd5e1;
    white-space: nowrap;
}

.sidebar .nav-link .nav-dot { display: none; }

.sidebar .nav-link[data-app="vpn"] { border-color: rgba(94, 232, 197, 0.3); box-shadow: 0 0 8px rgba(94, 232, 197, 0.15); }
.sidebar .nav-link[data-app="vpn"]:hover, .sidebar .nav-link[data-app="vpn"].active { background-color: #5EE8C5; color: #0f172a; border-color: #5EE8C5; box-shadow: 0 0 15px #5EE8C5; font-weight: 600; }

.sidebar .nav-link[data-app="sky"] { border-color: rgba(56, 189, 248, 0.3); box-shadow: 0 0 8px rgba(56, 189, 248, 0.15); }
.sidebar .nav-link[data-app="sky"]:hover, .sidebar .nav-link[data-app="sky"].active { background-color: #38bdf8; color: #0f172a; border-color: #38bdf8; box-shadow: 0 0 15px #38bdf8; font-weight: 600; }

.sidebar .nav-link[data-app="iq"] { border-color: rgba(168, 85, 247, 0.3); box-shadow: 0 0 8px rgba(168, 85, 247, 0.15); }
.sidebar .nav-link[data-app="iq"]:hover, .sidebar .nav-link[data-app="iq"].active { background-color: #a855f7; color: #0f172a; border-color: #a855f7; box-shadow: 0 0 15px #a855f7; font-weight: 600; }

.sidebar .nav-link[data-app="calendar"] { border-color: rgba(251, 191, 36, 0.3); box-shadow: 0 0 8px rgba(251, 191, 36, 0.15); }
.sidebar .nav-link[data-app="calendar"]:hover, .sidebar .nav-link[data-app="calendar"].active { background-color: #fbbf24; color: #0f172a; border-color: #fbbf24; box-shadow: 0 0 15px #fbbf24; font-weight: 600; }

.sidebar .nav-link[data-app="resizer"] { border-color: rgba(244, 114, 182, 0.3); box-shadow: 0 0 8px rgba(244, 114, 182, 0.15); }
.sidebar .nav-link[data-app="resizer"]:hover, .sidebar .nav-link[data-app="resizer"].active { background-color: #f472b6; color: #0f172a; border-color: #f472b6; box-shadow: 0 0 15px #f472b6; font-weight: 600; }

.sidebar .nav-link[data-app="park"] { border-color: rgba(249, 115, 22, 0.3); box-shadow: 0 0 8px rgba(249, 115, 22, 0.15); }
.sidebar .nav-link[data-app="park"]:hover, .sidebar .nav-link[data-app="park"].active { background-color: #f97316; color: #0f172a; border-color: #f97316; box-shadow: 0 0 15px #f97316; font-weight: 600; }

.sidebar .nav-link[data-app="sync"] { border-color: rgba(129, 140, 248, 0.3); box-shadow: 0 0 8px rgba(129, 140, 248, 0.15); }
.sidebar .nav-link[data-app="sync"]:hover, .sidebar .nav-link[data-app="sync"].active { background-color: #818cf8; color: #0f172a; border-color: #818cf8; box-shadow: 0 0 15px #818cf8; font-weight: 600; }

.sidebar .nav-link[data-app="store"] { border-color: rgba(20, 184, 166, 0.3); box-shadow: 0 0 8px rgba(20, 184, 166, 0.15); }
.sidebar .nav-link[data-app="store"]:hover, .sidebar .nav-link[data-app="store"].active { background-color: #14b8a6; color: #0f172a; border-color: #14b8a6; box-shadow: 0 0 15px #14b8a6; font-weight: 600; }

/* Responsive Grid Layout: Stacks vertically on mobile screens */
.corner-widget-grid {
    display: grid;
    grid-template-columns: 1fr 780px;
    gap: 20px;
    align-items: start;
    margin-bottom: 2rem;
    width: 100%;
}
@media (max-width: 1300px) {
    .corner-widget-grid {
        grid-template-columns: 1fr;
    }
}

/* Right Column Flex Container holding Mobile Flipper and YouTube Box */
.right-side-media-group {
    display: flex;
    gap: 16px;
    align-items: stretch;
    width: 100%;
}
@media (max-width: 768px) {
    .right-side-media-group {
        flex-direction: column;
    }
}

/* Separate Mobile Flipper Box matching card structure */
.flipper-external-box {
    background: #141c28;
    border: 1px solid rgba(56, 189, 248, 0.3);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    flex: 1;
    min-width: 0;
}
.flipper-external-box h4 {
    color: #38bdf8;
    font-size: 0.95rem;
    margin: 0 0 10px 0;
    white-space: nowrap;
}

/* Mobile Screen Screenshot Flipper Widget */
.mobile-flipper-container {
    position: relative;
    width: 100%;
    padding-bottom: 75%;
    height: 0;
    background: #000;
    border: 4px solid #2d3748;
    border-radius: 12px;
    box-shadow: 0 0 15px rgba(0,0,0,0.6), inset 0 0 6px rgba(255,255,255,0.1);
    overflow: hidden;
    margin-bottom: 12px;
}
.mobile-flipper-container .phone-notch {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 6px;
    background: #2d3748;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    z-index: 10;
}
.app-screenshot {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.8s ease-in-out;
}
.app-screenshot.active {
    opacity: 1;
}

/* Overlay App Name Banner inside the Flipper Container */
.app-name-overlay {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(56, 189, 248, 0.4);
    color: #38bdf8;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    z-index: 12;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    white-space: nowrap;
    letter-spacing: 0.3px;
    backdrop-filter: blur(4px);
}

/* Right Corner YouTube Box */
.corner-card {
    background: #141c28;
    border: 1px solid rgba(251, 191, 36, 0.3);
    border-radius: 12px;
    padding: 16px;
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
}
.corner-card h4 {
    color: #fbbf24;
    font-size: 0.95rem;
    margin: 0 0 10px 0;
}

/* Video Wrapper */
.small-video-container {
    position: relative;
    width: 100%;
    padding-bottom: 75%;
    height: 0;
    border-radius: 8px;
    overflow: hidden;
    background: #000;
    margin-bottom: 12px;
}
.small-video-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
}

/* Unified Button Styling: Perfect horizontal & vertical alignment across both feature boxes */
.btn-feature-action {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: 42px; /* Fixed identical height for precise alignment */
    padding: 0 12px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 700;
    text-decoration: none;
    box-sizing: border-box;
    margin-bottom: 12px;
    transition: 0.2s ease;
}

.btn-feature-blue {
    background: linear-gradient(135deg, #38bdf8, #0284c7);
    color: #0b0f19;
    box-shadow: 0 0 15px rgba(56, 189, 248, 0.4);
}
.btn-feature-blue:hover {
    background: #7dd3fc;
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.7);
    transform: translateY(-1px);
}

.btn-feature-yellow {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #0b0f19;
    box-shadow: 0 0 15px rgba(251, 191, 36, 0.4);
}
.btn-feature-yellow:hover {
    background: #fde047;
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.7);
    transform: translateY(-1px);
}

/* Scrollable App Highlights Box showing ALL 8 apps with unique badge colors */
.live-news-box {
    background: #0b0f19;
    border: 1px solid rgba(251, 191, 36, 0.2);
    border-radius: 6px;
    padding: 8px;
    max-height: 125px;
    overflow-y: auto;
}
.live-news-box h5 {
    color: #38bdf8;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 6px 0;
    display: flex;
    align-items: center;
    gap: 5px;
}
.live-news-box h5::before {
    content: '';
    width: 6px;
    height: 6px;
    background: #ef4444;
    border-radius: 50%;
    display: inline-block;
    box-shadow: 0 0 6px #ef4444;
    animation: pulse 1.5s infinite;
}
@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.3; }
    100% { opacity: 1; }
}

.news-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #cbd5e1;
    text-decoration: none;
    padding: 4px 8px;
    border-radius: 4px;
    margin-bottom: 4px;
    background: rgba(255,255,255,0.03);
    transition: 0.2s;
    white-space: nowrap;
}
.news-item:hover {
    background: rgba(251, 191, 36, 0.15);
    color: #fbbf24;
}

/* Distinct color badges for each app in the list */
.badge-vpn { color: #5EE8C5; border-left: 3px solid #5EE8C5; padding-left: 6px; }
.badge-sky { color: #38bdf8; border-left: 3px solid #38bdf8; padding-left: 6px; }
.badge-iq { color: #a855f7; border-left: 3px solid #a855f7; padding-left: 6px; }
.badge-calendar { color: #fbbf24; border-left: 3px solid #fbbf24; padding-left: 6px; }
.badge-resizer { color: #f472b6; border-left: 3px solid #f472b6; padding-left: 6px; }
.badge-park { color: #f97316; border-left: 3px solid #f97316; padding-left: 6px; }
.badge-sync { color: #818cf8; border-left: 3px solid #818cf8; padding-left: 6px; }
.badge-store { color: #14b8a6; border-left: 3px solid #14b8a6; padding-left: 6px; }

.social-links-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 10px;
}
.btn-social-sm {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #1e293b;
    color: #f8fafc;
    padding: 5px 8px;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 600;
    text-decoration: none;
    border: 1px solid rgba(251, 191, 36, 0.3);
    transition: 0.2s ease;
}
.btn-social-sm:hover {
    background: #fbbf24;
    color: #0b0f19;
}

/* Market Ticker Section Styles */
.market-ticker-section {
    background: #141c28;
    border: 1px solid rgba(20, 184, 166, 0.3);
    border-radius: 12px;
    padding: 20px;
    margin-top: 3rem;
    margin-bottom: 2rem;
    box-shadow: 0 0 20px rgba(20, 184, 166, 0.1);
}
.market-ticker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 10px;
}
.market-ticker-header h3 {
    color: #14b8a6;
    font-size: 1.1rem;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
}
.market-ticker-header span {
    font-size: 0.75rem;
    color: #94a3b8;
}
.market-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 15px;
}
.market-card {
    background: #0b0f19;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 12px 16px;
    transition: 0.2s ease;
}
.market-card:hover {
    border-color: rgba(20, 184, 166, 0.4);
    box-shadow: 0 0 10px rgba(20, 184, 166, 0.15);
}
.market-label {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.market-value {
    font-size: 1.05rem;
    font-weight: 700;
    color: #f8fafc;
}
.market-sub {
    font-size: 0.7rem;
    color: #14b8a6;
    margin-top: 2px;
}

/* News & Ticker Section Added Styles */
.news-ticker-section {
    background: #141c28;
    border: 1px solid rgba(56, 189, 248, 0.3);
    border-radius: 12px;
    padding: 20px;
    margin-top: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.1);
}
.news-ticker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 10px;
}
.news-ticker-header h3 {
    color: #38bdf8;
    font-size: 1.1rem;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
}
.news-ticker-content p {
    color: #cbd5e1 !important;
    font-size: 0.95rem;
    line-height: 1.6;
    margin: 0;
}
.psx-scroll-container {
    overflow-x: auto;
    white-space: nowrap;
    padding: 8px 0;
    margin-top: 10px;
    background: #0b0f19;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}
.psx-item {
    display: inline-block;
    padding: 6px 14px;
    margin-right: 10px;
    background: rgba(20, 184, 166, 0.1);
    border: 1px solid rgba(20, 184, 166, 0.3);
    border-radius: 6px;
    font-size: 0.85rem;
    color: #f8fafc;
}
.psx-item span {
    font-weight: bold;
    color: #38bdf8;
    margin-left: 6px;
}
</style>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4212196297960637" crossorigin="anonymous"></script>
</head>
<body data-app="home">

<div class="topbar">
    <a href="/" class="brand"><span class="brand-mark">L</span>LamaStudio</a>
    <div class="topbar-links">
        <a href=\"/services\">Services</a>
        <a href=\"/about\">About</a>
    </div>
</div>

<div class="layout">
    <aside class="sidebar">
        <a href="/" class="brand"><span class="brand-mark">L</span>LamaStudio</a>

        <nav class="nav-group">
            <span class="nav-label">Store</span>
            <a href="/" class="nav-link active">Home</a>
            <a href=\"/services\" class="nav-link">Services</a>
            <a href=\"/about\" class="nav-link">About</a>
        </nav>

        <nav class="nav-group">
            <span class="nav-label">Apps (8)</span>
            <a href="apps/lamavpnpro/" class="nav-link" data-app="vpn">LamaVPN Pro v1.0</a>
            <a href="apps/lamasky/" class="nav-link" data-app="sky">LamaSky v2.1</a>
            <a href="apps/lamaiqmaster/" class="nav-link" data-app="iq">LamaIQMaster v1.0</a>
            <a href="apps/lamamulticalendar/" class="nav-link" data-app="calendar">LamaMultiCalendar v1.0</a>
            <a href="apps/lamaphotoresizer/" class="nav-link" data-app="resizer">LamaPhotoResizer v1.0</a>
            <a href="apps/lamapark/" class="nav-link" data-app="park">LamaPark v1.0</a>
            <a href="apps/lamasync/" class="nav-link" data-app="sync">LamaSync v1.0</a>
            <a href="apps/lamastore/" class="nav-link" data-app="store">LamaStore v1.0</a>
        </nav>

        <div class="sidebar-footer">
            LamaStudio<br>
            DG Khan, Pakistan<br>
            &copy; 2026 lamastudio.pk
        </div>
    </aside>

    <main class="content">
        
        <!-- Top Layout: Hero on Left, Right Side Group containing Standalone Mobile Flipper & YouTube Widget -->
        <div class="corner-widget-grid">
            
            <!-- Central Hero Section -->
            <section class="hero" style="margin-bottom: 0;">
                <span class="eyebrow">Next-Gen App & Software Store</span>
                <h1>Software built close to home, for how people here actually use their phones.</h1>
                <p>LamaStudio designs and ships Android apps end to end — from privacy tools, weather forecasting, multi-calendars, and learning tools to parking management, cloud sync, and app store utilities. Access board results and official educational services.</p>
                <div class="hero-actions" style="margin-top: 15px;">
                    <a href=\"/boards\" class="btn-action" style="background: #fbbf24; color: #0b0f19;">Educational Services</a>
                    <a href="apps/lamamulticalendar/" class="btn-ghost">Browse Apps</a>
                </div>
            </section>

            <!-- Right Group -->
            <div class="right-side-media-group">
                
                <!-- Standalone Mobile Flipper Box -->
                <div class="flipper-external-box">
                    <h4>Our Apps</h4>
                    <div class="mobile-flipper-container">
                        <div class="phone-notch"></div>
                        <img src=\"{{ asset(\"assets/screenshots/lamavpn.png\") }}\" alt="LamaVPN Pro" class="app-screenshot active" data-name="LamaVPN Pro v1.0">
                        <img src=\"{{ asset(\"assets/screenshots/lamasky.png\") }}\" alt="LamaSky" class="app-screenshot" data-name="LamaSky v1.0">
                        <img src=\"{{ asset(\"assets/screenshots/lamaiq.png\") }}\" alt="LamaIQMaster" class="app-screenshot" data-name="LamaIQMaster v1.0">
                        <img src=\"{{ asset(\"assets/screenshots/lamacalendar.png\") }}\" alt="LamaMultiCalendar" class="app-screenshot" data-name="LamaMultiCalendar v1.0">
                        <img src=\"{{ asset(\"assets/screenshots/lamaresizer.png\") }}\" alt="LamaPhotoResizer" class="app-screenshot" data-name="LamaPhotoResizer v1.0">
                        <img src=\"{{ asset(\"assets/screenshots/lamapark.png\") }}\" alt="LamaPark" class="app-screenshot" data-name="LamaPark v1.0">
                        <img src=\"{{ asset(\"assets/screenshots/lamasync.png\") }}\" alt="LamaSync" class="app-screenshot" data-name="LamaSync v1.0">
                        <img src=\"{{ asset(\"assets/screenshots/lamastore.png\") }}\" alt="LamaStore" class="app-screenshot" data-name="LamaStore v1.0">
                        
                        <div class="app-name-overlay" id="flipperAppName">LamaVPN Pro v1.0</div>
                    </div>

                    <a href="apps/lamamulticalendar/" class="btn-feature-action btn-feature-blue">🚀 Explore All Lama Apps</a>

                    <!-- Scrollable App Highlights Box with ALL 8 Apps and distinct colors -->
                    <div class="live-news-box">
                        <h5>App Highlights (Scroll for All)</h5>
                        <a href="apps/lamavpnpro/" class="news-item badge-vpn"><span>🔒 LamaVPN Pro</span> <span>v1.0</span></a>
                        <a href="apps/lamasky/" class="news-item badge-sky"><span>🌤️ LamaSky</span> <span>v1.0</span></a>
                        <a href="apps/lamaiqmaster/" class="news-item badge-iq"><span>🧠 LamaIQMaster</span> <span>v1.0</span></a>
                        <a href="apps/lamamulticalendar/" class="news-item badge-calendar"><span>📅 LamaMultiCalendar</span> <span>v1.0</span></a>
                        <a href="apps/lamaphotoresizer/" class="news-item badge-resizer"><span>🖼️ LamaPhotoResizer</span> <span>v1.0</span></a>
                        <a href="apps/lamapark/" class="news-item badge-park"><span>🅿️ LamaPark</span> <span>v1.0</span></a>
                        <a href="apps/lamasync/" class="news-item badge-sync"><span>🔄 LamaSync</span> <span>v1.0</span></a>
                        <a href="apps/lamastore/" class="news-item badge-store"><span>📦 LamaStore</span> <span>v1.0</span></a>
                    </div>

                    <div class="social-links-row">
                        <span class="btn-social-sm" style="background: #1e293b; color: #38bdf8; border-color: rgba(56,189,248,0.3);">⚡ v1.0 Live</span>
                        <span class="btn-social-sm" style="background: #1e293b; color: #38bdf8; border-color: rgba(56,189,248,0.3);">📱 Android Ready</span>
                    </div>
                </div>

                <!-- Right YouTube Player Widget Box -->
                <div class="corner-card">
                    <h4>Featured Video</h4>
                    
                    <div class="small-video-container">
                        <iframe src="https://www.youtube.com/embed/BwOW3MkqaKc" title="LamaStudio Video" allowfullscreen></iframe>
                    </div>

                    <a href=\"/boards\" class="btn-feature-action btn-feature-yellow">Our Softwares</a>

                    <div class="live-news-box">
                        <h5>Live Updates</h5>
                    </div>

                    <div class="social-links-row">
                        <a href="https://web.facebook.com/lamastudiopk/" target="_blank" class="btn-social-sm">📘 Facebook</a>
                        <a href="https://www.youtube.com/channel/UCi1w07U76CVSjA9yuJArxEQ" target="_blank" class="btn-social-sm">▶ YouTube</a>
                    </div>
                </div>

            </div>
        </div>

        <div class="ad-slot" role="complementary" aria-label="Advertisement">
            <ins class="adsbygoogle"
                 style="display:block;width:100%;height:90px"
                 data-ad-client="ca-pub-4212196297960637"
                 data-ad-slot="YOUR_AD_SLOT_ID"
                 data-ad-format="horizontal"></ins>
        </div>

        <h2 class="section-title">Our Apps</h2>
        <div class="app-grid">

            <a href="apps/lamavpnpro/" class="app-card" data-app="vpn">
                <div class="app-card-header">
                    <div class="app-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div class="app-title-area">
                        <h3>LamaVPN Pro</h3>
                        <span class="app-version" style="color: #5EE8C5;">v1.0</span>
                    </div>
                </div>
                <p>A WireGuard-based VPN built around a hardware-backed keystore, with a clear free tier and no dark patterns around your traffic.</p>
                <div class="app-tags">
                    <span class="app-tag">WireGuard</span>
                    <span class="app-tag">Privacy-first</span>
                    <span class="app-tag">Freemium</span>
                </div>
                <span class="app-card-cta" style="color: #5EE8C5;">View app →</span>
            </a>

            <a href="apps/lamasky/" class="app-card" data-app="sky">
                <div class="app-card-header">
                    <div class="app-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
                    </div>
                    <div class="app-title-area">
                        <h3>LamaSky</h3>
                        <span class="app-version" style="color: #38bdf8;">v1.0</span>
                    </div>
                </div>
                <p>Real-time weather forecasting and atmospheric tracking, offering hyper-local meteorological updates with low battery overhead.</p>
                <div class="app-tags">
                    <span class="app-tag">Weather</span>
                    <span class="app-tag">Live Radar</span>
                    <span class="app-tag">Hyper-local</span>
                </div>
                <span class="app-card-cta" style="color: #38bdf8;">View app →</span>
            </a>

            <a href="apps/lamaiqmaster/" class="app-card" data-app="iq">
                <div class="app-card-header">
                    <div class="app-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 3.44-2.14z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-3.44-2.14z"/></svg>
                    </div>
                    <div class="app-title-area">
                        <h3>LamaIQMaster</h3>
                        <span class="app-version" style="color: #a855f7;">v1.0</span>
                    </div>
                </div>
                <p>A bilingual practice app for grades 1–5 that adjusts its difficulty to each child, in Urdu and English.</p>
                <div class="app-tags">
                    <span class="app-tag">Grades 1–5</span>
                    <span class="app-tag">Bilingual</span>
                    <span class="app-tag">Adaptive</span>
                </div>
                <span class="app-card-cta" style="color: #a855f7;">View app →</span>
            </a>

            <a href="apps/lamamulticalendar/" class="app-card" data-app="calendar">
                <div class="app-card-header">
                    <div class="app-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    <div class="app-title-area">
                        <h3>LamaMultiCalendar</h3>
                        <span class="app-version" style="color: #fbbf24;">v1.0</span>
                    </div>
                </div>
                <p>A comprehensive calendar app integrating Gregorian, Hijri, and Nanakshahi date tracking with customizable home-screen widgets.</p>
                <div class="app-tags">
                    <span class="app-tag">Multi-calendar</span>
                    <span class="app-tag">Widgets</span>
                    <span class="app-tag">RTL Support</span>
                </div>
                <span class="app-card-cta" style="color: #fbbf24;">View app →</span>
            </a>

            <a href="apps/lamaphotoresizer/" class="app-card" data-app="resizer">
                <div class="app-card-header">
                    <div class="app-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                    <div class="app-title-area">
                        <h3>LamaPhotoResizer</h3>
                        <span class="app-version" style="color: #f472b6;">v1.0</span>
                    </div>
                </div>
                <p>A fast, lightweight utility to batch compress, resize, and convert images locally on your device without losing visual clarity.</p>
                <div class="app-tags">
                    <span class="app-tag">Batch Processing</span>
                    <span class="app-tag">Compression</span>
                    <span class="app-tag">Lightweight</span>
                </div>
                <span class="app-card-cta" style="color: #f472b6;">View app →</span>
            </a>

            <a href="apps/lamapark/" class="app-card" data-app="park">
                <div class="app-card-header">
                    <div class="app-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>
                    </div>
                    <div class="app-title-area">
                        <h3>LamaPark</h3>
                        <span class="app-version" style="color: #f97316;">v1.0</span>
                    </div>
                </div>
                <p>Smart vehicle parking locator and timer utility designed to save your exact spot, track rates, and manage space efficiently.</p>
                <div class="app-tags">
                    <span class="app-tag">Location Pin</span>
                    <span class="app-tag">Parking Timer</span>
                    <span class="app-tag">Offline Map</span>
                </div>
                <span class="app-card-cta" style="color: #f97316;">View app →</span>
            </a>

            <a href="apps/lamasync/" class="app-card" data-app="sync">
                <div class="app-card-header">
                    <div class="app-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.73-5.73"/></svg>
                    </div>
                    <div class="app-title-area">
                        <h3>LamaSync</h3>
                        <span class="app-version" style="color: #818cf8;">v1.0</span>
                    </div>
                </div>
                <p>Secure peer-to-peer file synchronization and backup utility for sharing documents and media instantly across local devices.</p>
                <div class="app-tags">
                    <span class="app-tag">P2P Share</span>
                    <span class="app-tag">Encrypted</span>
                    <span class="app-tag">Fast Transfer</span>
                </div>
                <span class="app-card-cta" style="color: #818cf8;">View app →</span>
            </a>

            <a href="apps/lamastore/" class="app-card" data-app="store">
                <div class="app-card-header">
                    <div class="app-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    </div>
                    <div class="app-title-area">
                        <h3>LamaStore</h3>
                        <span class="app-version" style="color: #14b8a6;">v1.0</span>
                    </div>
                </div>
                <p>The official independent distribution portal for discovering and updating all LamaStudio applications with minimal footprint.</p>
                <div class="app-tags">
                    <span class="app-tag">App Hub</span>
                    <span class="app-tag">Auto Updates</span>
                    <span class="app-tag">Lightweight</span>
                </div>
                <span class="app-card-cta" style="color: #14b8a6;">View app →</span>
            </a>

        </div>
        <footer class="site-footer">
            <span>&copy; 2026 LamaStudio. All rights reserved.</span>
            <nav>
                <a href=\"/about\">About</a>
            </nav>
        </footer>
    </main>
</div>

<!-- JavaScript to automatically rotate app screenshots and update overlay text -->
<script>
    document.addEventListener("DOMContentLoaded", function() {
        const screenshots = document.querySelectorAll(".app-screenshot");
        const appNameOverlay = document.getElementById("flipperAppName");
        let currentIndex = 0;

        if (screenshots.length > 0) {
            setInterval(() => {
                screenshots[currentIndex].classList.remove("active");
                currentIndex = (currentIndex + 1) % screenshots.length;
                screenshots[currentIndex].classList.add("active");
                
                if (appNameOverlay) {
                    appNameOverlay.textContent = screenshots[currentIndex].getAttribute("data-name");
                }
            }, 3000);
        }
    });
</script>

</body>
</html>
<x-ask-lama />
<x-ask-lama />
