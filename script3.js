// --- SCRIPT 3: PLAYER ENGINE, AUDIO API, AND CONTROLS (Mobile-Ready) ---

function closeEqualizer() {
    const eqPanel = document.getElementById('eq-panel');
    if (eqPanel && eqPanel.classList.contains('active')) {
        eqPanel.classList.remove('active');
        if (dynamicDom.eqBtn) dynamicDom.eqBtn.classList.remove('active');
    }
}

function initMusicPlayerView() {
    dynamicDom.playPauseBtn = document.getElementById('play-pause-btn');
    dynamicDom.prevBtn = document.getElementById('prev-btn');
    dynamicDom.nextBtn = document.getElementById('next-btn');
    dynamicDom.progressBar = document.getElementById('progress-bar');
    dynamicDom.currentTime = document.getElementById('current-time');
    dynamicDom.totalDuration = document.getElementById('total-duration');
    dynamicDom.volumeSlider = document.getElementById('volume-slider');
    dynamicDom.volumeBtn = document.getElementById('volume-btn');
    dynamicDom.shuffleBtn = document.getElementById('shuffle-btn');
    dynamicDom.repeatBtn = document.getElementById('repeat-btn');
    dynamicDom.visualizerCanvas = document.getElementById('visualizer-canvas');
    dynamicDom.playerTrackTitle = document.querySelector('.player-track-info .title');
    dynamicDom.playerTrackArtist = document.querySelector('.player-track-info .artist');
    dynamicDom.playerQueueList = document.getElementById('player-queue-list');
    dynamicDom.aiLyricsBtn = document.getElementById('ai-lyrics-btn');
    dynamicDom.aiInsightsBtn = document.getElementById('ai-insights-btn');
    dynamicDom.eqBtn = document.getElementById('eq-btn');
    dynamicDom.eqPanel = document.getElementById('eq-panel');
    dynamicDom.eqLowSlider = document.getElementById('eq-low-slider');
    dynamicDom.eqMidSlider = document.getElementById('eq-mid-slider');
    dynamicDom.eqHighSlider = document.getElementById('eq-high-slider');

    dynamicDom.playPauseBtn.addEventListener('click', () => { if (dom.audioPlayer.src) { state.isPlaying ? dom.audioPlayer.pause() : dom.audioPlayer.play(); } });
    dynamicDom.nextBtn.addEventListener('click', playNext);
    dynamicDom.prevBtn.addEventListener('click', playPrev);
    dynamicDom.progressBar.addEventListener('input', e => { if(dom.audioPlayer.src) dom.audioPlayer.currentTime = e.target.value; });
    dynamicDom.volumeSlider.addEventListener('input', e => { dom.audioPlayer.volume = e.target.value; state.lastVolume = e.target.value > 0 ? e.target.value : state.lastVolume; updateVolumeIcon(); saveState(); });
    dynamicDom.volumeBtn.addEventListener('click', () => { dom.audioPlayer.volume = dom.audioPlayer.volume > 0 ? 0 : state.lastVolume; dynamicDom.volumeSlider.value = dom.audioPlayer.volume; updateVolumeIcon(); });
    dynamicDom.shuffleBtn.addEventListener('click', toggleShuffle);
    dynamicDom.repeatBtn.addEventListener('click', toggleRepeat);
    
    dynamicDom.eqBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dynamicDom.eqPanel.classList.toggle('active');
        dynamicDom.eqBtn.classList.toggle('active');
    });

    const presetsContainer = dynamicDom.eqPanel.querySelector('.eq-presets-container');
    presetsContainer.innerHTML = Object.keys(EQ_PRESETS).map(key => {
        const preset = EQ_PRESETS[key];
        const isActive = state.settings.activeEqPreset === key ? 'active' : '';
        return `<button class="eq-preset-btn ${isActive}" data-preset="${key}"><i class="fas ${preset.icon}"></i> ${preset.name}</button>`;
    }).join('');

    presetsContainer.querySelectorAll('.eq-preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            applyEqualizerPreset(e.currentTarget.dataset.preset);
        });
    });

    const handleSliderInput = (slider, band) => {
        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            state.settings.customEqValues[band] = value;
            if (state.eqFilters[band] && state.audioContext) {
                state.eqFilters[band].gain.setValueAtTime(value, state.audioContext.currentTime);
            }
            applyEqualizerPreset('custom');
        });
    };
    handleSliderInput(dynamicDom.eqLowSlider, 'low');
    handleSliderInput(dynamicDom.eqMidSlider, 'mid');
    handleSliderInput(dynamicDom.eqHighSlider, 'high');
    
    document.body.addEventListener('click', closeEqualizer, true);
    dynamicDom.eqPanel.addEventListener('click', e => e.stopPropagation());

    const handleAiAction = (action) => {
        if (state.currentIndex < 0) {
            showToast("Play a song to use AI features.", "info");
            return;
        }
        const track = state.queue[state.currentIndex];
        const title = state.currentTrackMetadata.title || track.name;
        const artist = state.currentTrackMetadata.artist || "Unknown Artist";
        if (action === 'lyrics') {
            showAiContentModal(`Lyrics for ${title}`);
            getSongLyrics(title, artist);
        } else if (action === 'insights') {
            showAiContentModal(`Insights for ${title}`);
            getSongInsights(title, artist);
        }
    };
    dynamicDom.aiLyricsBtn.addEventListener('click', () => handleAiAction('lyrics'));
    dynamicDom.aiInsightsBtn.addEventListener('click', () => handleAiAction('insights'));

    updatePlayPauseIcon();
    updateVolumeIcon();
    dynamicDom.shuffleBtn.classList.toggle('active', state.isShuffle);
    dynamicDom.repeatBtn.className = `control-btn ${state.repeatMode !== 'none' ? 'active' : ''}`;
    dynamicDom.repeatBtn.innerHTML = `<i class="fas ${state.repeatMode === 'one' ? 'fa-1' : 'fa-repeat'}"></i>`;
    if (state.currentIndex > -1) {
        updatePlayerUI(state.queue[state.currentIndex], state.currentTrackMetadata);
    }
}

