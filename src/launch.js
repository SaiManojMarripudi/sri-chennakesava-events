// ==========================================
// SRI CHENNAKESAVA EVENTS
// PRIVATE WEBSITE LAUNCH PAGE
// ==========================================

import './launch.css';

import { gsap } from 'gsap';


// ==========================================
// RENDER LAUNCH PAGE
// ==========================================

export function renderLaunchPage() {

    return `

        <div class="launch-page">

            <!-- ==================================
                 MAIN LAUNCH SCREEN
                 ================================== -->

            <main
                id="launch-intro"
                class="launch-intro"
            >

                <div class="intro-brand">

                    <div class="intro-brand-name">
                        SRI CHENNAKESAVA
                    </div>

                    <div class="intro-brand-events">
                        EVENTS
                    </div>

                </div>


                <div class="intro-line"></div>


                <p class="intro-eyebrow">
                    PRIVATE WEBSITE LAUNCH
                </p>


                <h1 class="intro-title">
                    Ready to make
                    <span>your website live?</span>
                </h1>


                <p class="intro-description">
                    Everything is ready for the grand launch.
                </p>


                <button
                    id="launch-page-button"
                    class="launch-page-button"
                    type="button"
                >
                    <span class="launch-button-icon">
                        🚀
                    </span>

                    <span>
                        LAUNCH WEBSITE
                    </span>
                </button>

            </main>


            <!-- ==================================
                 COUNTDOWN OVERLAY
                 ================================== -->

            <div
                id="launch-overlay"
                class="launch-overlay"
                hidden
            >

                <div class="launch-backdrop"></div>


                <div
                    id="countdown-wrapper"
                    class="countdown-wrapper"
                >

                    <div
                        class="countdown-video-frame"
                    >

                        <video
                            id="countdown-video"
                            class="countdown-video"
                            preload="auto"
                            playsinline
                            controlslist="nodownload noplaybackrate"
                        >
                            <source
                                src="/video/countdown-reference.mp4"
                                type="video/mp4"
                            >
                        </video>

                    </div>


                </div>


                <!-- ==================================
                     FINAL LIVE SCREEN
                     ================================== -->

                <section
                    id="live-phase"
                    class="live-phase"
                    hidden
                >

                    <div class="live-brand">
                        SRI CHENNAKESAVA EVENTS
                    </div>


                    <h2 class="live-title">
                        IS LIVE
                    </h2>


                    <div
                        class="live-divider"
                    ></div>


                    <p class="live-message">
                        We are live now.
                    </p>

                </section>

            </div>

        </div>

    `;

}


// ==========================================
// INITIALIZE
// ==========================================

export function initializeLaunchPage() {

    const launchButton =
        document.getElementById(
            'launch-page-button'
        );


    const video =
        document.getElementById(
            'countdown-video'
        );


    if (!launchButton) {

        return;

    }


    launchButton.addEventListener(
        'click',
        () => {

            startVisualLaunch(
                video
            );

        }
    );

}


// ==========================================
// START VISUAL LAUNCH
// ==========================================

function startVisualLaunch(
    video
) {

    const intro =
        document.getElementById(
            'launch-intro'
        );


    const overlay =
        document.getElementById(
            'launch-overlay'
        );


    if (
        !intro ||
        !overlay ||
        !video
    ) {

        return;

    }


    // Prevent double click.

    const button =
        document.getElementById(
            'launch-page-button'
        );


    if (button) {

        button.disabled =
            true;

    }


    // ======================================
    // INTRO EXIT
    // ======================================

    gsap.timeline({

        onComplete: () => {

            intro.hidden =
                true;

            openCountdownOverlay(
                video
            );

        }

    })

        .to(
            button,
            {
                scale: 0.94,
                duration: 0.10,
                ease: 'power2.in'
            }
        )

        .to(
            button,
            {
                scale: 1.06,
                duration: 0.20,
                ease: 'back.out(2)'
            }
        )

        .to(
            button,
            {
                opacity: 0,
                scale: 1.12,
                duration: 0.35,
                ease: 'power3.in'
            }
        );

}


// ==========================================
// OPEN COUNTDOWN OVERLAY
// ==========================================

