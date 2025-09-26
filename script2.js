// --- SCRIPT 2: UI, VIEW MANAGEMENT, AND TEMPLATES (Mobile-Ready with Visual Fixes) ---

// --- VIEW TEMPLATES ---
function getTemplateForView(view) {
    const templates = {
        home: `
            <div class="home-cards-container">
                <div class="home-card" id="liked-songs-card">
                    <div class="icon"><i class="fas fa-heart"></i></div>
                    <div class="text"><h3>Liked Songs</h3><p>Your favorite tracks</p></div>
                </div>
                <div class="home-card" id="create-playlist-card">
                    <div class="icon"><i class="fas fa-plus"></i></div>
                    <div class="text"><h3>New Playlist</h3><p>Organize your music</p></div>
                </div>
            </div>
            <header class="dashboard-header">
                <h2 id="view-title">Library</h2>
            </header>
            <div class="header-actions">
                <div class="search-container">
                    <input type="text" id="search-input" placeholder="Search library...">
                </div>
                <button id="ai-playlist-btn" class="action-button secondary" title="AI Playlist"><i class="fas fa-wand-magic-sparkles"></i></button>
                <button id="add-music-btn" class="action-button" title="Add Music"><i class="fas fa-plus"></i></button>
            </div>
            <input type="file" id="file-input" multiple accept="audio/*" hidden>
            <ul id="track-list"></ul>`,
        'yt-to-mp3': `
            <header class="dashboard-header"><h2>YT to MP3</h2></header>
            <div class="yt-view-container">
                <div class="yt-main-content">
                    <div class="yt-input-container">
                        <input type="text" id="yt-url-input" placeholder="Paste a YouTube video link...">
                        <button id="yt-load-btn" class="action-button">Load</button>
                    </div>
                    <div class="yt-player-wrapper">
                        <div id="yt-player-container"></div>
                        <div class="yt-placeholder" id="yt-placeholder">
                            <i class="fab fa-youtube"></i>
                            <p>Video player will appear here</p>
                        </div>
                    </div>
                    <div class="yt-info-and-controls" id="yt-info-and-controls" style="display: none;">
                         <div class="yt-video-info">
                            <h3 id="yt-video-title">Video Title</h3>
                            <p id="yt-video-author">Author</p>
                         </div>
                         <div class="yt-actions-container">
                            <button class="action-button" id="yt-add-to-library-btn"><i class="fas fa-plus"></i> Add & Play</button>
                            <button class="action-button secondary" id="yt-download-btn"><i class="fas fa-download"></i> Get MP3</button>
                         </div>
                    </div>
                </div>
                <div class="yt-history-sidebar">
                    <h3>History</h3>
                    <ul id="yt-history-list"></ul>
                </div>
            </div>`,
        'ai-assistant': `
             <header class="dashboard-header"><h2>AI Assistant</h2></header>
             <div class="ai-assistant-container">
                 <div id="chat-messages">
                     <div class="chat-message assistant">
                         <div class="avatar"><i class="fas fa-robot"></i></div>
                         <div class="content">
                            Hello! I'm Aura's AI assistant. Ask me to create a playlist, find music, or tell you about a song.
                         </div>
                     </div>
                 </div>
                 <div id="chat-input-container">
                     <input type="text" id="ai-chat-input" placeholder="Message Aura AI...">
                     <button id="ai-chat-send-btn" class="action-button"><i class="fas fa-paper-plane"></i></button>
                 </div>
             </div>
            `,
        controls: `
            <header class="dashboard-header"><h2>Settings</h2></header>
            <div class="controls-container">
                <div class="setting-row-group">
                    <h3 class="settings-section-title">General</h3>
                    <div class="setting-row">
                        <span>Dynamic Island Notifications</span>
                        <label class="toggle-switch"><input type="checkbox" id="toggle-dynamic-island"><span class="slider"></span></label>
                    </div>
                    <div class="setting-row">
                        <span>Enable All Messages</span>
                        <label class="toggle-switch"><input type="checkbox" id="toggle-messages"><span class="slider"></span></label>
                    </div>
                </div>
                <div class="setting-row-group">
                    <h3 class="settings-section-title">AI Features</h3>
                     <div class="setting-row">
                        <span>Enable AI DJ Transitions</span>
                        <label class="toggle-switch"><input type="checkbox" id="toggle-ai-dj"><span class="slider"></span></label>
                        <small>Let the AI announce the next track like a radio DJ.</small>
                     </div>
                </div>
                <div class="setting-row-group">
                    <h3 class="settings-section-title">Performance & Appearance</h3>
                    <div class="setting-row">
                        <span>App Title Glow Effect</span>
                        <label class="toggle-switch"><input type="checkbox" id="toggle-title-glow"><span class="slider"></span></label>
                    </div>
                    <div class="setting-row">
                        <span>Music Visualizer</span>
                        <label class="toggle-switch"><input type="checkbox" id="toggle-music-visualizer"><span class="slider"></span></label>
                        <small>Animated frequency bars in the player.</small>
                    </div>
                    <div class="setting-row">
                        <span>Advanced Visual Effects</span>
                        <label class="toggle-switch"><input type="checkbox" id="toggle-visual-effects"><span class="slider"></span></label>
                        <small>Disables blur and other effects for speed.</small>
                    </div>
                </div>
            </div>`,
        theme: `
            <header class="dashboard-header"><h2>Theme Customizer</h2></header>
            <div class="theme-customizer-container">
                <div class="theme-section">
                    <h3>Base Theme</h3>
                    <div id="theme-selection-container" class="theme-selection-container"></div>
                </div>
                <div class="theme-section">
                    <h3>Appearance</h3>
                    <div class="custom-slider-container">
                        <label for="anim-speed-slider">Animation Speed</label>
                        <input type="range" id="anim-speed-slider" min="0.5" max="1.5" step="0.1" value="1">
                        <span id="anim-speed-value">1.0s</span>
                    </div>
                    <div class="custom-slider-container">
                        <label for="color-intensity-slider">Color Intensity</label>
                        <input type="range" id="color-intensity-slider" min="50" max="150" step="1" value="100">
                        <span id="color-intensity-value">100%</span>
                    </div>
                </div>
                <div class="theme-section">
                     <h3>Custom Background</h3>
                     <div class="background-controls">
                         <input type="file" id="bg-upload-input" hidden accept="image/*">
                         <button id="upload-bg-btn" class="action-button"><i class="fas fa-upload"></i> Upload</button>
                         <button id="clear-bg-btn" class="action-button secondary"><i class="fas fa-trash"></i> Clear</button>
                     </div>
                     <div class="custom-slider-container">
                         <label for="bg-blur-slider">Background Blur</label>
                         <input type="range" id="bg-blur-slider" min="0" max="20" step="1" value="5">
                         <span id="bg-blur-value">5px</span>
                     </div>
                </div>
            </div>
            `,
        account: `
            <header class="dashboard-header"><h2>Account</h2></header>
            <div class="account-view-container">
                <div class="account-profile-card">
                    <div class="profile-pic-container">
                        <img id="profile-pic-img" src="https://placehold.co/100x100/2a2a3a/e0e0e0?text=A" alt="Profile Picture">
                        <input type="file" id="profile-pic-upload" hidden accept="image/*">
                        <label for="profile-pic-upload" class="edit-pic-btn" title="Change profile picture"><i class="fas fa-camera"></i></label>
                    </div>
                    <div class="profile-details">
                         <input type="text" id="account-name" placeholder="Your Name">
                         <input type="email" id="account-email" placeholder="Your Email (Optional)" readonly>
                         <button id="save-profile-btn" class="action-button">Save Profile</button>
                    </div>
                </div>
                <div class="account-backend-card">
                     <h3>Cloud Storage Sync</h3>
                     <p id="gdrive-disconnected-message">Connect your Google Drive to sync your music and playlists.</p>
                     <div class="backend-controls">
                         <span id="drive-status" class="status-disconnected">Disconnected</span>
                         <button id="gdrive-connect-btn" class="action-button" disabled>Loading...</button>
                         <button id="gdrive-sync-btn" class="action-button secondary" disabled><i class="fas fa-sync-alt"></i></button>
                     </div>
                </div>
            </div>`,
        player: `
            <div class="player-view-wrapper">
                <div class="player-main">
                    <canvas id="visualizer-canvas" width="280" height="280"></canvas>
                    <div class="player-track-info">
                        <div class="title">No song selected</div>
                        <div class="artist">Select a song to play</div>
                    </div>
                    <div class="player-controls-backdrop">
                        <div class="player-ai-actions">
                            <button id="ai-lyrics-btn" title="Get Lyrics"><i class="fas fa-microphone-alt"></i> Lyrics</button>
                            <button id="ai-insights-btn" title="Get Song Insights"><i class="fas fa-lightbulb"></i> Insights</button>
                        </div>
                        <div class="player-controls-group">
                            <div class="progress-container">
                                <span id="current-time">0:00</span>
                                <input type="range" id="progress-bar" value="0" step="1">
                                <span id="total-duration">0:00</span>
                            </div>
                            <div class="main-controls">
                                <div class="buttons">
                                    <button id="shuffle-btn" title="Shuffle"><i class="fas fa-shuffle"></i></button>
                                    <button id="prev-btn" title="Previous"><i class="fas fa-backward-step"></i></button>
                                    <button id="play-pause-btn" title="Play"><i class="fas fa-play"></i></button>
                                    <button id="next-btn" title="Next"><i class="fas fa-forward-step"></i></button>
                                    <button id="repeat-btn" title="Repeat"><i class="fas fa-repeat"></i></button>
                                </div>
                            </div>
                            <div class="secondary-controls">
                                <div class="volume-container">
                                    <button id="volume-btn" title="Mute"><i class="fas fa-volume-high"></i></button>
                                    <input type="range" id="volume-slider" min="0" max="1" step="0.01" value="1">
                                </div>
                                <div class="eq-container">
                                    <button id="eq-btn" title="Equalizer"><i class="fas fa-sliders"></i></button>
                                    <div class="eq-panel" id="eq-panel">
                                        <div class="eq-sliders-container">
                                            <div class="eq-slider-wrapper"><label>Bass</label><input type="range" id="eq-low-slider" class="eq-slider" min="-10" max="10" step="1" value="0"></div>
                                            <div class="eq-slider-wrapper"><label>Mids</label><input type="range" id="eq-mid-slider" class="eq-slider" min="-10" max="10" step="1" value="0"></div>
                                            <div class="eq-slider-wrapper"><label>Treble</label><input type="range" id="eq-high-slider" class="eq-slider" min="-10" max="10" step="1" value="0"></div>
                                        </div>
                                        <div class="eq-presets-container"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="player-queue-container">
                    <h3>Up Next</h3>
                    <ul id="player-queue-list"></ul>
                </div>
            </div>`
    };
    return templates[view] || `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Content not available.</p></div>`;
}