function setupAudioContext() {
    if (state.audioContext) return;
    try {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        state.sourceNode = state.audioContext.createMediaElementSource(dom.audioPlayer);
        state.analyser = state.audioContext.createAnalyser();
        state.analyser.fftSize = 256;

        state.eqFilters.low = state.audioContext.createBiquadFilter();
        state.eqFilters.low.type = "lowshelf";
        state.eqFilters.low.frequency.value = 320;

        state.eqFilters.mid = state.audioContext.createBiquadFilter();
        state.eqFilters.mid.type = "peaking";
        state.eqFilters.mid.frequency.value = 1000;
        state.eqFilters.mid.Q.value = 1;

        state.eqFilters.high = state.audioContext.createBiquadFilter();
        state.eqFilters.high.type = "highshelf";
        state.eqFilters.high.frequency.value = 3200;

        state.sourceNode
            .connect(state.eqFilters.low)
            .connect(state.eqFilters.mid)
            .connect(state.eqFilters.high)
            .connect(state.analyser)
            .connect(state.audioContext.destination);
        
        applyEqualizerPreset(state.settings.activeEqPreset);

    } catch (e) {
        console.error("Could not set up Web Audio API:", e);
        showToast("Audio effects disabled.", "error");
        state.settings.musicVisualizer = false;
    }
}

