<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Educational Services — Official Boards Directory | LamaStudio</title>
<link rel="stylesheet" href=\"{{ asset(\"style.css\") }}\">
<style>
.boards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
    margin-top: 1rem;
    margin-bottom: 2rem;
}
.board-card {
    background: #141c28;
    border-radius: 10px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: 0.2s ease;
}
.board-card h3 {
    color: #ffffff;
    font-size: 0.9rem;
    margin: 0 0 8px 0;
}
.board-actions {
    display: flex;
    gap: 6px;
}
.board-link-badge {
    flex: 1;
    padding: 6px 4px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    text-align: center;
    text-decoration: none;
    transition: 0.2s ease;
    border: none;
    cursor: pointer;
}

/* Ad Banner Styles */
.ad-banner-container {
    background: #141c28;
    border: 1px dashed rgba(251, 191, 36, 0.4);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    margin-bottom: 1.5rem;
    color: #94a3b8;
    font-size: 0.85rem;
}

/* Unique Board Colors */
.card-dgkhan { border: 1px solid rgba(251, 191, 36, 0.4); }
.card-dgkhan:hover { border-color: #fbbf24; box-shadow: 0 0 15px rgba(251, 191, 36, 0.2); transform: translateY(-2px); }
.card-dgkhan .board-link-badge { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
.card-dgkhan .board-link-badge:hover { background: #fbbf24; color: #0b0f19; }

.card-lahore { border: 1px solid rgba(59, 130, 246, 0.4); }
.card-lahore:hover { border-color: #3b82f6; box-shadow: 0 0 15px rgba(59, 130, 246, 0.2); transform: translateY(-2px); }
.card-lahore .board-link-badge { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
.card-lahore .board-link-badge:hover { background: #3b82f6; color: #ffffff; }

.card-rawalpindi { border: 1px solid rgba(168, 85, 247, 0.4); }
.card-rawalpindi:hover { border-color: #a855f7; box-shadow: 0 0 15px rgba(168, 85, 247, 0.2); transform: translateY(-2px); }
.card-rawalpindi .board-link-badge { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
.card-rawalpindi .board-link-badge:hover { background: #a855f7; color: #ffffff; }

.card-faisalabad { border: 1px solid rgba(236, 72, 153, 0.4); }
.card-faisalabad:hover { border-color: #ec4899; box-shadow: 0 0 15px rgba(236, 72, 153, 0.2); transform: translateY(-2px); }
.card-faisalabad .board-link-badge { background: rgba(236, 72, 153, 0.15); color: #f472b6; }
.card-faisalabad .board-link-badge:hover { background: #ec4899; color: #ffffff; }

.card-multan { border: 1px solid rgba(34, 197, 94, 0.4); }
.card-multan:hover { border-color: #22c55e; box-shadow: 0 0 15px rgba(34, 197, 94, 0.2); transform: translateY(-2px); }
.card-multan .board-link-badge { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
.card-multan .board-link-badge:hover { background: #22c55e; color: #0b0f19; }

.card-bahawalpur { border: 1px solid rgba(249, 115, 22, 0.4); }
.card-bahawalpur:hover { border-color: #f97316; box-shadow: 0 0 15px rgba(249, 115, 22, 0.2); transform: translateY(-2px); }
.card-bahawalpur .board-link-badge { background: rgba(249, 115, 22, 0.15); color: #fb923c; }
.card-bahawalpur .board-link-badge:hover { background: #f97316; color: #ffffff; }

.card-gujranwala { border: 1px solid rgba(14, 165, 233, 0.4); }
.card-gujranwala:hover { border-color: #0ea5e9; box-shadow: 0 0 15px rgba(14, 165, 233, 0.2); transform: translateY(-2px); }
.card-gujranwala .board-link-badge { background: rgba(14, 165, 233, 0.15); color: #38bdf8; }
.card-gujranwala .board-link-badge:hover { background: #0ea5e9; color: #0b0f19; }

.card-sargodha { border: 1px solid rgba(234, 179, 8, 0.4); }
.card-sargodha:hover { border-color: #eab308; box-shadow: 0 0 15px rgba(234, 179, 8, 0.2); transform: translateY(-2px); }
.card-sargodha .board-link-badge { background: rgba(234, 179, 8, 0.15); color: #facc15; }
.card-sargodha .board-link-badge:hover { background: #eab308; color: #0b0f19; }

.card-sahiwal { border: 1px solid rgba(20, 184, 166, 0.4); }
.card-sahiwal:hover { border-color: #14b8a6; box-shadow: 0 0 15px rgba(20, 184, 166, 0.2); transform: translateY(-2px); }
.card-sahiwal .board-link-badge { background: rgba(20, 184, 166, 0.15); color: #2dd4bf; }
.card-sahiwal .board-link-badge:hover { background: #14b8a6; color: #0b0f19; }

.card-fbise { border: 1px solid rgba(225, 29, 72, 0.4); }
.card-fbise:hover { border-color: #e11d48; box-shadow: 0 0 15px rgba(225, 29, 72, 0.2); transform: translateY(-2px); }
.card-fbise .board-link-badge { background: rgba(225, 29, 72, 0.15); color: #fb7185; }
.card-fbise .board-link-badge:hover { background: #e11d48; color: #ffffff; }

.card-hec { border: 1px solid rgba(115, 115, 115, 0.4); }
.card-hec:hover { border-color: #737373; box-shadow: 0 0 15px rgba(115, 115, 115, 0.2); transform: translateY(-2px); }
.card-hec .board-link-badge { background: rgba(115, 115, 115, 0.15); color: #d4d4d4; }
.card-hec .board-link-badge:hover { background: #737373; color: #ffffff; }

.section-subtitle {
    color: #94a3b8;
    font-size: 0.9rem;
    margin-bottom: 1rem;
}
</style>
</head>
<body>

<div class="topbar">
    <a href="/" class="brand"><span class="brand-mark">L</span>LamaStudio</a>
    <div class="topbar-links">
        <a href="/">Home</a>
        <a href=\"/boards\" style="color: #fbbf24; font-weight: 600;">Educational Services</a>
        <a href=\"/portal\">Student Portal</a>
    </div>
</div>

<div class="layout">
    <aside class="sidebar">
        <a href="/" class="brand"><span class="brand-mark">L</span>LamaStudio</a>

        <nav class="nav-group">
            <span class="nav-label">Store</span>
            <a href="/" class="nav-link">Home</a>
            <a href=\"/boards\" class="nav-link active" style="background-color: #fbbf24; color: #0f172a; font-weight: 600;">Educational Services</a>
            <a href=\"/portal\" class="nav-link">Student Portal</a>
            <a href=\"/services\" class="nav-link">Services</a>
            <a href=\"/about\" class="nav-link">About</a>
        </nav>

        <div class="sidebar-footer">
            LamaStudio<br>
            DG Khan, Pakistan<br>
            &copy; 2026 lamastudio.pk
        </div>
    </aside>

    <main class="content">
        <h1 style="color: #ffffff; margin-bottom: 0.3rem; font-size: 1.5rem;">Educational Services & Board Portals</h1>
        <p class="section-subtitle">Select any educational board below to check latest annual/supple results, admissions, and exam schedules directly on their official website.</p>

        <!-- Top Ad Banner Space -->
        <div class="ad-banner-container">
            <span>Advertisement Banner Space (Paste your AdSense / Banner code here)</span>
        </div>

        <h2 style="color: #fbbf24; font-size: 1rem; margin-top: 1rem;">Punjab Intermediate & Secondary Education Boards</h2>
        <div class="boards-grid">
            
            <div class="board-card card-dgkhan">
                <h3>BISE DG Khan</h3>
                <div class="board-actions">
                    <a href="https://bisedgkhan.edu.pk" target="_blank" rel="noopener" class="board-link-badge">Matric</a>
                    <a href="https://bisedgkhan.edu.pk" target="_blank" rel="noopener" class="board-link-badge">Inter</a>
                </div>
            </div>

            <div class="board-card card-lahore">
                <h3>BISE Lahore</h3>
                <div class="board-actions">
                    <a href="https://result.biselahore.com" target="_blank" rel="noopener" class="board-link-badge">Matric</a>
                    <a href="https://result.biselahore.com" target="_blank" rel="noopener" class="board-link-badge">Inter</a>
                </div>
            </div>

            <div class="board-card card-rawalpindi">
                <h3>BISE Rawalpindi</h3>
                <div class="board-actions">
                    <a href="https://www.biserwp.edu.pk" target="_blank" rel="noopener" class="board-link-badge">Matric</a>
                    <a href="https://www.biserwp.edu.pk" target="_blank" rel="noopener" class="board-link-badge">Inter</a>
                </div>
            </div>

            <div class="board-card card-faisalabad">
                <h3>BISE Faisalabad</h3>
                <div class="board-actions">
                    <a href="https://www.bisefsd.edu.pk" target="_blank" rel="noopener" class="board-link-badge">Matric</a>
                    <a href="https://www.bisefsd.edu.pk" target="_blank" rel="noopener" class="board-link-badge">Inter</a>
                </div>
            </div>

            <div class="board-card card-multan">
                <h3>BISE Multan</h3>
                <div class="board-actions">
                    <a href="https://www.bisemultan.edu.pk" target="_blank" rel="noopener" class="board-link-badge">Matric</a>
                    <a href="https://www.bisemultan.edu.pk" target="_blank" rel="noopener" class="board-link-badge">Inter</a>
                </div>
            </div>

            <div class="board-card card-bahawalpur">
                <h3>BISE Bahawalpur</h3>
                <div class="board-actions">
                    <a href="https://www.bisebwp.edu.pk" target="_blank" rel="noopener" class="board-link-badge">Matric</a>
                    <a href="https://www.bisebwp.edu.pk" target="_blank" rel="noopener" class="board-link-badge">Inter</a>
                </div>
            </div>

            <div class="board-card card-gujranwala">
                <h3>BISE Gujranwala</h3>
                <div class="board-actions">
                    <a href="https://www.bisegujranwala.edu.pk" target="_blank" rel="noopener" class="board-link-badge">Matric</a>
                    <a href="https://www.bisegujranwala.edu.pk" target="_blank" rel="noopener" class="board-link-badge">Inter</a>
                </div>
            </div>

            <div class="board-card card-sargodha">
                <h3>BISE Sargodha</h3>
                <div class="board-actions">
                    <a href="https://www.bisesargodha.edu.pk" target="_blank" rel="noopener" class="board-link-badge">Matric</a>
                    <a href="https://www.bisesargodha.edu.pk" target="_blank" rel="noopener" class="board-link-badge">Inter</a>
                </div>
            </div>

            <div class="board-card card-sahiwal">
                <h3>BISE Sahiwal</h3>
                <div class="board-actions">
                    <a href="https://bisesahiwal.edu.pk/allresult/" target="_blank" rel="noopener" class="board-link-badge">Matric</a>
                    <a href="https://bisesahiwal.edu.pk/allresult/" target="_blank" rel="noopener" class="board-link-badge">Inter</a>
                </div>
            </div>
        </div>

        <h2 style="color: #fbbf24; font-size: 1rem; margin-top: 1.5rem;">Federal & Higher Education Portals</h2>
        <div class="boards-grid">
            <div class="board-card card-fbise">
                <h3>FBISE Islamabad</h3>
                <div class="board-actions">
                    <a href="https://www.fbise.edu.pk" target="_blank" rel="noopener" class="board-link-badge">Matric</a>
                    <a href="https://www.fbise.edu.pk" target="_blank" rel="noopener" class="board-link-badge">Inter</a>
                </div>
            </div>

            <div class="board-card card-hec">
                <h3>HEC Pakistan</h3>
                <div class="board-actions">
                    <a href="https://www.hec.gov.pk" target="_blank" rel="noopener" class="board-link-badge" style="width: 100%;">Official Portal</a>
                </div>
            </div>
        </div>

        <footer class="site-footer" style="margin-top: 2rem;">
            <span>&copy; 2026 LamaStudio. All rights reserved.</span>
            <nav>
                <a href="/">Home</a> ·
                <a href=\"/portal\">Student Portal</a> ·
                <a href=\"/about\">About</a>
            </nav>
        </footer>
    </main>
</div>

</body>
</html>