function updateTopBarTitle(view) {
    const titleMap = {
        home: 'Home',
        'yt-to-mp3': 'YT to MP3',
        'ai-assistant': 'AI Assistant',
        controls: 'Settings',
        theme: 'Theme',
        account: 'Account'
    };
    const titleEl = document.getElementById('current-view-title');
    if (titleEl) {
        titleEl.textContent = titleMap[view] || 'AURA';
    }
}

function updateActiveNav(view) {
    dom.navItems.forEach(navItem => {
        navItem.classList.toggle('active', navItem.dataset.view === view);
    });
}

async function renderCurrentView() {
    updateActiveNav(state.currentView);
    updateTopBarTitle(state.currentView);
    
    return new Promise(resolve => {
        const isTrackLoaded = !!dom.audioPlayer.src;
        
        if (state.animationFrameId && state.currentView !== 'player') {
            cancelAnimationFrame(state.animationFrameId);
            state.animationFrameId = null;
        }

        if (state.ytPlayer && state.currentView !== 'yt-to-mp3') {
             state.ytPlayer.stopVideo();
        }

        if (state.currentView !== 'player' && (isTrackLoaded && state.currentIndex > -1)) {
            dom.topBar.classList.add('player-active-nav');
        } else {
            dom.topBar.classList.remove('player-active-nav');
        }
        
        dom.auraScreenContainer.classList.remove('player-active');
        if (state.currentView !== 'player') {
            dom.auraScreenContainer.style.backgroundImage = 'none';
        }

        const html = getTemplateForView(state.currentView);
        dom.viewContent.innerHTML = html;
        setTimeout(() => {
            if (state.currentView === 'home') initHomeView();
            else if (state.currentView === 'controls') initControlsView();
            else if (state.currentView === 'account') initAccountView();
            else if (state.currentView === 'yt-to-mp3') initYtToMp3View();
            else if (state.currentView === 'theme') initThemeView();
            else if (state.currentView === 'ai-assistant') initAiAssistantView();
            else if (state.currentView === 'player') {
                initMusicPlayerView();
                if (state.isPlaying && state.settings.musicVisualizer && !state.animationFrameId) {
                    drawVisualizer();
                }
            }
            resolve();
        }, 50);
    });
}

