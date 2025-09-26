// --- SCRIPT 4: GOOGLE DRIVE BACKEND INTEGRATION (Mobile-Ready) ---

const GOOGLE_API_KEY = 'AIzaSyDY-GyYDfGuvN3MYUVsvKHCfuTwyZDup4c';
const GOOGLE_CLIENT_ID = '531468994431-m602puatri7taea57ipl93pdf779pq86.apps.googleusercontent.com';

const GOOGLE_DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file';

const SETTINGS_FILE_NAME = 'aura_settings.json';
let settingsFileId = null;
let tokenClient;

function handleApiError(err, contextMessage) {
    console.error(`${contextMessage}:`, err);
    if (err.status === 401 || (err.result && err.result.error && err.result.error.status === 'UNAUTHENTICATED')) {
        handleSignoutClick();
        showToast("Session expired. Please connect again.", "error");
    } else {
        const message = err.result?.error?.message || err.message || 'An unknown API error occurred.';
        showToast(`${contextMessage} failed: ${message}`, "error");
    }
}

function onGoogleApiLoad() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    try {
        if (GOOGLE_API_KEY.includes('YOUR_API_KEY') || GOOGLE_CLIENT_ID.includes('YOUR_CLIENT_ID')) {
            showToast("API Credentials missing", "error");
            console.error("FATAL: Please replace placeholder API Key and Client ID in backend.js");
            state.googleApiReady = true; 
            updateDriveStatus(false);
            dom.loadingOverlay.classList.add('hidden');
            return;
        }

        await gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            discoveryDocs: GOOGLE_DISCOVERY_DOCS,
        });
        
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: GOOGLE_SCOPES,
            callback: tokenClientCallback,
            error_callback: (error) => {
                console.error("Google Auth Error:", error);
                showToast("Google Authentication failed.", "error");
            }
        });
        
        state.googleApiReady = true;
        console.log("Google API Client Initialized.");

        if (state.googleAuthToken !== null) {
            gapi.client.setToken(state.googleAuthToken);
            state.googleDriveSignedIn = true;
            console.log("Restored token from localStorage.");
            
            dom.loadingOverlay.classList.add('hidden');
            updateDriveStatus(true);
            
            await fetchUserProfile(); 
            
            if(state.googleDriveSignedIn) {
                await loadStateFromDrive(); 
                await syncDriveFiles();
            }
        } else {
            updateDriveStatus(false);
            dom.loadingOverlay.classList.add('hidden');
        }
    } catch (err) {
        console.error("Fatal error during GAPI initialization:", err);
        showToast("Could not connect to Google services.", "error");
        if (dom.loadingOverlay && !dom.loadingOverlay.classList.contains('hidden')) {
            dom.loadingOverlay.classList.add('hidden');
        }
    }
}

async function tokenClientCallback(resp) {
    if (resp.error !== undefined) {
        showToast('Google Drive connection failed.', 'error');
        console.error("Google Token Client Error:", resp);
        return;
    }
    state.googleDriveSignedIn = true;
    state.googleAuthToken = gapi.client.getToken();
    saveState();
    showToast('Connected to Google Drive!', 'success');
    
    await fetchUserProfile(); 
    await loadStateFromDrive();
    await syncDriveFiles(); 
    updateDriveStatus(true);
}

function handleAuthClick() {
    if (!state.googleApiReady) {
        showToast('Google API is not ready yet.', 'error');
        return;
    }
    tokenClient.requestAccessToken({prompt: 'consent'});
}

function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token, () => {});
        gapi.client.setToken('');
    }
    state.googleDriveSignedIn = false;
    state.googleAuthToken = null;
    settingsFileId = null;
    state.googleUserName = '';
    state.googleUserEmail = '';
    state.googleUserPicture = '';
    
    state.library = state.library.filter(track => track.source === 'local' || track.source === 'youtube');
    state.playlists = { 'Liked Songs': { name: 'Liked Songs', tracks: [] } };
    state.ytHistory = [];
    state.recents = [];
    
    saveState();
    renderCurrentView();
    showToast('Disconnected from Google Drive.', 'info');
    updateDriveStatus(false);
}

async function fetchUserProfile() {
    if (!state.googleDriveSignedIn) return;
    try {
        const res = await gapi.client.drive.about.get({ fields: 'user' });
        state.googleUserName = res.result.user.displayName;
        state.googleUserEmail = res.result.user.emailAddress;
        state.googleUserPicture = res.result.user.photoLink;
        saveState();
        if(state.currentView === 'account') {
            initAccountView();
        }
    } catch (err) {
        handleApiError(err, "Fetching user profile");
    }
}


// --- APP DATA SYNC FUNCTIONS ---

async function getAppDataFileId() {
    if (settingsFileId) return settingsFileId;
    try {
        const response = await gapi.client.drive.files.list({
            spaces: 'appDataFolder',
            fields: 'files(id, name)',
            q: `name='${SETTINGS_FILE_NAME}'`
        });
        if (response.result.files && response.result.files.length > 0) {
            settingsFileId = response.result.files[0].id;
            return settingsFileId;
        }
        return null;
    } catch (err) {
        handleApiError(err, "Finding app data file");
        return null;
    }
}

