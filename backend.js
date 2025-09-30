// --- SCRIPT 4: GOOGLE DRIVE BACKEND INTEGRATION (FULLY UPDATED) ---

const GOOGLE_API_KEY = 'AIzaSyCddqKGS8YXxkxcqmoFlshfJHGAf6nIwiA'; // Replace with your actual API key
const GOOGLE_CLIENT_ID = '531468994431-jvsf83j9hjpfqi2i8bkbnj08phf9sdmu.apps.googleusercontent.com'; // Replace with your actual Client ID

const GOOGLE_DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file';

const SETTINGS_FILE_NAME = 'aura_settings.json';
let settingsFileId = null;
let tokenClient;
// Initialization guard flag to prevent duplicate execution (common issue with duplicate <script> tags)
let isGapiInitAttempted = false; 

// IMPORTANT: Ensure your main HTML file includes these scripts:
// <script async defer src="https://apis.google.com/js/api.js" onload="onGoogleApiLoad()"></script>
// <script async defer src="https://accounts.google.com/gsi/client"></script>


// Centralized error handler for all Google API calls
function handleApiError(err, contextMessage) {
    console.error(`${contextMessage}:`, err);
    // Check for 401 Unauthorized or equivalent errors
    if (err.status === 401 || (err.result && err.result.error && err.result.error.status === 'UNAUTHENTICATED')) {
        handleSignoutClick();
        showToast("Your session has expired. Please connect again.", "error");
    } else {
        const message = err.result?.error?.message || err.message || 'An unknown API error occurred.';
        showToast(`${contextMessage} failed: ${message}`, "error");
    }
}


function onGoogleApiLoad() {
  // === Initialization Guard ===
  // Prevents multiple executions if the onload handler is called more than once.
  if (isGapiInitAttempted) {
    console.warn("GAPI initialization already attempted. Ignoring duplicate call.");
    return;
  }
  isGapiInitAttempted = true; // Mark attempt
  
  // Check if gapi is loaded before proceeding
  if (typeof gapi === 'undefined') {
    console.error("FATAL: Google API library (gapi) failed to load.");
    showToast("Google API library failed to load. Check network and script tags.", "error");
    return;
  }
  gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    try {
        // Initialize gapi.client
        await gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          discoveryDocs: GOOGLE_DISCOVERY_DOCS,
        });
        
        // Check if Google Identity Services (GIS) is loaded before initializing tokenClient
        if (typeof google === 'undefined' || typeof google.accounts === 'undefined' || typeof google.accounts.oauth2 === 'undefined') {
             throw new Error("Google Identity Services library (accounts.oauth2) is not loaded.");
        }

        // Initialize GIS Token Client
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

        // This is the main token restoration flow on app load
        if (state.googleAuthToken !== null) {
            gapi.client.setToken(state.googleAuthToken);
            state.googleDriveSignedIn = true;
            console.log("Restored token from localStorage.");
            
            // Show UI immediately
            dom.loadingOverlay.classList.add('hidden');
            updateDriveStatus(true);
            
            // Perform longer sync operations in the background
            await fetchUserProfile(); 
            
            if(state.googleDriveSignedIn) {
                await loadStateFromDrive(); 
                await syncDriveFiles();
            }

        } else {
            // If not signed in, just hide the overlay and show the app
            updateDriveStatus(false);
            dom.loadingOverlay.classList.add('hidden');
        }

    } catch (err) {
        console.error("Fatal error during GAPI initialization:", err);
        // The common error is caught here. We use the error message from the throw or a generic one.
        const errorMessage = err.message.includes('loaded') ? err.message : "Could not connect to Google services. Check API Key and Console setup.";
        showToast(errorMessage, "error");

        // Ensure state is clean and overlay is hidden on any error
        state.googleApiReady = true; 
        updateDriveStatus(false);
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
    state.googleAuthToken = gapi.client.getToken(); // Get the new token
    saveState(); // This securely stores the token in localStorage via script1.js
    showToast('Successfully connected to Google Drive!', 'success');
    
    // Perform initial sync after successful login
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
    // Clear all session-related state
    state.googleDriveSignedIn = false;
    state.googleAuthToken = null;
    settingsFileId = null;
    state.googleUserName = '';
    state.googleUserEmail = '';
    state.googleUserPicture = '';
    
    // Reset library to only local/YT tracks
    state.library = state.library.filter(track => track.source === 'local' || track.source === 'youtube');
    state.playlists = { 'Liked Songs': { name: 'Liked Songs', tracks: [] } };
    state.ytHistory = [];
    state.recents = [];
    
    saveState(); // Persist the signed-out state to localStorage
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
    showToast("Syncing your settings...", "info");
    const fileId = await getAppDataFileId();
    if (!fileId) {
        console.log("No settings file found on Drive. Creating one with current state.");
        await saveStateToDrive();
        return;
    }
    try {
        const response = await gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media'
        });
        const savedState = JSON.parse(response.body);
        
        state.playlists = savedState.playlists || { 'Liked Songs': { name: 'Liked Songs', tracks: [] } };
        state.recents = savedState.recents || [];
        state.ytHistory = savedState.ytHistory || [];
        state.settings = { ...state.settings, ...savedState.settings };
        
        // Merge Drive tracks with existing non-Drive tracks
        const nonDriveTracks = state.library.filter(t => t.source !== 'drive');
        state.library = [...(savedState.library || []), ...nonDriveTracks];
        
        // Deduplicate the library based on ID
        state.library = state.library.filter((track, index, self) => 
            index === self.findIndex((t) => (t.id === track.id))
        );

        showToast("Settings and playlists synced!", "success");
        applyTheme(state.settings.activeTheme);
        applyThemeCustomizations(); // Re-apply custom theme settings after loading
        await renderCurrentView();
        renderRecents();
        renderPlaylists();

    } catch (err) {
        handleApiError(err, "Loading state from Drive");
    }
}