function initHomeView() {
    dynamicDom.trackList = document.getElementById('track-list');
    dynamicDom.viewTitle = document.getElementById('view-title');
    document.getElementById('add-music-btn').addEventListener('click', () => document.getElementById('file-input').click());
    document.getElementById('file-input').addEventListener('change', e => handleFiles(e.target.files));
    document.getElementById('ai-playlist-btn').addEventListener('click', () => openCreatePlaylistModal(true));
    
    const searchInput = document.getElementById('search-input');
    if(searchInput) searchInput.addEventListener('input', renderTrackList);
    
    if(dynamicDom.trackList) dynamicDom.trackList.addEventListener('click', handleTrackListClick);
    
    document.getElementById('liked-songs-card').addEventListener('click', () => {
        state.currentTracklistSource = { type: 'playlist', name: 'Liked Songs' };
        renderTrackList();
    });
    
    if(dynamicDom.viewTitle) dynamicDom.viewTitle.addEventListener('click', () => {
        if (state.currentTracklistSource.type !== 'library') {
            state.currentTracklistSource = { type: 'library', name: 'Library' };
            renderTrackList();
        }
    });

    document.getElementById('create-playlist-card').addEventListener('click', () => openCreatePlaylistModal(false));

    renderTrackList();
}

function initControlsView() {
    const toggles = {
        'toggle-dynamic-island': 'dynamicIsland',
        'toggle-title-glow': 'titleGlow',
        'toggle-messages': 'showMessages',
        'toggle-visual-effects': 'visualEffects',
        'toggle-music-visualizer': 'musicVisualizer',
        'toggle-ai-dj': 'aiDjEnabled',
    };

    Object.entries(toggles).forEach(([id, key]) => {
        const toggle = document.getElementById(id);
        if (toggle) {
            toggle.checked = state.settings[key];
            toggle.addEventListener('change', (e) => {
                state.settings[key] = e.target.checked;
                if (key === 'titleGlow' && dom.appTitle) {
                    dom.appTitle.classList.toggle('title-glow', state.settings.titleGlow);
                }
                if (key === 'visualEffects') {
                    applyPerformanceMode();
                }
                if (key === 'musicVisualizer' && !e.target.checked && state.animationFrameId) {
                    cancelAnimationFrame(state.animationFrameId);
                    state.animationFrameId = null;
                    if(dynamicDom.visualizerCanvas) {
                       const ctx = dynamicDom.visualizerCanvas.getContext('2d');
                       ctx.clearRect(0,0,dynamicDom.visualizerCanvas.width, dynamicDom.visualizerCanvas.height);
                    }
                }
                saveState();
            });
        }
    });
}