function drawVisualizer() {
    if (!state.isPlaying || !state.analyser || !dynamicDom.visualizerCanvas || !state.settings.musicVisualizer) {
        if (state.animationFrameId) {
             cancelAnimationFrame(state.animationFrameId);
             state.animationFrameId = null;
        }
        return;
    }
    state.animationFrameId = requestAnimationFrame(drawVisualizer);
    const bufferLength = state.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    state.analyser.getByteFrequencyData(dataArray);
    const canvas = dynamicDom.visualizerCanvas;
    const ctx = canvas.getContext('2d');
    const { width: WIDTH, height: HEIGHT } = canvas;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    const centerX = WIDTH / 2, centerY = HEIGHT / 2, radius = Math.min(WIDTH, HEIGHT) / 3;
    
    for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2.5;
        const angle = (i / bufferLength) * 2 * Math.PI;
        const x1 = centerX + radius * Math.cos(angle);
        const y1 = centerY + radius * Math.sin(angle);
        const x2 = centerX + (radius + barHeight) * Math.cos(angle);
        const y2 = centerY + (radius + barHeight) * Math.sin(angle);

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        const hue = (i / bufferLength) * 360;
        gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 0)`);
        gradient.addColorStop(0.5, `hsl(${hue}, 100%, 60%)`);
        gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}

async function playTrack() {
    if (state.currentIndex < 0 || state.currentIndex >= state.queue.length) return;
    const track = state.queue[state.currentIndex];

    if (dom.audioPlayer.src && dom.audioPlayer.src.startsWith('blob:')) {
        URL.revokeObjectURL(dom.audioPlayer.src);
    }
    if (track.source === 'drive' || track.source === 'youtube') {
        showToast(`Loading "${track.name.replace(/\.[^/.]+$/, "")}"...`, 'info');
    }

    try {
        let audioUrl, fileObjectForMetadata;
        let metadata = { title: track.name, artist: track.artist || "Unknown Artist", picture: track.thumbnail || null };

        if (track.source === 'local') {
            audioUrl = URL.createObjectURL(track.file);
            fileObjectForMetadata = track.file;
        } else if (track.source === 'drive') {
            if (!state.googleDriveSignedIn || !gapi.client.getToken()) throw new Error('Google Drive disconnected.');
            const accessToken = gapi.client.getToken().access_token;
            const res = await fetch(`https://www.googleapis.com/drive/v3/files/${track.id}?alt=media`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
            if (!res.ok) throw new Error(`Google Drive fetch failed: ${res.statusText}`);
            const blob = await res.blob();
            audioUrl = URL.createObjectURL(blob);
            fileObjectForMetadata = new File([blob], track.name, { type: blob.type || 'audio/mpeg' });
        } else if (track.source === 'youtube') {
            const info = await ytdl.getInfo(track.id.replace('yt-', ''));
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
            if (!format.url) throw new Error("Could not get streamable URL from YouTube.");
            audioUrl = format.url;
            metadata = { title: info.videoDetails.title, artist: info.videoDetails.author.name, picture: info.videoDetails.thumbnails[0].url };
        }
        
        if (fileObjectForMetadata) {
            metadata = await new Promise(resolve => getTrackMetadata(fileObjectForMetadata, resolve));
        }
        state.currentTrackMetadata = metadata;

        if (state.currentView !== 'player') {
            state.currentView = 'player';
            await renderCurrentView();
        } else {
            updatePlayerUI(track, state.currentTrackMetadata);
        }
        
        setupAudioContext();
        dom.audioPlayer.src = audioUrl;
        await dom.audioPlayer.play();
        addToRecents(track.name);
    } catch (e) { 
        console.error("Playback Error:", e);
        showToast(`Error playing ${track.name}: ${e.message}`, "error");
        setTimeout(playNext, 1000);
    }
}

function applyEqualizerPreset(presetName) {
    if (!state.audioContext || !EQ_PRESETS[presetName]) return;
    let values = (presetName === 'custom') ? state.settings.customEqValues : EQ_PRESETS[presetName].values;
    const { low, mid, high } = values;

    if (state.audioContext) {
        state.eqFilters.low.gain.setValueAtTime(low, state.audioContext.currentTime);
        state.eqFilters.mid.gain.setValueAtTime(mid, state.audioContext.currentTime);
        state.eqFilters.high.gain.setValueAtTime(high, state.audioContext.currentTime);
    }

    if (dynamicDom.eqLowSlider) dynamicDom.eqLowSlider.value = low;
    if (dynamicDom.eqMidSlider) dynamicDom.eqMidSlider.value = mid;
    if (dynamicDom.eqHighSlider) dynamicDom.eqHighSlider.value = high;

    state.settings.activeEqPreset = presetName;
    const presetsContainer = dynamicDom.eqPanel?.querySelector('.eq-presets-container');
    if (presetsContainer) {
        presetsContainer.querySelector('.eq-preset-btn.active')?.classList.remove('active');
        presetsContainer.querySelector(`.eq-preset-btn[data-preset="${presetName}"]`)?.classList.add('active');
    }
    saveState();
}