async function loadStateFromDrive() {
    if (!state.googleDriveSignedIn) return;
    showToast("Syncing settings...", "info");
    const fileId = await getAppDataFileId();
    if (!fileId) {
        console.log("No settings on Drive. Creating new file.");
        await saveStateToDrive();
        return;
    }
    try {
        const response = await gapi.client.drive.files.get({ fileId: fileId, alt: 'media' });
        const savedState = JSON.parse(response.body);
        
        state.playlists = savedState.playlists || { 'Liked Songs': { name: 'Liked Songs', tracks: [] } };
        state.recents = savedState.recents || [];
        state.ytHistory = savedState.ytHistory || [];
        state.settings = { ...state.settings, ...savedState.settings };
        
        const nonDriveTracks = state.library.filter(t => t.source !== 'drive');
        state.library = [...(savedState.library || []), ...nonDriveTracks];
        state.library = state.library.filter((track, index, self) => 
            index === self.findIndex((t) => (t.id === track.id))
        );

        showToast("Settings and playlists synced!", "success");
        applyTheme(state.settings.activeTheme);
        applyThemeCustomizations();
        await renderCurrentView();
        if (dom.recentsList) renderRecents();
        if (dom.playlistsList) renderPlaylists();

    } catch (err) {
        handleApiError(err, "Loading state from Drive");
    }
}

async function saveStateToDrive() {
    if (!state.googleDriveSignedIn) return;
    const fileId = await getAppDataFileId();

    const stateToSave = {
        library: state.library.filter(track => track.source !== 'local'),
        playlists: state.playlists,
        recents: state.recents,
        ytHistory: state.ytHistory,
        settings: state.settings,
    };
    const metadata = { 'name': SETTINGS_FILE_NAME, 'mimeType': 'application/json' };
    if (!fileId) metadata.parents = ['appDataFolder'];

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delim = `\r\n--${boundary}--`;
    const multipartRequestBody =
        delimiter + 'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) +
        delimiter + 'Content-Type: application/json\r\n\r\n' + JSON.stringify(stateToSave) +
        close_delim;

    const path = fileId ? `/upload/drive/v3/files/${fileId}` : '/upload/drive/v3/files';
    const method = fileId ? 'PATCH' : 'POST';

    try {
        const response = await gapi.client.request({
            'path': path, 'method': method, 'params': { 'uploadType': 'multipart' },
            'headers': { 'Content-Type': `multipart/related; boundary="${boundary}"` },
            'body': multipartRequestBody
        });
        if (!settingsFileId) settingsFileId = response.result.id;
        console.log("State saved to Google Drive.");
    } catch(err) {
        handleApiError(err, "Saving state to Drive");
    }
}


// --- MUSIC FILE SYNC, UPLOAD, AND DOWNLOAD ---
async function syncDriveFiles() {
    if(!state.googleDriveSignedIn) return;
    showToast('Syncing music from Drive...', 'info');
    try {
        const response = await gapi.client.drive.files.list({
            'pageSize': 200,
            'fields': "nextPageToken, files(id, name, thumbnailLink)",
            'q': "mimeType contains 'audio/' and trashed = false",
            'spaces': 'drive',
        });

        const driveFiles = response.result.files;
        if (driveFiles && driveFiles.length > 0) {
            const existingDriveIds = new Set(state.library.filter(t => t.source === 'drive').map(t => t.id));
            const newTracks = driveFiles
                .filter(file => !existingDriveIds.has(file.id))
                .map(file => ({
                    name: file.name, id: file.id, source: 'drive',
                    artist: 'Google Drive', thumbnail: file.thumbnailLink,
                }));

            if (newTracks.length > 0) {
                state.library.push(...newTracks);
                if(state.currentView === 'home') renderTrackList();
                showToast(`Found ${newTracks.length} new song(s) in Drive!`, 'success');
                await saveStateToDrive();
            } else {
                showToast('Cloud library is up to date.', 'info');
            }
        } else {
            showToast('No music found in your Google Drive.', 'info');
        }
    } catch (err) {
        handleApiError(err, "Syncing Drive files");
    }
}

async function uploadTrackToDrive(track) {
    // This is a desktop-only feature, so we'll just show a message on mobile.
    showToast("Uploading is best done on the desktop version.", "info");
}

async function downloadTrackFromCloud(track) {
    if (!state.googleDriveSignedIn && track.source === 'drive') {
        showToast("Connect to Google Drive to download.", "error");
        return;
    }
    showToast(`Preparing download for "${track.name}"...`, 'info');
    try {
        const a = document.createElement('a');
        if (track.source === 'drive') {
            const accessToken = gapi.client.getToken().access_token;
            const response = await fetch(`https://www.googleapis.com/drive/v3/files/${track.id}?alt=media`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
            const blob = await response.blob();
            a.href = URL.createObjectURL(blob);
            a.download = track.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
        } else if (track.source === 'youtube') {
            const videoId = track.id.replace('yt-', '');
            const info = await ytdl.getInfo(videoId);
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
            if (!format || !format.url) throw new Error("No audio format found.");
            a.href = format.url;
            a.download = `${info.videoDetails.title.replace(/[\\/:"*?<>|]/g, '')}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            throw new Error("Track source is not downloadable.");
        }
        showToast('Download started!', 'success');
    } catch(err) {
        console.error(`Download track failed:`, err);
        showToast(`Download failed: ${err.message}`, "error");
    }
}