function initAiAssistantView() {
    const chatInput = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-chat-send-btn');
    const chatBox = document.getElementById('chat-messages');

    const sendMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;
        
        const userMsgEl = document.createElement('div');
        userMsgEl.className = 'chat-message user';
        userMsgEl.innerHTML = `<div class="content">${message}</div>`;
        chatBox.appendChild(userMsgEl);

        chatInput.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;

        const loadingEl = document.createElement('div');
        loadingEl.className = 'chat-message assistant thinking';
        loadingEl.innerHTML = `
            <div class="avatar"><i class="fas fa-robot"></i></div>
            <div class="content">
                <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>`;
        chatBox.appendChild(loadingEl);
        chatBox.scrollTop = chatBox.scrollHeight;

        const prompt = `You are Aura, a helpful music assistant. User message: "${message}". User's library: ${JSON.stringify(state.library.map(t => ({title: t.name, artist: t.artist})))}. Be concise. If they ask to create a playlist, tell them to use the 'AI Playlist' button.`;
        const response = await callAiModel(prompt);

        loadingEl.remove();
        
        const botMsgEl = document.createElement('div');
        botMsgEl.className = 'chat-message assistant';
        
        let responseContent = (response === null) ? '⚠️ AI features are currently turned off. Click "AI Ready" to enable.' : response;

        botMsgEl.innerHTML = `
            <div class="avatar"><i class="fas fa-robot"></i></div>
            <div class="content">${responseContent}</div>`;
        chatBox.appendChild(botMsgEl);
        
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}


function initAccountView() {
    const nameInput = document.getElementById('account-name');
    const emailInput = document.getElementById('account-email');
    const profilePicImg = document.getElementById('profile-pic-img');
    const profilePicUpload = document.getElementById('profile-pic-upload');
    const editPicBtn = document.querySelector('.edit-pic-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');

    if (state.googleDriveSignedIn) {
        nameInput.value = state.googleUserName || 'Google User';
        emailInput.value = state.googleUserEmail || 'No email provided';
        profilePicImg.src = state.googleUserPicture || 'https://placehold.co/100x100/2a2a3a/e0e0e0?text=G';
        
        nameInput.readOnly = true;
        emailInput.style.display = 'block';
        editPicBtn.style.display = 'none';
        saveProfileBtn.style.display = 'none';
    } else {
        nameInput.value = state.userName;
        profilePicImg.src = state.userProfilePic || 'https://placehold.co/100x100/2a2a3a/e0e0e0?text=A';

        nameInput.readOnly = false;
        emailInput.style.display = 'none';
        editPicBtn.style.display = 'flex';
        saveProfileBtn.style.display = 'block';
    }
    
    saveProfileBtn.addEventListener('click', () => {
        state.userName = nameInput.value.trim();
        saveState();
        showToast('Profile saved!', 'success');
    });

    profilePicUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                state.userProfilePic = event.target.result;
                profilePicImg.src = state.userProfilePic;
                saveState();
            };
            reader.readAsDataURL(file);
        }
    });

    const connectBtn = document.getElementById('gdrive-connect-btn');
    connectBtn.addEventListener('click', () => {
        if (state.googleDriveSignedIn) {
            handleSignoutClick();
        } else {
            handleAuthClick();
        }
    });

    document.getElementById('gdrive-sync-btn').addEventListener('click', syncDriveFiles);
    updateDriveStatus(state.googleDriveSignedIn);
}