async function saveStateToDrive() {
    if (!state.googleDriveSignedIn) return;
    const fileId = await getAppDataFileId();

    const stateToSave = {
        // Only save cloud tracks (Drive and YouTube metadata)
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
            'path': path,
            'method': method,
            'params': { 'uploadType': 'multipart' },
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
    showToast('Syncing music from Google Drive...', 'info');
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
                    name: file.name,
                    id: file.id,
                    source: 'drive',
                    artist: 'Google Drive',
                    thumbnail: file.thumbnailLink,
                }));

            if (newTracks.length > 0) {
                state.library.push(...newTracks);
                if(state.currentView === 'home') renderTrackList();
                showToast(`Found ${newTracks.length} new song(s) in your Drive!`, 'success');
                await saveStateToDrive();
            } else {
                showToast('Your cloud music library is up to date.', 'info');
            }
        } else {
            showToast('No music files found in your Google Drive.', 'info');
        }
    } catch (err) {
        handleApiError(err, "Syncing Drive files");
    }
}

async function uploadTrackToDrive(track) {
    if (!track.file || !state.googleDriveSignedIn) return;
    showToast(`Uploading "${track.name}"...`, 'info');

    const metadata = { 'name': track.name, 'mimeType': track.file.type || 'audio/mpeg', 'parents': ['root'] };
    const reader = new FileReader();
    
    // Use readAsArrayBuffer for potentially large files, but for gapi.client.request multipart,
    // using readAsDataURL and base64 is often the path taken by quick examples.
    // We will stick to readAsDataURL as implemented, but acknowledge it's only suitable for small files.
    reader.onload = async (e) => {
        const fileContentBase64 = e.target.result.split(',')[1];
        const boundary = '-------314159265358979323846';
        const delimiter = `\r\n--${boundary}\r\n`;
        const close_delim = `\r\n--${boundary}--`;
        
        // The file content must be base64-encoded and the transfer encoding header must be present.
        const multipartRequestBody =
            delimiter + 'Content-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(metadata) +
            delimiter + 'Content-Type: ' + metadata.mimeType + '\r\n' + 
            'Content-Transfer-Encoding: base64\r\n\r\n' + fileContentBase64 + 
            close_delim;

        try {
            const response = await gapi.client.request({
                'path': '/upload/drive/v3/files', 'method': 'POST', 'params': { 'uploadType': 'multipart' },
                'headers': { 'Content-Type': `multipart/related; boundary="${boundary}"` }, 'body': multipartRequestBody
            });
            
            const uploadedTrackIndex = state.library.findIndex(t => t.id === track.id);
            if (uploadedTrackIndex > -1) {
                state.library[uploadedTrackIndex].id = response.result.id;
                state.library[uploadedTrackIndex].source = 'drive';
                state.library[uploadedTrackIndex].artist = 'Google Drive';
                delete state.library[uploadedTrackIndex].file; 
            }
            
            await renderTrackList();
            await saveStateToDrive();
            showToast(`"${track.name}" uploaded successfully!`, 'success');
        } catch (err) {
            handleApiError(err, "Uploading track");
        }
    };
    reader.readAsDataURL(track.file);
}

// Utility to convert base64 to ArrayBuffer for download processing (if needed for blob creation)
function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

async function downloadTrackFromCloud(track) {
    if (!state.googleDriveSignedIn && track.source === 'drive') {
        showToast("Please connect to Google Drive to download.", "error");
        return;
    }
    showToast(`Preparing to download "${track.name}"...`, 'info');
    try {
        const a = document.createElement('a');
        
        if (track.source === 'drive') {
            const accessToken = gapi.client.getToken().access_token;
            // Fetch the file content
            const response = await fetch(`https://www.googleapis.com/drive/v3/files/${track.id}?alt=media`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
            const blob = await response.blob();
            
            // Create a temporary link and trigger download
            a.href = URL.createObjectURL(blob);
            a.download = track.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
        } else if (track.source === 'youtube') {
            // Note: ytdl is assumed to be an external library loaded via script tags
            const videoId = track.id.replace('yt-', '');
            // This is a placeholder since ytdl does not run in a browser environment directly.
            // For a real app, this would require a backend proxy to process the download.
            // I'm retaining the original logic but adding a warning.
            
            showToast("YouTube downloads are not directly supported in the browser. Use a dedicated tool.", "error");
            throw new Error("YouTube download functionality requires a backend proxy.");
            
            /* ORIGINAL CODE (likely broken without a proxy)
            const info = await ytdl.getInfo(videoId);
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
            
            if (!format || !format.url) {
                throw new Error("No suitable audio format found for download.");
            }
            a.href = format.url;
            a.download = `${info.videoDetails.title.replace(/[\\/:"*?<>|]/g, '')}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            */
            
        } else {
            throw new Error("Track source is not downloadable from cloud.");
        }
        // Only show success for Drive downloads
        if (track.source === 'drive') {
            showToast('Download started!', 'success');
        }
    } catch(err) {
        console.error(`Download track failed:`, err);
        showToast(`Download failed: ${err.message}`, "error");
    }
}
