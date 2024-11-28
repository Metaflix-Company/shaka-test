const streamApiHostName = 'https://video.bunnycdn.com'
const libraryId = 249011
const videoId = 'b98c3c67-402c-4471-9a9e-7fb2a1917ea8'
const storageZoneId = 'vz-b63efbcf-f92'
const storageDomain = 'b-cdn.net'
const manifestUri = `https://${storageZoneId}.${storageDomain}/${videoId}/playlist.m3u8`

const fpCertificateUri = `${streamApiHostName}/FairPlay/${libraryId}/certificate`
const fpLicenseUri = `${streamApiHostName}/FairPlay/${libraryId}/license/?videoId=${videoId}`
const wvLicenseUri = `${streamApiHostName}/WidevineLicense/${libraryId}/${videoId}`

async function initApp() {
    // Install built-in polyfills to patch browser incompatibilities.
    shaka.polyfill.installAll()

    // Check to see if the browser supports the basic APIs Shaka needs.
    if (shaka.Player.isBrowserSupported()) {
        // Everything looks good!
        initPlayer()
    } else {
        // This browser does not have the minimum set of APIs we need.
        console.error('Browser not supported!')
    }
}

async function initPlayer() {
    // Create a player instance.
    const video = document.getElementById('video')
    const player = new shaka.Player()

    // If Library has Enterprise DRM enabled we also configure Widevine and Fairplay license URLs
    player.configure({
        drm: {
            servers: {
                'com.widevine.alpha': wvLicenseUri,
                'com.apple.fps': fpLicenseUri
            }
        }
    })

    // For Fairplay, we have to manually configure the Fairplay server certificate uri. For Widevine that is automatically handled by Shaka Player.

    player.configure(
        'drm.advanced.com\\.apple\\.fps.serverCertificateUri',
        fpCertificateUri
    )

    video.addEventListener('error', (event) => {
        console.error(event)
    })

    // Attach Shaka Player to html element
    await player.attach(video)

    // Attach player to the window to make it easy to access in the JS console.
    window.player = player

    // Listen for error events.
    player.addEventListener('error', onErrorEvent)

    // Try to load a manifest.
    // This is an asynchronous process.
    try {
        await player.load(manifestUri)
        // This runs if the asynchronous load is successful.
        console.log('The video has now been loaded!')
    } catch (e) {
        // onError is executed if the asynchronous load fails.
        onError(e)
    }
}

function onErrorEvent(event) {
    // Extract the shaka.util.Error object from the event.
    onError(event.detail)
}

function onError(error) {
    // Log the error.
    console.error('Error code', error.code, 'object', error)
}

document.addEventListener('DOMContentLoaded', initApp)