function initYtToMp3View() {
    document.getElementById('yt-load-btn').addEventListener('click', handleYtLoad);
    document.getElementById('yt-add-to-library-btn').addEventListener('click', handleYtAddToLibrary);
    document.getElementById('yt-download-btn').addEventListener('click', handleYtDownload);
    renderYtHistory();
}

async function handleYtDownload() {
    if (!state.currentYtInfo.id) {
        showToast("Please load a video first", "error");
        return;
    }
    showToast(`Preparing download for "${state.currentYtInfo.title}"...`, 'info');
    try {
        const info = await ytdl.getInfo(state.currentYtInfo.id);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
        if (!format || !format.url) throw new Error("No suitable audio format found.");
        const a = document.createElement('a');
        a.href = format.url;
        const cleanTitle = info.videoDetails.title.replace(/[\\/:"*?<>|]/g, '');
        a.download = `${cleanTitle}.mp3`; 
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('Download started!', 'success');
    } catch (err) {
        console.error("YouTube Download Error:", err);
        showToast(`Download failed: ${err.message}`, "error");
    }
}

function getYtVideoId(url) {
    let videoId = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') videoId = urlObj.pathname.slice(1);
        else if (urlObj.hostname.includes('youtube.com')) videoId = urlObj.searchParams.get('v');
    } catch(e) {}
    if (!videoId) { 
        const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (match && match[1]) videoId = match[1];
    }
    return videoId;
}

function handleYtLoad() {
    const url = document.getElementById('yt-url-input').value;
    const videoId = getYtVideoId(url);
    if (!videoId) {
        showToast("Please enter a valid YouTube URL.", "error");
        return;
    }
    state.currentYtInfo.id = videoId;
    document.getElementById('yt-placeholder').style.display = 'none';
    if (state.ytPlayer && typeof state.ytPlayer.loadVideoById === 'function') {
        state.ytPlayer.loadVideoById(videoId);
    } else {
        createYtPlayer(videoId);
    }
}

async function handleYtAddToLibrary() {
    if (!state.currentYtInfo.id) {
        showToast("Please load a video first", "error");
        return;
    }
    const newTrack = {
        id: `yt-${state.currentYtInfo.id}`,
        name: state.currentYtInfo.title,
        artist: state.currentYtInfo.author,
        source: 'youtube',
        thumbnail: `https://i.ytimg.com/vi/${state.currentYtInfo.id}/hqdefault.jpg`,
    };
    if (!state.library.some(track => track.id === newTrack.id)) {
        state.library.push(newTrack);
        showToast(`Added "${newTrack.name}" to library!`, 'success');
        saveState();
        if (state.currentView === 'home') renderTrackList();
    } else {
        showToast(`"${newTrack.name}" is already in your library.`, 'info');
    }
    const trackIndex = state.library.findIndex(t => t.id === newTrack.id);
    if (trackIndex > -1) {
        setQueue(state.library, trackIndex);
        playTrack();
    }
}

function createYtPlayer(videoId) {
    if (dom.audioPlayer.src) dom.audioPlayer.pause();
    if (state.ytPlayer && typeof state.ytPlayer.destroy === 'function') state.ytPlayer.destroy();
    state.ytPlayer = new YT.Player('yt-player-container', {
        height: '100%', width: '100%', videoId: videoId,
        playerVars: { 'playsinline': 1, 'autoplay': 1, 'controls': 1, 'rel': 0, 'modestbranding': 1, 'showinfo': 0 },
        events: { 'onReady': onYtPlayerReady }
    });
}

function onYtPlayerReady(event) {
    const playerData = event.target.getVideoData();
    state.currentYtInfo.title = playerData.title;
    state.currentYtInfo.author = playerData.author;
    document.getElementById('yt-video-title').textContent = playerData.title;
    document.getElementById('yt-video-author').textContent = playerData.author;
    document.getElementById('yt-info-and-controls').style.display = 'flex';
    const historyEntry = {
        id: playerData.video_id, title: playerData.title, author: playerData.author,
        thumbnail: `https://i.ytimg.com/vi/${playerData.video_id}/default.jpg`
    };
    state.ytHistory = state.ytHistory.filter(item => item.id !== historyEntry.id);
    state.ytHistory.unshift(historyEntry);
    if (state.ytHistory.length > 50) state.ytHistory.pop();
    saveState();
    renderYtHistory();
}

function renderYtHistory() {
    const historyList = document.getElementById('yt-history-list');
    if (!historyList) return;
    if (state.ytHistory.length === 0) {
        historyList.innerHTML = `<div class="yt-history-empty">No videos in history.</div>`;
        return;
    }
    historyList.innerHTML = state.ytHistory.map(item => `
        <li class="yt-history-item" data-id="${item.id}">
            <img src="${item.thumbnail}" alt="thumbnail">
            <div class="info">
                <span class="title">${item.title}</span>
                <span class="author">${item.author}</span>
            </div>
        </li>`).join('');
    historyList.querySelectorAll('.yt-history-item').forEach(item => {
        item.addEventListener('click', () => {
            const url = `https://www.youtube.com/watch?v=${item.dataset.id}`;
            document.getElementById('yt-url-input').value = url;
            handleYtLoad();
        });
    });
}

function initThemeView() {
    const container = document.getElementById('theme-selection-container');
    const themes = {
        'aura-default': { name: 'Aura Default', colors: ['#12121c', '#00c6ff', '#0072ff', '#e0e0e0'] },
        'theme-neon-nights': { name: 'Neon Nights', colors: ['#0d0221', '#f900f9', '#00f5ff', '#ffffff'] },
        'theme-forest-calm': { name: 'Forest Calm', colors: ['#141d1a', '#2dc46b', '#ffc857', '#f0f5f1'] },
    };
    container.innerHTML = Object.entries(themes).map(([id, {name, colors}]) => `
        <div class="theme-card ${state.settings.activeTheme === id ? 'active' : ''}" data-theme-id="${id}">
            <div class="theme-preview">
                ${colors.map(c => `<span style="background-color: ${c}"></span>`).join('')}
            </div>
            <h3>${name}</h3>
        </div>`).join('');
    container.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => {
            const themeId = card.dataset.themeId;
            applyTheme(themeId);
            container.querySelector('.theme-card.active')?.classList.remove('active');
            card.classList.add('active');
        });
    });

    const setupSlider = (sliderId, valueId, settingKey, unit) => {
        const slider = document.getElementById(sliderId);
        const valueEl = document.getElementById(valueId);
        slider.value = state.settings[settingKey];
        valueEl.textContent = `${slider.value}${unit}`;
        slider.addEventListener('input', (e) => {
            state.settings[settingKey] = e.target.value;
            valueEl.textContent = `${e.target.value}${unit}`;
            applyThemeCustomizations();
            saveState();
        });
    };
    setupSlider('anim-speed-slider', 'anim-speed-value', 'animationSpeed', 's');
    setupSlider('color-intensity-slider', 'color-intensity-value', 'colorIntensity', '%');
    setupSlider('bg-blur-slider', 'bg-blur-value', 'backgroundBlur', 'px');

    const bgInput = document.getElementById('bg-upload-input');
    document.getElementById('upload-bg-btn').addEventListener('click', () => bgInput.click());
    document.getElementById('clear-bg-btn').addEventListener('click', () => {
        state.settings.customBackground = '';
        applyThemeCustomizations();
        saveState();
        showToast('Background cleared.', 'info');
    });
    bgInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                state.settings.customBackground = event.target.result;
                applyThemeCustomizations();
                saveState();
                showToast('Background updated!', 'success');
            };
            reader.readAsDataURL(file);
        }
    });
}