async function playNext() {
    if (state.queue.length === 0) return;
    if (state.repeatMode === 'one' && state.isPlaying) {
        dom.audioPlayer.currentTime = 0;
        await dom.audioPlayer.play();
        return;
    }
    let nextIndex = state.currentIndex + 1;
    if (nextIndex >= state.queue.length) {
        if (state.repeatMode === 'all') nextIndex = 0;
        else {
            state.isPlaying = false;
            updatePlayPauseIcon();
            dom.audioPlayer.src = '';
            if (dom.audioPlayer.src.startsWith('blob:')) URL.revokeObjectURL(dom.audioPlayer.src);
            state.currentIndex = -1;
            return;
        }
    }
    if (state.settings.aiDjEnabled && state.settings.aiFeaturesEnabled && state.currentIndex > -1 && state.queue.length > 1) {
        dom.audioPlayer.pause();
        const currentSong = { title: state.currentTrackMetadata.title, artist: state.currentTrackMetadata.artist };
        const nextTrack = state.queue[nextIndex];
        const nextSong = { title: nextTrack.name.replace(/\.[^/.]+$/, ""), artist: nextTrack.artist || 'Unknown' };
        showToast("AI DJ is preparing transition...", "info");
        await getAiDjTransition(currentSong, nextSong);
    }
    
    state.currentIndex = nextIndex;
    await playTrack();
}

async function playPrev() {
    if (state.queue.length === 0) return;
    if (dom.audioPlayer.currentTime > 3) dom.audioPlayer.currentTime = 0;
    else {
        state.currentIndex = (state.currentIndex - 1 + state.queue.length) % state.queue.length;
        await playTrack();
    }
}

function getTrackMetadata(file, callback) { 
    if (!file) {
        callback({ title: "Unknown Track", artist: "Unknown Artist", picture: null });
        return;
    }
   window.jsmediatags.read(file, {
       onSuccess: ({ tags }) => {
           let picture = null;
           if (tags.picture) {
               const { data, format } = tags.picture;
               let base64String = "";
               for (let i = 0; i < data.length; i++) { base64String += String.fromCharCode(data[i]); }
               picture = `data:${format};base64,${window.btoa(base64String)}`;
           }
           callback({ title: tags.title || file.name.replace(/\.[^/.]+$/, ""), artist: tags.artist || "Unknown Artist", picture });
       },
       onError: (error) => {
           console.warn('jsmediatags error:', error);
           callback({ title: file.name.replace(/\.[^/.]+$/, ""), artist: "Unknown Artist", picture: null });
       }
   });
}

function updatePlayerUI(track, metadata) { 
    if (dynamicDom.playerTrackTitle) dynamicDom.playerTrackTitle.textContent = metadata.title;
    if (dynamicDom.playerTrackArtist) dynamicDom.playerTrackArtist.textContent = metadata.artist || "Unknown Artist";
    const artworkUrl = metadata.picture || null;
    dom.auraScreenContainer.style.backgroundImage = artworkUrl ? `url(${artworkUrl})` : 'none';
    dom.auraScreenContainer.classList.toggle('player-active', !!artworkUrl);
    
    dom.nowPlayingArtwork.src = artworkUrl || 'https://placehold.co/40x40/2a2a3a/e0e0e0?text=A';
    dom.nowPlayingTitle.textContent = metadata.title;
    dom.nowPlayingArtist.textContent = metadata.artist || "Unknown Artist";

    if (state.currentView === 'player' && dynamicDom.playerQueueList) renderPlayerQueue();
}