function openCountdownOverlay(
    video
) {

    const overlay =
        document.getElementById(
            'launch-overlay'
        );


    const wrapper =
        document.getElementById(
            'countdown-wrapper'
        );


    if (
        !overlay ||
        !wrapper
    ) {

        return;

    }


    overlay.hidden =
        false;


    gsap.set(
        overlay,
        {
            opacity: 0
        }
    );


    gsap.set(
        wrapper,
        {
            opacity: 0,
            scale: 0.96,
            y: 16
        }
    );


    gsap.timeline()

        .to(
            overlay,
            {
                opacity: 1,
                duration: 0.45,
                ease: 'power2.out'
            }
        )

        .to(
            wrapper,
            {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.50,
                ease: 'power3.out'
            },
            '-=0.20'
        )

        .add(
            () => {

                playCountdownVideo(
                    video
                );

            }
        );

}


// ==========================================
// PLAY REFERENCE COUNTDOWN VIDEO
// VIDEO + ORIGINAL AUDIO TOGETHER
// ==========================================

function playCountdownVideo(
    video
) {

    if (!video) {
        return;
    }


    video.pause();

    video.currentTime = 0;

    video.muted = false;

    video.volume = 1;

    video.playbackRate = 1;

    video.controls = false;


    // ======================================
    // WAIT FOR VIDEO TO BE READY
    // ======================================

    const startVideo = () => {

        video.currentTime = 0;

        const playPromise =
            video.play();


        if (
            playPromise &&
            typeof playPromise.catch === 'function'
        ) {

            playPromise.catch(
                error => {

                    console.error(
                        'Countdown video playback failed:',
                        error
                    );

                }
            );

        }

    };


    if (
        video.readyState >= 3
    ) {

        startVideo();

    } else {

        video.addEventListener(
            'canplay',
            startVideo,
            {
                once: true
            }
        );

    }


    // ======================================
    // VIDEO FINISHED
    // ======================================

    video.onended = () => {

        showLiveScreen();

    };

}


// ==========================================
// LIVE SCREEN
// ==========================================

function showLiveScreen() {

    const wrapper =
        document.getElementById(
            'countdown-wrapper'
        );


    const live =
        document.getElementById(
            'live-phase'
        );


    if (
        !wrapper ||
        !live
    ) {

        return;

    }


    gsap.to(
        wrapper,
        {
            opacity: 0,
            scale: 0.97,
            duration: 0.45,
            ease: 'power2.in',

            onComplete: () => {

                wrapper.hidden =
                    true;

                live.hidden =
                    false;

                speakLiveMessage();

                animateLiveScreen();

            }

        }
    );

}


// ==========================================
// LIVE SCREEN ANIMATION
// ==========================================

function animateLiveScreen() {

    const live =
        document.getElementById(
            'live-phase'
        );


    if (!live) {

        return;

    }


    const brand =
        live.querySelector(
            '.live-brand'
        );


    const title =
        live.querySelector(
            '.live-title'
        );


    const divider =
        live.querySelector(
            '.live-divider'
        );


    const message =
        live.querySelector(
            '.live-message'
        );


    gsap.set(
        live,
        {
            opacity: 1
        }
    );


    gsap.set(
        brand,
        {
            opacity: 0,
            y: 20
        }
    );


    gsap.set(
        title,
        {
            opacity: 0,
            scale: 0.85
        }
    );


    gsap.set(
        divider,
        {
            opacity: 0,
            scaleX: 0
        }
    );


    gsap.set(
        message,
        {
            opacity: 0,
            y: 16
        }
    );


    gsap.timeline()

        .to(
            brand,
            {
                opacity: 1,
                y: 0,
                duration: 0.60,
                ease: 'power3.out'
            }
        )

        .to(
            title,
            {
                opacity: 1,
                scale: 1,
                duration: 0.65,
                ease: 'back.out(1.5)'
            },
            '-=0.20'
        )

        .to(
            divider,
            {
                opacity: 1,
                scaleX: 1,
                duration: 0.35,
                ease: 'power2.out'
            },
            '-=0.15'
        )

        .to(
            message,
            {
                opacity: 1,
                y: 0,
                duration: 0.50,
                ease: 'power3.out'
            },
            '-=0.10'
        )

        
}


// ==========================================
// LIVE VOICE + REDIRECT
// ==========================================

function speakLiveMessage() {

    const redirectToWebsite = () => {

        window.location.href = '/';

    };


    if (
        !('speechSynthesis' in window)
    ) {

        redirectToWebsite();

        return;

    }


    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            'SRI CHENNAKESAVA EVENTS is live now.'
        );


    utterance.rate =
        0.72;


    utterance.pitch =
        0.88;


    utterance.volume =
        1;


    // ======================================
    // REDIRECT AFTER VOICE FINISHES
    // ======================================

    utterance.onend =
        () => {

            redirectToWebsite();

        };


    utterance.onerror =
        () => {

            redirectToWebsite();

        };


    window.speechSynthesis.speak(
        utterance
    );

}