function applyTheme(themeId) {
    document.body.className = themeId;
    state.settings.activeTheme = themeId;
    saveState();
}

function renderTrackList() {
    if (!dynamicDom.trackList) return;
    dynamicDom.viewTitle.textContent = state.currentTracklistSource.name;
    let tracksToShow;
    if (state.currentTracklistSource.type === 'library') {
        tracksToShow = state.library;
        dynamicDom.viewTitle.style.cursor = 'default';
    } else {
        const playlist = state.playlists[state.currentTracklistSource.name];
        const playlistTrackIds = new Set(playlist?.tracks || []);
        tracksToShow = state.library.filter(track => playlistTrackIds.has(track.id));
        dynamicDom.viewTitle.style.cursor = 'pointer';
    }
    const query = document.getElementById('search-input')?.value.toLowerCase() || '';
    if (query) {
        tracksToShow = tracksToShow.filter(track => 
            track.name.toLowerCase().includes(query) || 
            (track.artist && track.artist.toLowerCase().includes(query))
        );
    }
    if (tracksToShow.length === 0) {
        const message = state.library.length === 0 ? 'Your library is empty. Drag & drop files or use the "+" button to add music!' : `No songs in "${state.currentTracklistSource.name}".`;
        dynamicDom.trackList.innerHTML = `<div class="empty-state"><i class="fas fa-compact-disc"></i><p>${message}</p></div>`;
        return;
    }
    const likedSongIds = new Set(state.playlists['Liked Songs']?.tracks || []);
    dynamicDom.trackList.innerHTML = tracksToShow.map((track, index) => {
        const isLiked = likedSongIds.has(track.id);
        const sourceIcon = track.source === 'drive' ? 'fa-google-drive' : track.source === 'youtube' ? 'fa-youtube' : 'fa-computer';
        const sourceIconBrand = track.source !== 'local' ? 'fab' : 'fas';
        return `
            <li class="track-item" data-track-id="${track.id || ''}">
                <div class="track-number-container">
                    <span class="track-number">${index + 1}</span>
                    <i class="${sourceIconBrand} ${sourceIcon} track-source-icon" title="Source: ${track.source}"></i>
                </div>
                <div class="track-info-main">
                    <div class="track-title">${track.name.replace(/\.[^/.]+$/, "")}</div>
                    <div class="track-artist">${track.artist || 'Unknown Artist'}</div>
                </div>
                <div class="track-actions">
                    <button class="like-btn ${isLiked ? 'active' : ''}" title="Like"><i class="fas fa-heart"></i></button>
                    <button class="add-to-playlist-btn" title="Add to playlist"><i class="fas fa-ellipsis-v"></i></button>
                </div>
            </li>`;
    }).join('');
    updatePlayingTrackUI();
}