function renderPlayerQueue() {
    if (!dynamicDom.playerQueueList) return;
    dynamicDom.playerQueueList.innerHTML = state.queue.map((track, index) => {
        let className = 'queue-track-item';
        if (index < state.currentIndex) className += ' previous';
        if (index === state.currentIndex) className += ' current';
        return `<li class="${className}">${track.name.replace(/\.[^/.]+$/, "")}</li>`;
    }).join('');
    
    const currentItem = dynamicDom.playerQueueList.querySelector('.current');
    if (currentItem) currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function formatTime(s) { return isNaN(s) ? '0:00' : `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}`; }
function updatePlayPauseIcon() { 
    const icon = state.isPlaying ? 'fa-pause' : 'fa-play';
    if(dynamicDom.playPauseBtn) dynamicDom.playPauseBtn.innerHTML = `<i class="fas ${icon}"></i>`;
    if(dom.nowPlayingPlayPauseBtn) dom.nowPlayingPlayPauseBtn.innerHTML = `<i class="fas ${icon}"></i>`;
}
function updateVolumeIcon() { if(!dynamicDom.volumeBtn) return; const v = dom.audioPlayer.volume, i = dynamicDom.volumeBtn.querySelector('i'); if (v === 0) i.className = 'fas fa-volume-xmark'; else if (v < 0.5) i.className = 'fas fa-volume-low'; else i.className = 'fas fa-volume-high'; }
function toggleShuffle() { state.isShuffle = !state.isShuffle; if(dynamicDom.shuffleBtn) dynamicDom.shuffleBtn.classList.toggle('active', state.isShuffle); if (state.queue.length > 0) { const currentTrack = state.queue[state.currentIndex]; state.queue = state.isShuffle ? shuffleArray([...state.originalQueue]) : [...state.originalQueue]; state.currentIndex = state.queue.findIndex(t => t.id === currentTrack.id); } showToast(`Shuffle is ${state.isShuffle ? 'ON' : 'OFF'}.`, 'info'); if(state.currentView === 'player' && dynamicDom.playerQueueList) renderPlayerQueue(); saveState(); }
function shuffleArray(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function toggleRepeat() { const modes = ['none', 'all', 'one']; state.repeatMode = modes[(modes.indexOf(state.repeatMode) + 1) % modes.length]; if(dynamicDom.repeatBtn) { dynamicDom.repeatBtn.className = `control-btn ${state.repeatMode !== 'none' ? 'active' : ''}`; dynamicDom.repeatBtn.innerHTML = `<i class="fas ${state.repeatMode === 'one' ? 'fa-1' : 'fa-repeat'}"></i>`; } showToast(`Repeat mode: ${state.repeatMode}.`, 'info'); saveState(); }

function setQueue(tracks, startIndex) {
    state.originalQueue = [...tracks];
    state.queue = state.isShuffle ? shuffleArray([...tracks]) : [...tracks];
    const startTrack = tracks[startIndex];
    state.currentIndex = state.queue.findIndex(t => t.id === startTrack.id);
}

function handleTrackListClick(e) {
    const trackItem = e.target.closest('.track-item');
    if (!trackItem) return;
    const trackId = trackItem.dataset.trackId;
    const track = state.library.find(t => t.id === trackId);
    if (!track) return;

    const playAction = e.target.closest('.track-info-main');
    const actionsButton = e.target.closest('.add-to-playlist-btn'); // This button is now for all actions on mobile
    const likeAction = e.target.closest('.like-btn');

    if (playAction) {
        let tracklistSource;
        if(state.currentTracklistSource.type === 'library') {
            tracklistSource = state.library;
        } else {
            const playlistTrackIds = new Set(state.playlists[state.currentTracklistSource.name].tracks);
            tracklistSource = state.library.filter(t => playlistTrackIds.has(t.id));
        }
        const trackIndex = tracklistSource.findIndex(t => t.id === trackId);
        if (trackIndex > -1) {
            setQueue(tracklistSource, trackIndex);
            playTrack();
        }
    } else if (likeAction) {
        const likedPlaylist = state.playlists['Liked Songs'];
        const isLiked = likedPlaylist.tracks.includes(track.id);
        if (isLiked) likedPlaylist.tracks = likedPlaylist.tracks.filter(id => id !== track.id);
        else likedPlaylist.tracks.push(track.id);
        likeAction.classList.toggle('active', !isLiked);
        saveState();
    } else if (actionsButton) {
        // On mobile, the ellipsis button would open a small action sheet/modal.
        // For this implementation, we'll just map it to the "add to playlist" for now.
        openAddToPlaylistModal(track);
    }
}

