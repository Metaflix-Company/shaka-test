document.addEventListener('DOMContentLoaded', init);

async function init() {
    // Install built-in polyfills to patch browser incompatibilities
    shaka.polyfill.installAll();

    // Check if the browser supports the basic functionality
    if (!shaka.Player.isBrowserSupported()) {
        console.error('Browser not supported!');
        return;
    }

    // Get reference to video element
    const video = document.getElementById('video');
    
    // Create a Shaka Player instance
    const player = new shaka.Player(video);

    // Create UI
    const ui = new shaka.ui.Overlay(player, video.parentElement, video);
    
    // Configure UI
    const config = {
        'seekBarColors': {
            base: 'rgba(255,255,255,.2)',
            buffered: 'rgba(255,255,255,.4)',
            played: 'rgb(255,0,0)',
        }
    };
    ui.configure(config);

    // Configure DRM
    player.configure({
        drm: {
            servers: {
                'com.apple.fps.1_0': 'https://video.bunnycdn.com/FairPlayLicense/210728/de612f89-4ea4-48d2-a3d9-7b0c8a549c31'
            },
            advanced: {
                'com.apple.fps.1_0': {
                    serverCertificate: await fetchCertificate()
                }
            }
        }
    });

    try {
        // Load the manifest
        await player.load('https://vz-6bcb56df-cd1.b-cdn.net/de612f89-4ea4-48d2-a3d9-7b0c8a549c31/playlist.m3u8');
        console.log('The video has been loaded');

        // Update UI elements with YouTube style using vanilla JavaScript
        const settingsButton = document.querySelector('.shaka-overflow-menu-button');
        if (settingsButton) {
            settingsButton.textContent = 'settings';
        }

        const backButton = document.querySelector('.shaka-back-to-overflow-button .material-icons-round');
        if (backButton) {
            backButton.textContent = 'arrow_back_ios_new';
        }
    } catch (error) {
        console.error('Error loading video:', error);
    }

    // Listen to error events
    player.addEventListener('error', onError);
}

async function fetchCertificate() {
    try {
        const response = await fetch('https://video.bunnycdn.com/FairPlay/210728/certificate');
        return new Uint8Array(await response.arrayBuffer());
    } catch (error) {
        console.error('Error fetching certificate:', error);
        throw error;
    }
}

function onError(event) {
    console.error('Error code:', event.detail.code, 'object:', event.detail);
}