function renderRecents() {
    if (!dom.recentsList) return;
    if (state.recents.length === 0) {
        dom.recentsList.innerHTML = `<p style="padding: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">Play a song.</p>`;
        return;
    }
    dom.recentsList.innerHTML = state.recents.map(trackName =>
        `<div class="recents-list-item" data-track-name="${trackName}">${trackName.replace(/\.[^/.]+$/, "")}</div>`
    ).join('');
}

function renderPlaylists() {
    if (!dom.playlistsList) return;
    const playlistNames = Object.keys(state.playlists);
    if (playlistNames.length === 0) {
        dom.playlistsList.innerHTML = `<p style="padding: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">No playlists.</p>`;
        return;
    }
    dom.playlistsList.innerHTML = playlistNames.map(name =>
        `<div class="playlist-item" data-playlist-name="${name}"><i class="fas fa-music" style="margin-right: 0.75rem;"></i>${name}</div>`
    ).join('');
    dom.playlistsList.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', () => {
            state.currentTracklistSource = { type: 'playlist', name: item.dataset.playlistName };
            if (state.currentView !== 'home') {
                state.currentView = 'home';
                updateActiveNav('home');
                renderCurrentView();
            } else {
                renderTrackList();
            }
        });
    });
}

function updatePlayingTrackUI() {
    document.querySelectorAll('.track-item').forEach(item => item.classList.remove('playing'));
    if (state.isPlaying && state.currentIndex > -1 && state.queue[state.currentIndex]) {
        try {
            const selector = `.track-item[data-track-id="${CSS.escape(state.queue[state.currentIndex].id)}"]`;
            document.querySelector(selector)?.classList.add('playing');
        } catch (e) { console.error("Error escaping selector", e); }
    }
}

function showToast(message, type = 'info') {
    if (!state.settings.showMessages && type === 'info') return;

    const toast = document.createElement('div');
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}"></i><span>${message}</span>`;
    toast.className = `toast ${type}`;
    dom.toastContainer.appendChild(toast);

    const removeToast = () => {
        toast.classList.add('hide');
        setTimeout(() => {
            toast.remove();
        }, 300); 
    };

    if (state.settings.dynamicIsland) {
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => toast.classList.add('expand'), 300);
        setTimeout(() => toast.classList.add('glow'), 800);
        setTimeout(() => {
            toast.classList.remove('glow');
            toast.classList.remove('expand');
            setTimeout(removeToast, 500); 
        }, 4000);
    } else {
        toast.classList.add('legacy');
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(removeToast, 4000);
    }
}


// --- MODAL LOGIC ---
function openAddToPlaylistModal(track) {
    const modal = document.getElementById('add-to-playlist-modal');
    document.getElementById('modal-track-name').textContent = track.name.replace(/\.[^/.]+$/, "");
    const playlistList = document.getElementById('modal-playlist-list');
    const playlistNames = Object.keys(state.playlists);
    playlistList.innerHTML = playlistNames.length > 0
        ? playlistNames.map(name => `<li data-playlist-name="${name}">${name}</li>`).join('')
        : `<p>No playlists created yet.</p>`;
    
    const clickHandler = (e) => {
        if (e.target.tagName === 'LI') {
            const playlistName = e.target.dataset.playlistName;
            const playlist = state.playlists[playlistName];
            if (!playlist.tracks.includes(track.id)) {
                playlist.tracks.push(track.id);
                saveState();
                showToast(`Added to "${playlistName}"`, 'success');
            } else {
                showToast(`Song already in "${playlistName}"`, 'info');
            }
            closeHandler();
        }
    };
    const closeHandler = () => {
        modal.classList.remove('show');
        playlistList.removeEventListener('click', clickHandler);
        document.getElementById('cancel-add-to-playlist-btn').removeEventListener('click', closeHandler);
    };

    playlistList.addEventListener('click', clickHandler);
    document.getElementById('cancel-add-to-playlist-btn').addEventListener('click', closeHandler, { once: true });
    modal.classList.add('show');
}

function openCreatePlaylistModal(isAiMode = false) {
    const modal = document.getElementById('create-playlist-modal');
    const title = document.getElementById('create-playlist-modal-title');
    const desc = document.getElementById('create-playlist-modal-desc');
    const input = document.getElementById('new-playlist-name-modal');
    const confirmBtn = document.getElementById('confirm-create-playlist-btn');

    state.isAiPlaylistMode = isAiMode;
    if (isAiMode) {
        title.textContent = "Create with AI";
        desc.textContent = "Describe the playlist you want (e.g., 'chill lofi beats').";
        input.placeholder = "Enter AI prompt...";
        confirmBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Create';
    } else {
        title.textContent = "New Playlist";
        desc.textContent = "Enter a name for your new playlist.";
        input.placeholder = "Enter playlist name...";
        confirmBtn.innerHTML = 'Create';
    }
    
    modal.classList.add('show');
    input.focus();

    const confirmHandler = () => {
        if (state.isAiPlaylistMode) {
            handleAiPlaylistCreation();
        } else {
            const name = input.value.trim();
            if (name) {
                if (state.playlists[name]) {
                    showToast(`Playlist "${name}" already exists.`, 'error');
                } else {
                    state.playlists[name] = { name, tracks: [] };
                    saveState();
                    if (dom.playlistsList) renderPlaylists();
                    showToast(`Playlist "${name}" created!`, 'success');
                    closeHandler();
                }
            }
        }
    };
    
    const closeHandler = () => {
        input.value = '';
        modal.classList.remove('show');
        confirmBtn.onclick = null;
        document.getElementById('cancel-create-playlist-btn').onclick = null;
        input.onkeydown = null;
    };
    
    confirmBtn.onclick = confirmHandler;
    document.getElementById('cancel-create-playlist-btn').onclick = closeHandler;
    input.onkeydown = (e) => { if (e.key === 'Enter') confirmHandler(); };
}

function showConfirmation(title, message, onConfirm) {
    const modal = document.getElementById('confirmation-modal');
    document.getElementById('confirmation-title').textContent = title;
    document.getElementById('confirmation-message').textContent = message;
    modal.classList.add('show');
    const confirmBtn = document.getElementById('confirm-action-btn');
    const cancelBtn = document.getElementById('cancel-confirmation-btn');
    const confirmHandler = () => { onConfirm(); closeHandler(); };
    const closeHandler = () => { modal.classList.remove('show'); };
    confirmBtn.onclick = confirmHandler;
    cancelBtn.onclick = closeHandler;
}

function closeModalById(id) {
    document.getElementById(id)?.classList.remove('show');
}

function showAiContentModal(title) {
    const modal = document.getElementById('ai-content-modal');
    document.getElementById('ai-modal-title').textContent = title;
    document.getElementById('ai-modal-content').innerHTML = `<div class="loading-spinner"></div>`;
    document.getElementById('cancel-ai-modal-btn').onclick = hideAiContentModal;
    modal.classList.add('show');
}

function updateAiModalContent(htmlContent) {
    const contentDiv = document.getElementById('ai-modal-content');
    let formattedContent = htmlContent
        .replace(/### (.*)/g, '<h3>$1</h3>')
        .replace(/\n/g, '<br>');
    contentDiv.innerHTML = formattedContent;
}

function hideAiContentModal() {
    closeModalById('ai-content-modal');
}

