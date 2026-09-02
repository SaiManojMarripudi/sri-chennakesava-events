import './style.css'

import logo from './assets/logo/sce-logo.png'
import heroImage from './assets/hero/hero-event.jpg'

import weddingImage
    from './assets/gallery/Wedding.png';

import engagementImage
    from './assets/gallery/Engagement.jpg';

import birthdayImage
    from './assets/gallery/Birthday.jpg';

import anniversaryImage
    from './assets/gallery/Anniversary.png';

import balloonImage
    from './assets/gallery/Ballon.png';

import haldiImage
    from './assets/gallery/Haldi.jpeg';

import houseWarmingImage
    from './assets/gallery/House Warming.jpg';

import mehandiImage
    from './assets/gallery/Mehandi.jpg';

import poojaBackgroundImage
    from './assets/gallery/Pooja Background.png';

import stageLightingImage
    from './assets/gallery/Stage & Lighting.png';

import themeCorporateImage
    from './assets/gallery/Theme & Corporate.jpg';

import babyShowerImage
    from './assets/gallery/Baby Shower.jpeg';

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import {
        API_BASE_URL
    } from './config/api.js';

import {
    renderLaunchPage,
    initializeLaunchPage
} from './launch.js';

// ==========================================
// PRIVATE LAUNCH ROUTE
// ==========================================

const isLaunchRoute =
    window.location.pathname === '/launch';


// ==========================================
// ADMIN ROUTE
// ==========================================

const isAdminRoute =
    window.location.pathname === '/admin' ||
    window.location.pathname.startsWith('/admin/');


// ==========================================
// LOAD ADMIN APPLICATION
// ==========================================

if (isLaunchRoute) {

    document.querySelector('#app').innerHTML =
        renderLaunchPage();

    initializeLaunchPage();

} else if (isAdminRoute) {

    import('./admin/admin.js').then(
        ({ renderAdminApp }) => {

            renderAdminApp();

        }
    );

} else {


    gsap.registerPlugin(ScrollTrigger)

    /* =========================================
    SRI CHENNAKESAVA EVENTS
    BUSINESS LINKS
    ========================================= */

    const BUSINESS = {
        whatsapp: 'https://wa.me/9491759139',
        instagram: 'https://instagram.com/sri_chennakesava_events',
        email: 'srichennakesavaevents@gmail.com',
        facebook: 'YOUR_FACEBOOK_URL_HERE',
        youtube: 'YOUR_YOUTUBE_URL_HERE',
        contact: '+91 9491759139'
    }

    // ==========================================
    // GALLERY IMAGE COLLECTIONS
    // ==========================================

    const galleryAssetFiles =
        import.meta.glob(
            './assets/gallery/**/*.{png,jpg,jpeg,webp}',
            {
                eager: true,
                query: '?url',
                import: 'default'
            }
        );


    // ==========================================
    // GALLERY CONFIGURATION
    // ==========================================

    const GALLERY_CONFIG = [

        {
            id: 'wedding',
            filter: 'wedding',
            label: 'WEDDING',
            title: 'Elegant Celebrations',
            folder: 'wedding',
            layout: 'gallery-item-large'
        },

        {
            id: 'engagement',
            filter: 'engagement',
            label: 'ENGAGEMENT',
            title: 'Beautiful Beginnings',
            folder: 'engagement',
            layout: ''
        },

        {
            id: 'birthday',
            filter: 'birthday',
            label: 'BIRTHDAY',
            title: 'Beautiful Moments',
            folder: 'birthday',
            layout: ''
        },

        {
            id: 'anniversary',
            filter: 'anniversary',
            label: 'ANNIVERSARY',
            title: 'Love & Memories',
            folder: 'anniversary',
            layout: 'gallery-item-tall'
        },

        {
            id: 'haldi',
            filter: 'haldi',
            label: 'HALDI',
            title: 'Festive Colors',
            folder: 'haldi',
            layout: ''
        },

        {
            id: 'mehendi',
            filter: 'mehendi',
            label: 'MEHENDI',
            title: 'Traditional Elegance',
            folder: 'mehendi',
            layout: 'gallery-item-tall'
        },

        {
            id: 'housewarming',
            filter: 'housewarming',
            label: 'HOUSEWARMING',
            title: 'New Beginnings',
            folder: 'housewarming',
            layout: ''
        },

        {
            id: 'baby-shower',
            filter: 'baby-shower',
            label: 'BABY SHOWER',
            title: 'Little Moments',
            folder: 'baby-shower',
            layout: ''
        },

        {
            id: 'pooja',
            filter: 'pooja',
            label: 'POOJA',
            title: 'Traditional Grace',
            folder: 'pooja',
            layout: ''
        },

        {
            id: 'balloon',
            filter: 'balloon',
            label: 'BALLOON DECORATION',
            title: 'Creative Decor',
            folder: 'balloon',
            layout: ''
        },

        {
            id: 'stage-lighting',
            filter: 'stage-lighting',
            label: 'STAGE & LIGHTING',
            title: 'Event Production',
            folder: 'stage-lighting',
            layout: 'gallery-item-wide'
        },

        {
            id: 'theme-corporate',
            filter: 'theme-corporate',
            label: 'THEME & CORPORATE',
            title: 'Custom Experiences',
            folder: 'theme-corporate',
            layout: ''
        }

    ];


    // ==========================================
    // GET GALLERY IMAGES
    // ==========================================

    function getGalleryImages(folder) {

        const folderPrefix =
            `./assets/gallery/${folder}/`;


        return Object.entries(
            galleryAssetFiles
        )
            .filter(
                ([path]) =>
                    path.startsWith(
                        folderPrefix
                    )
            )
            .sort(
                ([pathA], [pathB]) =>
                    pathA.localeCompare(
                        pathB,
                        undefined,
                        {
                            numeric: true
                        }
                    )
            )
            .map(
                ([, url]) =>
                    url
            );

    }


    // ==========================================
    // BUILD GALLERY COLLECTIONS
    // ==========================================

    const galleryCollections =
        Object.fromEntries(

            GALLERY_CONFIG.map(
                service => [
                    service.id,
                    getGalleryImages(
                        service.folder
                    )
                ]
            )

        );


    // ==========================================
    // RENDER GALLERY
    // ==========================================

    function renderGallerySection() {

        return `

            <section
                id="gallery"
                class="gallery-section"
            >

                <div class="gallery-container">

                    <div class="gallery-header">

                        <span class="section-eyebrow">
                            OUR PORTFOLIO
                        </span>

                        <h2 class="section-title">
                            Moments We've
                            <span>Created.</span>
                        </h2>

                        <p class="gallery-introduction">
                            A glimpse into the celebrations,
                            decorations and memorable moments
                            we've helped create.
                        </p>

                    </div>


                    <div class="gallery-filters">

                        <button
                            class="gallery-filter active"
                            data-filter="all"
                            type="button"
                        >
                            All
                        </button>

                        ${GALLERY_CONFIG.map(
                            service => `
                                <button
                                    class="gallery-filter"
                                    data-filter="${service.filter}"
                                    type="button"
                                >
                                    ${service.label}
                                </button>
                            `
                        ).join('')}

                    </div>


                    <div class="gallery-grid">

                        ${GALLERY_CONFIG.map(
                            service => {

                                const images =
                                    galleryCollections[
                                        service.id
                                    ] || [];


                                const firstImage =
                                    images[0];


                                if (!firstImage) {
                                    return '';
                                }


                                return `

                                    <article
                                        class="gallery-item ${service.layout}"
                                        data-category="${service.filter}"
                                        data-gallery-id="${service.id}"
                                    >

                                        <img
                                            src="${firstImage}"
                                            alt="${service.label}"
                                            class="gallery-image"
                                            loading="lazy"
                                        >

                                        <div
                                            class="gallery-overlay"
                                        >

                                            <div
                                                class="gallery-info"
                                            >

                                                <span>
                                                    ${service.label}
                                                </span>

                                                <h3>
                                                    ${service.title}
                                                </h3>

                                            </div>


                                            <button
                                                class="gallery-view"
                                                type="button"
                                                aria-label="View ${service.label}"
                                                data-gallery-id="${service.id}"
                                            >
                                                ↗
                                            </button>

                                        </div>

                                    </article>

                                `;

                            }
                        ).join('')}

                    </div>


                    <div class="gallery-cta">

                        <p>
                            Have a vision for your celebration?
                        </p>

                        <a
                            href="#contact"
                            class="btn btn-primary"
                        >
                            Discuss Your Event
                        </a>

                    </div>

                </div>

            </section>

        `;

    }

    document.querySelector('#app').innerHTML = `
        <div class="site-wrapper">

            <!-- ==============================
                NAVIGATION
                ============================== -->

            <header class="site-header">

                <nav class="navbar">

                    <!-- Logo / Brand -->
                    <a href="#home" class="brand" aria-label="SRI CHENNAKESAVA EVENTS Home">

                        <img
                            src="${logo}"
                            alt="SRI CHENNAKESAVA EVENTS Logo"
                            class="brand-logo"
                        >

                        <div class="brand-text">
                            <span class="brand-name">
                                SRI CHENNAKESAVA
                            </span>

                            <span class="brand-subtitle">
                                EVENTS
                            </span>
                        </div>

                    </a>
                    


                    <!-- Desktop Navigation -->
                    <div class="nav-links">

                        <a href="#home" class="nav-link active">
                            Home
                        </a>

                        <a href="#about" class="nav-link">
                            About
                        </a>

                        <a href="#services" class="nav-link">
                            Services
                        </a>

                        <a href="#gallery" class="nav-link">
                            Gallery
                        </a>

                        <a href="#contact" class="nav-link">
                            Contact
                        </a>

                        <button
                            class="info-trigger nav-info-trigger"
                            id="info-trigger"
                            type="button"
                            aria-label="Open SRI CHENNAKESAVA EVENTS information"
                            aria-haspopup="dialog"
                            aria-expanded="false"
                            title="About SRI CHENNAKESAVA EVENTS"
                        >
                            <span aria-hidden="true">i</span>
                        </button>

                    </div>


                    <!-- Mobile Menu Button -->
                    <button
                        class="menu-toggle"
                        id="menu-toggle"
                        type="button"
                        aria-label="Open navigation menu"
                        aria-expanded="false"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                </nav>

            </header>


            <!-- =====================================
                BUSINESS INFORMATION MODAL
                ===================================== -->

            <div
                class="event-info-modal"
                id="event-info-modal"
                aria-hidden="true"
                role="dialog"
                aria-modal="true"
                aria-labelledby="event-info-title"
            >

                <div class="event-info-panel">

                    <button
                        class="event-info-close"
                        id="event-info-close"
                        type="button"
                        aria-label="Close business information"
                    >
                        ×
                    </button>

                    <span class="section-eyebrow event-info-eyebrow">ABOUT OUR EVENTS</span>

                    <h2 id="event-info-title">
                        SRI CHENNAKESAVA
                        <span>EVENTS</span>
                    </h2>

                    <p>
                        We create elegant and memorable celebrations through thoughtful
                        event planning, premium decorations and professional execution.
                        From weddings and traditional functions to birthdays, housewarmings
                        and intimate celebrations, we bring your ideas to life with care.
                    </p>

                    <div class="event-info-highlights">
                        <span>Elegant Designs</span>
                        <span>Quality Service</span>
                        <span>On-Time Execution</span>
                    </div>

                    <div class="event-info-social" aria-label="Social media links">
                        <a id="info-facebook" href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V5h-3c-2.8 0-5 2.2-5 5v2H6v3h3v6h3v-6h3l1-3h-4v-2c0-1.1.9-2 2-2z"/></svg>
                        </a>
                        <a id="info-instagram" href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" class="icon-fill"/></svg>
                        </a>
                        <a id="info-youtube" href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2C2 9 2 12 2 12s0 3 .4 4.8a2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2C22 15 22 12 22 12s0-3-.4-4.8z"/><path class="icon-cutout" d="m10 9 5 3-5 3V9z"/></svg>
                        </a>
                    </div>

                    <p class="event-info-note">Follow our work and stay connected with our latest celebrations.</p>

                </div>

            </div>


            <!-- ==============================
                MAIN WEBSITE CONTENT
                ============================== -->

            <main>

                <section id="home" class="hero-section">

                    <!-- Decorative background elements -->
                    <div class="hero-glow hero-glow-one"></div>
                    <div class="hero-glow hero-glow-two"></div>

                    <div class="hero-container">

                        <!-- Hero text -->

                        <div class="hero-content">

                            <span class="hero-eyebrow">
                                PREMIUM EVENT PLANNING • DECORATION • CELEBRATION
                            </span>

                            <h1 class="hero-title">
                                Creating Moments.
                                <span>Celebrating Memories.</span>
                            </h1>

                            <p class="hero-description">
                                We transform your special occasions into elegant, beautifully
                                styled experiences with thoughtful details and seamless execution.
                            </p>

                            <div class="hero-actions">

                                <a
                                    href="#contact"
                                    class="btn btn-primary"
                                >
                                    Plan Your Event
                                </a>

                                <a
                                    href="#gallery"
                                    class="btn btn-secondary"
                                >
                                    View Our Work
                                </a>

                            </div>

                        </div>


                        <!-- Hero image -->

                        <div class="hero-visual">

                            <div class="hero-image-frame">

                                <div class="hero-image-glow"></div>

                                <img
                                    src="${heroImage}"
                                    alt="Elegant event decoration by SRI CHENNAKESAVA EVENTS"
                                    class="hero-image"
                                >

                            </div>

                            <div class="hero-decoration hero-decoration-one">
                                ✦
                            </div>

                            <div class="hero-decoration hero-decoration-two">
                                ✧
                            </div>

                        </div>

                    </div>


                    <!-- Scroll indicator -->

                    <a
                        href="#about"
                        class="scroll-indicator"
                        aria-label="Scroll to About section"
                    >
                        <span>Scroll to explore</span>
                        <div class="scroll-line"></div>
                    </a>

                </section>
                

                <section id="about" class="about-section">

                    <div class="about-container">

                        <!-- About Image Collage -->

                        <div class="about-visual about-collage">

                            <div class="about-collage-orbit" aria-hidden="true"></div>

                            <figure class="about-collage-card about-collage-card-main">
                                <img
                                    src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85"
                                    alt="Elegant wedding decoration"
                                    class="about-collage-image"
                                    loading="lazy"
                                >
                            </figure>

                            <figure class="about-collage-card about-collage-card-top">
                                <img
                                    src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=700&q=85"
                                    alt="Birthday celebration decoration"
                                    class="about-collage-image"
                                    loading="lazy"
                                >
                            </figure>

                            <figure class="about-collage-card about-collage-card-left">
                                <img
                                    src="https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=700&q=85"
                                    alt="Floral Haldi decoration"
                                    class="about-collage-image"
                                    loading="lazy"
                                >
                            </figure>

                            <figure class="about-collage-card about-collage-card-bottom">
                                <img
                                    src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=85"
                                    alt="Traditional event decoration"
                                    class="about-collage-image"
                                    loading="lazy"
                                >
                            </figure>

                            <div class="about-collage-badge">
                                <strong>CREATE</strong>
                                <span>•</span>
                                <strong>CELEBRATE</strong>
                            </div>

                        </div>


                        <!-- About Content -->

                        <div class="about-content">

                            <span class="section-eyebrow">
                                ABOUT US
                            </span>

                            <h2 class="section-title">
                                Every Celebration
                                <span>Deserves Something Special.</span>
                            </h2>

                            <p class="about-lead">
                                At SRI CHENNAKESAVA EVENTS, we believe that
                                every celebration has its own story.
                            </p>

                            <p class="about-text">
                                From intimate family functions to grand celebrations,
                                we design every detail around your vision. Our team
                                combines elegant styling, careful planning and reliable
                                execution to make your celebration feel truly yours.
                            </p>

                            <div class="about-features">

                                <div class="about-feature">

                                    <span class="feature-number">
                                        01
                                    </span>

                                    <div>
                                        <h3>
                                            Elegant Designs
                                        </h3>

                                        <p>
                                            Beautiful decorations designed
                                            around your celebration.
                                        </p>
                                    </div>

                                </div>


                                <div class="about-feature">

                                    <span class="feature-number">
                                        02
                                    </span>

                                    <div>
                                        <h3>
                                            Quality Service
                                        </h3>

                                        <p>
                                            Attention to detail from planning
                                            to final setup.
                                        </p>
                                    </div>

                                </div>


                                <div class="about-feature">

                                    <span class="feature-number">
                                        03
                                    </span>

                                    <div>
                                        <h3>
                                            On-Time Execution
                                        </h3>

                                        <p>
                                            Professional preparation and
                                            timely event setup.
                                        </p>
                                    </div>

                                </div>

                            </div>

                            <a
                                href="#services"
                                class="text-link"
                            >
                                Discover Our Services
                                <span>→</span>
                            </a>

                        </div>

                    </div>

                </section>
                
                <section id="services" class="services-section">

                    <!-- Decorative background -->

                    <div class="services-background-glow services-glow-one"></div>
                    <div class="services-background-glow services-glow-two"></div>


                    <div class="services-container">

                        <!-- Section Header -->

                        <div class="services-header">

                            <div class="services-heading">

                                <span class="section-eyebrow services-eyebrow">
                                    WHAT WE DO
                                </span>

                                <h2 class="section-title services-title">
                                    Celebrations,
                                    <span>Designed Beautifully.</span>
                                </h2>

                            </div>


                            <p class="services-introduction">
                                From intimate family celebrations to
                                grand occasions, we create thoughtfully
                                designed experiences that make every
                                moment memorable.
                            </p>

                        </div>


                        <!-- Services Grid -->

                        <div class="services-grid">


                            <!-- Service 01 -->

                            <article
                                class="service-card"
                                data-service="wedding"
                            >

                                <div class="service-card-image">
                                    <img
                                        src="${weddingImage}"
                                        alt="Wedding decoration"
                                        loading="lazy"
                                    >
                                </div>

                                <div class="service-card-number">
                                    01
                                </div>

                                <div class="service-card-icon">
                                    ✦
                                </div>

                                <div class="service-card-content">

                                    <span class="service-category">
                                        GRAND CELEBRATIONS
                                    </span>

                                    <h3>
                                        Wedding
                                        <span>Decoration</span>
                                    </h3>

                                    <p>
                                        Elegant stage, floral and venue
                                        decorations designed for your
                                        special day.
                                    </p>

                                    <a href="#contact" class="service-link">
                                        Explore Service
                                        <span>↗</span>
                                    </a>

                                </div>

                            </article>


                            <!-- Service 02 -->

                            <article
                                class="service-card"
                                data-service="engagement"
                            >

                                <div class="service-card-image">
                                    <img
                                        src="${engagementImage}"
                                        alt="Engagement decoration"
                                        loading="lazy"
                                    >
                                </div>

                                <div class="service-card-number">
                                    02
                                </div>

                                <div class="service-card-icon">
                                    ✧
                                </div>

                                <div class="service-card-content">

                                    <span class="service-category">
                                        SPECIAL OCCASIONS
                                    </span>

                                    <h3>
                                        Engagement
                                        <span>Decoration</span>
                                    </h3>

                                    <p>
                                        Beautiful and elegant setups that
                                        create the perfect atmosphere for
                                        your engagement.
                                    </p>

                                    <a href="#contact" class="service-link">
                                        Explore Service
                                        <span>↗</span>
                                    </a>

                                </div>

                            </article>


                            <!-- Service 03 -->

                            <article
                                class="service-card"
                                data-service="birthday"
                            >

                                <div class="service-card-image">
                                    <img
                                        src="${birthdayImage}"
                                        alt="Birthday decoration"
                                        loading="lazy"
                                    >
                                </div>

                                <div class="service-card-number">
                                    03
                                </div>

                                <div class="service-card-icon">
                                    ✦
                                </div>

                                <div class="service-card-content">

                                    <span class="service-category">
                                        FUN & JOY
                                    </span>

                                    <h3>
                                        Birthday
                                        <span>Decoration</span>
                                    </h3>

                                    <p>
                                        Creative balloon and theme
                                        decorations for memorable
                                        birthday celebrations.
                                    </p>

                                    <a href="#contact" class="service-link">
                                        Explore Service
                                        <span>↗</span>
                                    </a>

                                </div>

                            </article>


                            <!-- Service 04 -->

                            <article
                                class="service-card"
                                data-service="anniversary"
                            >

                                <div class="service-card-image">
                                    <img
                                        src="${anniversaryImage}"
                                        alt="Anniversary celebration"
                                        loading="lazy"
                                    >
                                </div>

                                <div class="service-card-number">
                                    04
                                </div>

                                <div class="service-card-icon">
                                    ♡
                                </div>

                                <div class="service-card-content">

                                    <span class="service-category">
                                        LOVE & MEMORIES
                                    </span>

                                    <h3>
                                        Anniversary
                                        <span>Decoration</span>
                                    </h3>

                                    <p>
                                        Romantic and elegant decoration
                                        concepts created to celebrate
                                        beautiful milestones.
                                    </p>

                                    <a href="#contact" class="service-link">
                                        Explore Service
                                        <span>↗</span>
                                    </a>

                                </div>

                            </article>


                            <!-- Service 05 -->

                            <article
                                class="service-card"
                                data-service="haldi"
                            >

                                <div class="service-card-image">
                                    <img
                                        src="${haldiImage}"
                                        alt="Haldi decoration"
                                        loading="lazy"
                                    >
                                </div>

                                <div class="service-card-number">
                                    05
                                </div>

                                <div class="service-card-icon">
                                    ❋
                                </div>

                                <div class="service-card-content">

                                    <span class="service-category">
                                        TRADITIONAL
                                    </span>

                                    <h3>
                                        Haldi
                                        <span>Decoration</span>
                                    </h3>

                                    <p>
                                        Vibrant floral and traditional
                                        decorations for joyful Haldi
                                        celebrations.
                                    </p>

                                    <a href="#contact" class="service-link">
                                        Explore Service
                                        <span>↗</span>
                                    </a>

                                </div>

                            </article>


                            <!-- Service 06 -->

                            <article
                                class="service-card"
                                data-service="mehendi"
                            >

                                <div class="service-card-image">
                                    <img
                                        src="${mehandiImage}"
                                        alt="Mehendi decoration"
                                        loading="lazy"
                                    >
                                </div>

                                <div class="service-card-number">
                                    06
                                </div>

                                <div class="service-card-icon">
                                    ❈
                                </div>

                                <div class="service-card-content">

                                    <span class="service-category">
                                        FESTIVE
                                    </span>

                                    <h3>
                                        Mehendi
                                        <span>Decoration</span>
                                    </h3>

                                    <p>
                                        Colorful and artistic setups
                                        designed for vibrant Mehendi
                                        celebrations.
                                    </p>

                                    <a href="#contact" class="service-link">
                                        Explore Service
                                        <span>↗</span>
                                    </a>

                                </div>

                            </article>


                            <!-- Service 07 -->

                            <article
                                class="service-card"
                                data-service="housewarming"
                            >

                                <div class="service-card-image">
                                    <img
                                        src="${houseWarmingImage}"
                                        alt="Housewarming event decoration"
                                        loading="lazy"
                                    >
                                </div>

                                <div class="service-card-number">
                                    07
                                </div>

                                <div class="service-card-icon">
                                    ✿
                                </div>

                                <div class="service-card-content">

                                    <span class="service-category">
                                        NEW BEGINNINGS
                                    </span>

                                    <h3>
                                        Housewarming
                                        <span>Decoration</span>
                                    </h3>

                                    <p>
                                        Graceful decorations for house
                                        openings, poojas and meaningful
                                        new beginnings.
                                    </p>

                                    <a href="#contact" class="service-link">
                                        Explore Service
                                        <span>↗</span>
                                    </a>

                                </div>

                            </article>


                            <!-- Service 08 -->

                            <article
                                class="service-card"
                                data-service="baby"
                            >

                                <div class="service-card-image">
                                    <img
                                        src="${babyShowerImage}"
                                        alt="Welcome baby celebration"
                                        loading="lazy"
                                    >
                                </div>

                                <div class="service-card-number">
                                    08
                                </div>

                                <div class="service-card-icon">
                                    ✧
                                </div>

                                <div class="service-card-content">

                                    <span class="service-category">
                                        LITTLE MOMENTS
                                    </span>

                                    <h3>
                                        Welcome Baby
                                        <span>Decoration</span>
                                    </h3>

                                    <p>
                                        Sweet and elegant decorations
                                        created to welcome your little
                                        one with love.
                                    </p>

                                    <a href="#contact" class="service-link">
                                        Explore Service
                                        <span>↗</span>
                                    </a>

                                </div>

                            </article>


                            <!-- Service 09 -->

                            <article
                                class="service-card"
                                data-service="pooja"
                            >

                                <div class="service-card-image">
                                    <img
                                        src="${poojaBackgroundImage}"
                                        alt="Pooja decoration"
                                        loading="lazy"
                                    >
                                </div>

                                <div class="service-card-number">
                                    09
                                </div>

                                <div class="service-card-icon">
                                    ✺
                                </div>

                                <div class="service-card-content">

                                    <span class="service-category">
                                        TRADITIONAL EVENTS
                                    </span>

                                    <h3>
                                        Pooja
                                        <span>Decoration</span>
                                    </h3>

                                    <p>
                                        Elegant and respectful decorative
                                        backgrounds for poojas and
                                        traditional functions.
                                    </p>

                                    <a href="#contact" class="service-link">
                                        Explore Service
                                        <span>↗</span>
                                    </a>

                                </div>

                            </article>


                            <!-- Service 10 -->

                            <article
                                class="service-card"
                                data-service="balloon"
                            >

                                <div class="service-card-image">
                                    <img
                                        src="${balloonImage}"
                                        alt="Balloon decoration"
                                        loading="lazy"
                                    >
                                </div>

                                <div class="service-card-number">
                                    10
                                </div>

                                <div class="service-card-icon">
                                    ●
                                </div>

                                <div class="service-card-content">

                                    <span class="service-category">
                                        CREATIVE DECOR
                                    </span>

                                    <h3>
                                        Balloon
                                        <span>Decoration</span>
                                    </h3>

                                    <p>
                                        Stylish balloon arrangements and
                                        themed setups for birthdays and
                                        intimate celebrations.
                                    </p>

                                    <a href="#contact" class="service-link">
                                        Explore Service
                                        <span>↗</span>
                                    </a>

                                </div>

                            </article>


                            <!-- Service 11 -->

                            <article
                                class="service-card"
                                data-service="stage"
                            >

                                <div class="service-card-image">
                                    <img
                                        src="${stageLightingImage}"
                                        alt="Stage and lighting setup"
                                        loading="lazy"
                                    >
                                </div>

                                <div class="service-card-number">
                                    11
                                </div>

                                <div class="service-card-icon">
                                    ✦
                                </div>

                                <div class="service-card-content">

                                    <span class="service-category">
                                        EVENT PRODUCTION
                                    </span>

                                    <h3>
                                        Stage &
                                        <span>Lighting</span>
                                    </h3>

                                    <p>
                                        Complete stage arrangements,
                                        lighting and event ambience
                                        solutions.
                                    </p>

                                    <a href="#contact" class="service-link">
                                        Explore Service
                                        <span>↗</span>
                                    </a>

                                </div>

                            </article>


                            <!-- Service 12 -->

                            <article
                                class="service-card"
                                data-service="theme"
                            >

                                <div class="service-card-image">
                                    <img
                                        src="${themeCorporateImage}"
                                        alt="Theme and corporate event"
                                        loading="lazy"
                                    >
                                </div>

                                <div class="service-card-number">
                                    12
                                </div>

                                <div class="service-card-icon">
                                    ◇
                                </div>

                                <div class="service-card-content">

                                    <span class="service-category">
                                        CUSTOM EXPERIENCES
                                    </span>

                                    <h3>
                                        Theme &
                                        <span>Corporate Events</span>
                                    </h3>

                                    <p>
                                        Customized event concepts and
                                        professional decorations tailored
                                        to your requirements.
                                    </p>

                                    <a href="#contact" class="service-link">
                                        Explore Service
                                        <span>↗</span>
                                    </a>

                                </div>

                            </article>

                        </div>


                        <!-- Services CTA -->

                        <div class="services-cta">

                            <p>
                                Planning something special?
                            </p>

                            <a
                                href="#contact"
                                class="btn btn-primary"
                            >
                                Let's Plan Your Event
                            </a>

                        </div>

                    </div>

                </section>

                
                ${renderGallerySection()}

                <!-- =====================================
                    STATS / PROMISE
                    ===================================== -->

                <section class="stats-section">
                    <div class="stats-pattern stats-pattern-left" aria-hidden="true"></div>
                    <div class="stats-pattern stats-pattern-right" aria-hidden="true"></div>

                    <div class="stats-container">
                        <article class="stat-card">
                            <div class="stat-icon">▣</div>
                            <div><span class="stat-number" id="stat-events">25+</span><span class="stat-label">Successfully Planned Events</span></div>
                        </article>
                        <article class="stat-card">
                            <div class="stat-icon">★</div>
                            <div><span class="stat-number" id="stat-vendors">15+</span><span class="stat-label">Trusted Vendors</span></div>
                        </article>
                        <article class="stat-card">
                            <div class="stat-icon">♢</div>
                            <div><span class="stat-number" id="stat-client">100%</span><span class="stat-label">Client-Focused Planning</span></div>
                        </article>
                        <article class="stat-card">
                            <div class="stat-icon">✪</div>
                            <div><span class="stat-number" id="stat-support">24/7</span><span class="stat-label">Event Support</span></div>
                        </article>
                    </div>
                </section>
                
                <!-- =====================================
                EXPERIENCE / HIGHLIGHTS
                ===================================== -->

                <section class="experience-section" id="highlights">

                    <div class="experience-pattern experience-pattern-left" aria-hidden="true"></div>
                    <div class="experience-pattern experience-pattern-right" aria-hidden="true"></div>

                    <div class="experience-container">

                        <div class="experience-heading">
                            <span class="section-eyebrow">WHY CHOOSE US</span>
                            <h2 class="section-title">
                                Elegant Events,
                                <span>Lasting Memories.</span>
                            </h2>
                        </div>

                        <div class="experience-grid">
                            <article class="experience-card">
                                <div class="experience-icon">✦</div>
                                <h3>Memorable Moments</h3>
                                <p>Thoughtfully planned celebrations tailored to your unique vision.</p>
                            </article>
                            <article class="experience-card">
                                <div class="experience-icon">❋</div>
                                <h3>Dream Weddings</h3>
                                <p>Elegant décor, seamless planning and beautiful details for your special day.</p>
                            </article>
                            <article class="experience-card">
                                <div class="experience-icon">✧</div>
                                <h3>Perfect Beginnings</h3>
                                <p>Graceful arrangements for engagements, housewarmings and new beginnings.</p>
                            </article>
                            <article class="experience-card">
                                <div class="experience-icon">♡</div>
                                <h3>Joyful Celebrations</h3>
                                <p>Creative birthday, Haldi, Mehendi and intimate celebrations filled with joy.</p>
                            </article>
                        </div>

                    </div>

                </section>

                <!-- =====================================
                    CONTACT / ENQUIRY SECTION
                    ===================================== -->

                <section id="contact" class="contact-section">

                    <div class="contact-container">


                        <!-- =================================
                            CONTACT INTRODUCTION
                            ================================= -->

                        <div class="contact-intro">

                            <span class="section-eyebrow contact-eyebrow">
                                LET'S CREATE SOMETHING BEAUTIFUL
                            </span>

                            <h2 class="contact-title">
                                Tell Us About
                                <span>Your Celebration.</span>
                            </h2>

                            <p class="contact-description">
                                Planning a wedding, birthday, housewarming,
                                Haldi, Mehendi or any special occasion?
                                Tell us what you have in mind and our team
                                will get in touch with you.
                            </p>


                            <!-- Contact information -->

                            <div class="contact-details">

                                <a
                                    href="${BUSINESS.whatsapp}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="contact-detail"
                                >
                                    <span class="contact-detail-icon contact-whatsapp-icon" aria-hidden="true">
                                        <svg viewBox="0 0 24 24"><path d="M20 4.1A10.1 10.1 0 0 0 3.5 16.2L2 22l5.9-1.5A10.1 10.1 0 1 0 20 4.1Zm-8 16a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-3.5.9.9-3.4-.2-.4A8.1 8.1 0 1 1 12 20.1Zm4.5-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.1-.3.2-.5.1-1.8-.9-3-1.6-4.2-3.6-.3-.5.3-.5.8-1.4.1-.2.1-.3 0-.5l-.4-1c-.1-.3-.5-1.1-.7-1.2-.2-.1-.4-.1-.6-.1h-.4c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.1s.9 2.4 1 2.5c.1.2 1.8 2.8 4.4 3.9 2.2 1 2.2.7 2.6.7.4 0 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2Z"/></svg>
                                    </span>
                                    <span>
                                        <small>WHATSAPP</small>
                                        <strong>Chat With Us</strong>
                                    </span>
                                </a>

                                <a
                                    href="${BUSINESS.instagram}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="contact-detail"
                                >
                                    <span class="contact-detail-icon" aria-hidden="true">
                                        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" class="icon-fill"/></svg>
                                    </span>
                                    <span>
                                        <small>INSTAGRAM</small>
                                        <strong>Follow Our Work</strong>
                                    </span>
                                </a>

                                <a
                                    href="mailto:${BUSINESS.email}"
                                    class="contact-detail contact-email-detail"
                                    data-email-link
                                >
                                    <span class="contact-detail-icon" aria-hidden="true">
                                        <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>
                                    </span>
                                    <span>
                                        <small>EMAIL</small>
                                        <strong id="business-email-label">Email Us</strong>
                                    </span>
                                </a>

                            </div>

                            

                        </div>


                        <!-- =================================
                            ENQUIRY FORM
                            ================================= -->

                        <div class="enquiry-card">

                            <div class="enquiry-card-header">

                                <span>
                                    EVENT ENQUIRY
                                </span>

                                <h3>
                                    Let's Plan Your Event
                                </h3>

                                <p>
                                    Share a few details and we'll
                                    get back to you.
                                </p>

                            </div>


                            <form
                                id="enquiry-form"
                                class="enquiry-form"
                            >


                                <!-- Name -->

                                <div class="form-group">

                                    <label for="customer-name">
                                        Your Name *
                                    </label>

                                    <input
                                        type="text"
                                        id="customer-name"
                                        name="customerName"
                                        placeholder="Enter your name"
                                        autocomplete="name"
                                        required
                                    >

                                </div>


                                <!-- Phone -->

                                <div class="form-group">

                                    <label for="customer-phone">
                                        Phone / WhatsApp *
                                    </label>

                                    <input
                                        type="tel"
                                        id="customer-phone"
                                        name="customerPhone"
                                        placeholder="Enter your phone number"
                                        autocomplete="tel"
                                        required
                                    >

                                </div>


                                <!-- Email -->

                                <div class="form-group">

                                    <label for="customer-email">
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        id="customer-email"
                                        name="customerEmail"
                                        placeholder="Enter your email"
                                        autocomplete="email"
                                    >

                                </div>


                                <!-- Event Type -->

                                <div class="form-group">

                                    <label>
                                        Event Type(s) *
                                    </label>

                                    <div
                                        class="event-type-multiselect"
                                        id="event-type-multiselect"
                                    >

                                        <button
                                            type="button"
                                            class="event-type-selector"
                                            id="event-type-selector"
                                        >
                                            <span id="event-type-selected-text">
                                                Select one or more services
                                            </span>

                                            <span class="event-type-arrow">
                                                ▾
                                            </span>
                                        </button>


                                        <div
                                            class="event-type-options"
                                            id="event-type-options"
                                        >

                                            <label class="event-type-option">
                                                <input
                                                    type="checkbox"
                                                    name="eventType"
                                                    value="Wedding"
                                                >
                                                <span>Wedding</span>
                                            </label>

                                            <label class="event-type-option">
                                                <input
                                                    type="checkbox"
                                                    name="eventType"
                                                    value="Engagement"
                                                >
                                                <span>Engagement</span>
                                            </label>

                                            <label class="event-type-option">
                                                <input
                                                    type="checkbox"
                                                    name="eventType"
                                                    value="Birthday"
                                                >
                                                <span>Birthday</span>
                                            </label>

                                            <label class="event-type-option">
                                                <input
                                                    type="checkbox"
                                                    name="eventType"
                                                    value="Anniversary"
                                                >
                                                <span>Anniversary</span>
                                            </label>

                                            <label class="event-type-option">
                                                <input
                                                    type="checkbox"
                                                    name="eventType"
                                                    value="Haldi"
                                                >
                                                <span>Haldi</span>
                                            </label>

                                            <label class="event-type-option">
                                                <input
                                                    type="checkbox"
                                                    name="eventType"
                                                    value="Mehendi"
                                                >
                                                <span>Mehendi</span>
                                            </label>

                                            <label class="event-type-option">
                                                <input
                                                    type="checkbox"
                                                    name="eventType"
                                                    value="Housewarming"
                                                >
                                                <span>Housewarming</span>
                                            </label>

                                            <label class="event-type-option">
                                                <input
                                                    type="checkbox"
                                                    name="eventType"
                                                    value="Welcome Baby"
                                                >
                                                <span>Welcome Baby</span>
                                            </label>

                                            <label class="event-type-option">
                                                <input
                                                    type="checkbox"
                                                    name="eventType"
                                                    value="Pooja"
                                                >
                                                <span>Pooja</span>
                                            </label>

                                            <label class="event-type-option">
                                                <input
                                                    type="checkbox"
                                                    name="eventType"
                                                    value="Balloon Decoration"
                                                >
                                                <span>Balloon Decoration</span>
                                            </label>

                                            <label class="event-type-option">
                                                <input
                                                    type="checkbox"
                                                    name="eventType"
                                                    value="Stage & Lighting"
                                                >
                                                <span>Stage & Lighting</span>
                                            </label>

                                            <label class="event-type-option">
                                                <input
                                                    type="checkbox"
                                                    name="eventType"
                                                    value="Theme / Corporate Event"
                                                >
                                                <span>Theme / Corporate Event</span>
                                            </label>

                                            <label class="event-type-option">
                                                <input
                                                    type="checkbox"
                                                    name="eventType"
                                                    value="Mandapam Decoration"
                                                >
                                                <span>Mandapam Decoration</span>
                                            </label>

                                            <label class="event-type-option">
                                                <input
                                                    type="checkbox"
                                                    name="eventType"
                                                    value="Temple Decoration"
                                                >
                                                <span>Temple Decoration</span>
                                            </label>

                                            <label class="event-type-option">
                                                <input
                                                    type="checkbox"
                                                    name="eventType"
                                                    value="Sound System"
                                                >
                                                <span>Sound System</span>
                                            </label>

                                            <label class="event-type-option">
                                                <input
                                                    type="checkbox"
                                                    name="eventType"
                                                    value="Drums"
                                                >
                                                <span>Drums</span>
                                            </label>

                                            <label class="event-type-option">
                                                <input
                                                    type="checkbox"
                                                    name="eventType"
                                                    value="Other"
                                                >
                                                <span>Other</span>
                                            </label>

                                        </div>

                                    </div>

                                </div>


                                <!-- Event Date -->

                                <div class="form-group">

                                    <label for="event-date">
                                        Event Date *
                                    </label>

                                    <input
                                        type="date"
                                        id="event-date"
                                        name="eventDate"
                                        required
                                    >

                                </div>


                                <!-- Guest Count -->

                                <div class="form-group">

                                    <label for="guest-count">
                                        Approx. Guests
                                    </label>

                                    <select
                                        id="guest-count"
                                        name="guestCount"
                                    >

                                        <option value="">
                                            Select guest count
                                        </option>

                                        <option value="Below 50">
                                            Below 50
                                        </option>

                                        <option value="50 - 100">
                                            50 - 100
                                        </option>

                                        <option value="100 - 250">
                                            100 - 250
                                        </option>

                                        <option value="250 - 500">
                                            250 - 500
                                        </option>

                                        <option value="500+">
                                            500+
                                        </option>

                                    </select>

                                </div>


                                <!-- Budget -->

                                <div class="form-group">

                                    <label for="budget">
                                        Approx. Budget
                                    </label>

                                    <select
                                        id="budget"
                                        name="budget"
                                    >

                                        <option value="">
                                            Select budget
                                        </option>

                                        <option value="Below ₹10,000">
                                            Below ₹10,000
                                        </option>

                                        <option value="₹10,000 - ₹25,000">
                                            ₹10,000 - ₹25,000
                                        </option>

                                        <option value="₹25,000 - ₹50,000">
                                            ₹25,000 - ₹50,000
                                        </option>

                                        <option value="₹50,000 - ₹1,00,000">
                                            ₹50,000 - ₹1,00,000
                                        </option>

                                        <option value="₹1,00,000+">
                                            ₹1,00,000+
                                        </option>

                                        <option value="Not decided yet">
                                            Not decided yet
                                        </option>

                                    </select>

                                </div>


                                <!-- Location -->

                                <div class="form-group full-width">

                                    <label for="event-location">
                                        Event Location
                                    </label>

                                    <input
                                        type="text"
                                        id="event-location"
                                        name="eventLocation"
                                        placeholder="City / area"
                                    >

                                </div>


                                <!-- Message -->

                                <div class="form-group full-width">

                                    <label for="customer-message">
                                        Tell Us More
                                    </label>

                                    <textarea
                                        id="customer-message"
                                        name="message"
                                        rows="5"
                                        placeholder="Tell us about your decoration requirements, theme, preferences, etc."
                                    ></textarea>

                                </div>


                                <!-- Submit -->

                                <div class="form-submit full-width">

                                    <button
                                        type="submit"
                                        class="btn btn-primary enquiry-submit"
                                    >
                                        Send Enquiry
                                        <span>→</span>
                                    </button>

                                    <p class="form-note">
                                        By submitting this form, you agree
                                        to be contacted regarding your enquiry.
                                    </p>

                                </div>


                                <!-- Form status -->

                                <div
                                    id="form-status"
                                    class="form-status full-width"
                                    role="status"
                                    aria-live="polite"
                                ></div>


                            </form>

                        </div>

                    </div>

                </section>

            
                <!-- =====================================
                    GALLERY LIGHTBOX
                    ===================================== -->

                <div
                    class="gallery-lightbox"
                    id="gallery-lightbox"
                    aria-hidden="true"
                >

                    <button
                        class="lightbox-close"
                        id="lightbox-close"
                        type="button"
                        aria-label="Close image viewer"
                    >
                        ×
                    </button>


                    <button
                        class="lightbox-nav lightbox-prev"
                        id="lightbox-prev"
                        type="button"
                        aria-label="Previous image"
                    >
                        ←
                    </button>


                    <div class="lightbox-content">

                        <img
                            src=""
                            alt=""
                            id="lightbox-image"
                        >


                        <div class="lightbox-caption">

                            <span
                                id="lightbox-category"
                            >
                                EVENT
                            </span>


                            <h3
                                id="lightbox-title"
                            >
                                Event Decoration
                            </h3>


                            <div
                                id="lightbox-counter"
                                class="lightbox-counter"
                            >
                                1 / 1
                            </div>

                        </div>

                    </div>


                    <button
                        class="lightbox-nav lightbox-next"
                        id="lightbox-next"
                        type="button"
                        aria-label="Next image"
                    >
                        →
                    </button>

                </div>

            </main>


            
            <!-- =====================================
                PROFESSIONAL FOOTER
                ===================================== -->

            <footer class="site-footer">
                <div class="footer-container">

                    <div class="footer-grid">

                        <div class="footer-brand">
                            <a href="#home" class="footer-brand-logo-link" aria-label="Back to home">
                                <img src="${logo}" alt="SRI CHENNAKESAVA EVENTS Logo" class="footer-logo">
                            </a>
                            <div class="footer-brand-name">SRI CHENNAKESAVA EVENTS</div>
                            <p class="footer-brand-tagline">
                                Creating elegant celebrations with beautiful decorations, thoughtful planning and memorable experiences.
                            </p>
                        </div>

                        <div class="footer-column">
                            <h3>Quick Links</h3>
                            <ul>
                                <li><a href="#home">› Home</a></li>
                                <li><a href="#about">› About Us</a></li>
                                <li><a href="#services">› Services</a></li>
                                <li><a href="#gallery">› Gallery</a></li>
                                <li><a href="#contact">› Contact</a></li>
                            </ul>
                        </div>

                        <div class="footer-column">
                            <h3>Services We Provide</h3>
                            <ul>
                                <li><a href="#services">› Event Planning & Coordination</a></li>
                                <li><a href="#services">› Decoration & Styling</a></li>
                                <li><a href="#services">› Stage & Lighting</a></li>
                                <li><a href="#services">› Birthday & Balloon Décor</a></li>
                                <li><a href="#services">› Traditional Functions</a></li>
                                <li><a href="#services">› Theme & Corporate Events</a></li>
                            </ul>
                        </div>

                        <div class="footer-column">
                            <h3>Contact Us</h3>
                            <ul class="footer-contact-list">
                                <li><a href="#Contact Us">📞 +91 9491759139</a></li>
                                <li><a href="#Contact Us">📞 +91 9121696279</a></li>
                                <li><a href="tel:+919491759139">📞 Contact Us 1</a><li>
                                <li><a href="tel:+919121696279">📞 Contact Us 2</a><li>
                                <li><a href="${BUSINESS.whatsapp}" target="_blank" rel="noopener noreferrer">◉ WhatsApp</a></li>
                                <li><a href="${BUSINESS.instagram}" target="_blank" rel="noopener noreferrer">🅾 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦</a></li>
                                <li><a href="mailto:${BUSINESS.email}" data-email-link>✉ Email</a></li>
                            </ul>
                            <div class="footer-social">
                                <a class="footer-facebook-link" href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook">f</a>
                                <a href="${BUSINESS.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">◎</a>
                                <a class="footer-youtube-link" href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube">▶</a>
                            </div>
                        </div>

                    </div>

                    <div class="footer-bottom">
                        <p>© ${new Date().getFullYear()} SRI CHENNAKESAVA EVENTS. All rights reserved.</p>
                        <p>Creating Moments. Celebrating Memories.</p>
                    </div>

                </div>
            </footer>


            <!-- Floating WhatsApp -->
            <a
                class="floating-whatsapp"
                href="${BUSINESS.whatsapp}"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with SRI CHENNAKESAVA EVENTS on WhatsApp"
            >
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4.1A10.1 10.1 0 0 0 3.5 16.2L2 22l5.9-1.5A10.1 10.1 0 1 0 20 4.1Zm-8 16a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-3.5.9.9-3.4-.2-.4A8.1 8.1 0 1 1 12 20.1Zm4.5-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.1-.3.2-.5.1-1.8-.9-3-1.6-4.2-3.6-.3-.5.3-.5.8-1.4.1-.2.1-.3 0-.5l-.4-1c-.1-.3-.5-1.1-.7-1.2-.2-.1-.4-.1-.6-.1h-.4c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.1s.9 2.4 1 2.5c.1.2 1.8 2.8 4.4 3.9 2.2 1 2.2.7 2.6.7.4 0 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2Z"/></svg>
            </a>

        </div>
    `


    /* =========================================
    BUSINESS LINKS + INFORMATION MODAL
    ========================================= */

    const infoTrigger = document.querySelector('#info-trigger')
    const infoModal = document.querySelector('#event-info-modal')
    const infoClose = document.querySelector('#event-info-close')

    const infoFacebook = document.querySelector('#info-facebook')
    const infoInstagram = document.querySelector('#info-instagram')
    const infoYoutube = document.querySelector('#info-youtube')

    const contactFacebook = document.querySelector('.contact-facebook-link')
    const contactYoutube = document.querySelector('.contact-youtube-link')
    const footerFacebook = document.querySelector('.footer-facebook-link')
    const footerYoutube = document.querySelector('.footer-youtube-link')

    const emailLabel = document.querySelector('#business-email-label')
    const emailLinks = document.querySelectorAll('[data-email-link]')

    function isConfigured(value) {
        return Boolean(value) && !value.includes('YOUR_')
    }

    function configureExternalLink(element, value, label) {
        if (!element) return

        if (isConfigured(value)) {
            element.href = value
            element.removeAttribute('aria-disabled')
        } else {
            element.href = '#'
            element.setAttribute('aria-disabled', 'true')
            element.addEventListener('click', (event) => {
                event.preventDefault()
                window.alert(`Please add the ${label} link in BUSINESS at the top of src/main.js.`)
            })
        }
    }

    configureExternalLink(infoFacebook, BUSINESS.facebook, 'Facebook')
    configureExternalLink(infoYoutube, BUSINESS.youtube, 'YouTube')
    configureExternalLink(contactFacebook, BUSINESS.facebook, 'Facebook')
    configureExternalLink(contactYoutube, BUSINESS.youtube, 'YouTube')
    configureExternalLink(footerFacebook, BUSINESS.facebook, 'Facebook')
    configureExternalLink(footerYoutube, BUSINESS.youtube, 'YouTube')

    if (isConfigured(BUSINESS.email)) {
        const emailHref = `mailto:${BUSINESS.email}`
        emailLinks.forEach((link) => link.href = emailHref)
        if (emailLabel) emailLabel.textContent = BUSINESS.email
    } else {
        emailLinks.forEach((link) => {
            link.href = '#'
            link.addEventListener('click', (event) => {
                event.preventDefault()
                window.alert('Please add the business email in BUSINESS at the top of src/main.js.')
            })
        })
    }

    function openEventInfo() {
        if (!infoModal) return

        infoModal.classList.add('open')
        infoModal.setAttribute('aria-hidden', 'false')
        infoTrigger?.setAttribute('aria-expanded', 'true')
        document.body.classList.add('modal-open')

        gsap.fromTo('.event-info-panel',
            { opacity: 0, y: 25, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out' }
        )
    }

    function closeEventInfo() {
        if (!infoModal) return

        infoModal.classList.remove('open')
        infoModal.setAttribute('aria-hidden', 'true')
        infoTrigger?.setAttribute('aria-expanded', 'false')
        document.body.classList.remove('modal-open')
    }

    infoTrigger?.addEventListener('click', openEventInfo)
    infoClose?.addEventListener('click', closeEventInfo)
    infoModal?.addEventListener('click', (event) => {
        if (event.target === infoModal) closeEventInfo()
    })

    /* =========================================
    NAVIGATION ACTIVE STATE
    ========================================= */

    const navigationSections = document.querySelectorAll('main section[id]')
    const navigationLinks = document.querySelectorAll('.nav-link')

    if ('IntersectionObserver' in window) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return

                navigationLinks.forEach((link) => {
                    link.classList.toggle(
                        'active',
                        link.getAttribute('href') === `#${entry.target.id}`
                    )
                })
            })
        }, {
            rootMargin: '-35% 0px -55% 0px',
            threshold: 0
        })

        navigationSections.forEach((section) => navObserver.observe(section))
    }

    /* Close information modal with Escape */
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && infoModal?.classList.contains('open')) {
            closeEventInfo()
        }
    })

    /* Prevent page scrolling while information modal is open */

    /* =========================================
    MOBILE NAVIGATION
    ========================================= */

    const menuToggle = document.querySelector('#menu-toggle')
    const navLinks = document.querySelector('.nav-links')


    menuToggle.addEventListener('click', () => {

        const isOpen = navLinks.classList.toggle('open')

        menuToggle.classList.toggle('open')

        menuToggle.setAttribute(
            'aria-expanded',
            isOpen
        )

    })


    /* Close mobile menu after clicking a link */

    document.querySelectorAll('.nav-link').forEach((link) => {

        link.addEventListener('click', () => {

            navLinks.classList.remove('open')
            menuToggle.classList.remove('open')

            menuToggle.setAttribute(
                'aria-expanded',
                'false'
            )

        })

    })

    /* =========================================
    GSAP HERO ANIMATION
    ========================================= */

    const heroTimeline = gsap.timeline({
        defaults: {
            ease: 'power3.out'
        }
    })


    heroTimeline
        .from('.hero-eyebrow', {
            opacity: 0,
            y: 25,
            duration: 0.8
        })
        .from('.hero-title', {
            opacity: 0,
            y: 45,
            duration: 1
        }, '-=0.45')
        .from('.hero-description', {
            opacity: 0,
            y: 25,
            duration: 0.8
        }, '-=0.55')
        .from('.hero-actions .btn', {
            opacity: 0,
            y: 20,
            stagger: 0.12,
            duration: 0.6
        }, '-=0.45')
        .from('.hero-image-frame', {
            opacity: 0,
            scale: 0.92,
            x: 45,
            duration: 1.1,
            ease: 'power3.out'
        }, '-=0.9')
        .from('.hero-decoration', {
            opacity: 0,
            scale: 0,
            stagger: 0.15,
            duration: 0.6
        }, '-=0.7')

    /* =========================================
    HERO IMAGE FLOATING MOTION
    ========================================= */

    gsap.to('.hero-image-frame', {
        y: -8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
    })

    /* =========================================
    ABOUT SECTION ANIMATION
    ========================================= */

    const aboutTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '.about-section',
            start: 'top 75%',
            toggleActions: 'play none none none'
        }
    })


    aboutTimeline
        .from('.about-collage-card', {
            opacity: 0,
            x: -60,
            duration: 1,
            ease: 'power3.out'
        })
        .from('.about-collage-badge', {
            opacity: 0,
            scale: 0.8,
            rotate: -5,
            duration: 0.7,
            ease: 'back.out(1.5)'
        }, '-=0.5')
        .from('.about-content > *', {
            opacity: 0,
            y: 25,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power3.out'
        }, '-=0.5')

    /* =========================================
    SERVICES SECTION ANIMATION
    ========================================= */

    const servicesTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '.services-section',
            start: 'top 70%',
            toggleActions: 'play none none none'
        }
    })


    servicesTimeline
        .from('.services-eyebrow', {
            opacity: 0,
            y: 20,
            duration: 0.6
        })
        .from('.services-title', {
            opacity: 0,
            y: 30,
            duration: 0.8
        }, '-=0.35')
        .from('.services-introduction', {
            opacity: 0,
            y: 20,
            duration: 0.6
        }, '-=0.5')
        .from('.service-card', {
            opacity: 0,
            y: 45,
            rotateX: 8,
            stagger: 0.08,
            duration: 0.7,
            ease: 'power3.out'
        }, '-=0.3')
        .from('.services-cta', {
            opacity: 0,
            y: 20,
            duration: 0.6
        }, '-=0.25')

    /* =========================================
    EXPERIENCE + STATS ANIMATION
    ========================================= */

    const experienceTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '.experience-section',
            start: 'top 78%',
            toggleActions: 'play none none none'
        }
    })

    experienceTimeline
        .from('.experience-heading > *', {
            opacity: 0,
            y: 25,
            stagger: 0.12,
            duration: 0.6,
            ease: 'power3.out'
        })
        .from('.experience-card', {
            opacity: 0,
            y: 35,
            rotateX: 8,
            stagger: 0.08,
            duration: 0.65,
            ease: 'power3.out'
        }, '-=0.25')

    const statsTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '.stats-section',
            start: 'top 82%',
            toggleActions: 'play none none none'
        }
    })


    // ==========================================
    // STAT CARD REVEAL
    // ==========================================

    statsTimeline.from('.stat-card', {
        opacity: 0,
        y: 25,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power3.out'
    })


    // ==========================================
    // STAT ELEMENTS
    // ==========================================

    const statEvents =
        document.querySelector('#stat-events')

    const statVendors =
        document.querySelector('#stat-vendors')

    const statClient =
        document.querySelector('#stat-client')

    const statSupport =
        document.querySelector('#stat-support')

    // ==========================================
    // RESET ANIMATED STAT VALUES
    // ==========================================

    if (statEvents) {

        statEvents.textContent = '0+'

    }


    if (statVendors) {

        statVendors.textContent = '0+'

    }
    
    
    // ==========================================
    // 25+ COUNT-UP
    // ==========================================

    if (statEvents) {

        const eventsCounter = {
            value: 0
        }

        statsTimeline.to(
            eventsCounter,
            {
                value: 25,
                duration: 0.9,
                ease: 'power2.out',

                onUpdate: () => {

                    statEvents.textContent =
                        `${Math.floor(
                            eventsCounter.value
                        )}+`

                },

                onComplete: () => {

                    statEvents.textContent =
                        '25+'

                }
            },
            '-=0.35'
        )

    }


    // ==========================================
    // 15+ COUNT-UP
    // ==========================================

    if (statVendors) {

        const vendorsCounter = {
            value: 0
        }

        statsTimeline.to(
            vendorsCounter,
            {
                value: 15,
                duration: 0.7,
                ease: 'power2.out',

                onUpdate: () => {

                    statVendors.textContent =
                        `${Math.floor(
                            vendorsCounter.value
                        )}+`

                },

                onComplete: () => {

                    statVendors.textContent =
                        '15+'

                }
            },
            '-=1.25'
        )

    }


    // ==========================================
    // 100% REVEAL
    // ==========================================

    if (statClient) {

        statsTimeline.fromTo(
            statClient,
            {
                opacity: 0,
                scale: 0.65,
                y: 18
            },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.8,
                ease: 'back.out(1.6)'
            },
            '-=0.8'
        )

    }


    // ==========================================
    // 24/7 REVEAL
    // ==========================================

    if (statSupport) {

        statsTimeline.fromTo(
            statSupport,
            {
                opacity: 0,
                scale: 0.65,
                y: 18
            },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.8,
                ease: 'back.out(1.6)'
            },
            '-=0.55'
        )

    }

    /* =========================================
    GALLERY FILTERING
    ========================================= */

    const galleryFilters =
        document.querySelectorAll('.gallery-filter')

    const galleryItems =
        document.querySelectorAll('.gallery-item')


    galleryFilters.forEach((filterButton) => {

        filterButton.addEventListener('click', () => {

            const selectedFilter =
                filterButton.dataset.filter


            /* Update active button */

            galleryFilters.forEach((button) => {
                button.classList.remove('active')
            })

            filterButton.classList.add('active')


            /* Filter gallery items */

            galleryItems.forEach((item) => {

                const itemCategory =
                    item.dataset.category


                const shouldShow =
                    selectedFilter === 'all' ||
                    itemCategory === selectedFilter


                if (shouldShow) {

                    item.style.display = 'block'

                    gsap.fromTo(
                        item,
                        {
                            opacity: 0,
                            scale: 0.94
                        },
                        {
                            opacity: 1,
                            scale: 1,
                            duration: 0.45,
                            ease: 'power2.out'
                        }
                    )

                } else {

                    item.style.display = 'none'

                }

            })

        })

    })

    /* =========================================
    GALLERY ENTRANCE ANIMATION
    ========================================= */

    const galleryTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '.gallery-section',
            start: 'top 72%',
            toggleActions: 'play none none none'
        }
    })


    galleryTimeline
        .from('.gallery-header > *', {
            opacity: 0,
            y: 25,
            stagger: 0.12,
            duration: 0.6,
            ease: 'power3.out'
        })
        .from('.gallery-filters', {
            opacity: 0,
            y: 15,
            duration: 0.5
        }, '-=0.25')
        .from('.gallery-item', {
            opacity: 0,
            y: 35,
            scale: 0.96,
            stagger: 0.07,
            duration: 0.65,
            ease: 'power3.out'
        }, '-=0.2')
        .from('.gallery-cta', {
            opacity: 0,
            y: 20,
            duration: 0.5
        }, '-=0.25')

    /* =========================================
    GALLERY LIGHTBOX
    ========================================= */

    const galleryLightbox =
        document.querySelector(
            '#gallery-lightbox'
        );


    const lightboxImage =
        document.querySelector(
            '#lightbox-image'
        );


    const lightboxCategory =
        document.querySelector(
            '#lightbox-category'
        );


    const lightboxTitle =
        document.querySelector(
            '#lightbox-title'
        );


    const lightboxCounter =
        document.querySelector(
            '#lightbox-counter'
        );


    const lightboxClose =
        document.querySelector(
            '#lightbox-close'
        );


    const lightboxPrev =
        document.querySelector(
            '#lightbox-prev'
        );


    const lightboxNext =
        document.querySelector(
            '#lightbox-next'
        );


    let activeGalleryId = null;

    let activeGalleryImages = [];

    let activeGalleryIndex = 0;


    // ==========================================
    // OPEN GALLERY
    // ==========================================

    function openGalleryImage(
        galleryId,
        imageIndex = 0
    ) {

        const service =
            GALLERY_CONFIG.find(
                item =>
                    item.id === galleryId
            );


        const images =
            galleryCollections[
                galleryId
            ] || [];


        if (
            !service ||
            !images.length
        ) {

            return;

        }


        activeGalleryId =
            galleryId;


        activeGalleryImages =
            images;


        activeGalleryIndex =
            Math.max(
                0,
                Math.min(
                    imageIndex,
                    images.length - 1
                )
            );


        updateGalleryLightbox();


        galleryLightbox.classList.add(
            'open'
        );


        galleryLightbox.setAttribute(
            'aria-hidden',
            'false'
        );


        document.body.style.overflow =
            'hidden';


        gsap.fromTo(
            '.lightbox-content',
            {
                opacity: 0,
                scale: 0.92
            },
            {
                opacity: 1,
                scale: 1,
                duration: 0.45,
                ease: 'power3.out'
            }
        );

    }


    // ==========================================
    // UPDATE LIGHTBOX
    // ==========================================

    function updateGalleryLightbox() {

        const service =
            GALLERY_CONFIG.find(
                item =>
                    item.id === activeGalleryId
            );


        if (
            !service ||
            !activeGalleryImages.length
        ) {

            return;

        }


        lightboxImage.src =
            activeGalleryImages[
                activeGalleryIndex
            ];


        lightboxImage.alt =
            service.label;


        lightboxCategory.textContent =
            service.label;


        lightboxTitle.textContent =
            service.title;


        lightboxCounter.textContent =
            `${activeGalleryIndex + 1} / ${activeGalleryImages.length}`;


        const hasMultipleImages =
            activeGalleryImages.length > 1;


        lightboxPrev.style.display =
            hasMultipleImages
                ? 'flex'
                : 'none';


        lightboxNext.style.display =
            hasMultipleImages
                ? 'flex'
                : 'none';

    }


    // ==========================================
    // NEXT IMAGE
    // ==========================================

    function showNextGalleryImage() {

        if (
            activeGalleryImages.length <= 1
        ) {

            return;

        }


        activeGalleryIndex =
            (
                activeGalleryIndex + 1
            )
            %
            activeGalleryImages.length;


        animateGalleryImageChange();

    }


    // ==========================================
    // PREVIOUS IMAGE
    // ==========================================

    function showPreviousGalleryImage() {

        if (
            activeGalleryImages.length <= 1
        ) {

            return;

        }


        activeGalleryIndex =
            (
                activeGalleryIndex -
                1 +
                activeGalleryImages.length
            )
            %
            activeGalleryImages.length;


        animateGalleryImageChange();

    }


    // ==========================================
    // IMAGE CHANGE ANIMATION
    // ==========================================

    function animateGalleryImageChange() {

        gsap.to(
            '.lightbox-content',
            {
                opacity: 0,
                x: 20,
                duration: 0.15,

                onComplete: () => {

                    updateGalleryLightbox();


                    gsap.fromTo(
                        '.lightbox-content',
                        {
                            opacity: 0,
                            x: -20
                        },
                        {
                            opacity: 1,
                            x: 0,
                            duration: 0.22,
                            ease: 'power2.out'
                        }
                    );

                }

            }
        );

    }


    // ==========================================
    // GALLERY VIEW BUTTONS
    // ==========================================

    document.querySelectorAll(
        '.gallery-view'
    ).forEach(
        button => {

            button.addEventListener(
                'click',
                event => {

                    event.stopPropagation();


                    const galleryId =
                        button.dataset.galleryId;


                    openGalleryImage(
                        galleryId
                    );

                }
            );

        }
    );


    // ==========================================
    // PREVIOUS BUTTON
    // ==========================================

    lightboxPrev.addEventListener(
        'click',
        showPreviousGalleryImage
    );


    // ==========================================
    // NEXT BUTTON
    // ==========================================

    lightboxNext.addEventListener(
        'click',
        showNextGalleryImage
    );


    // ==========================================
    // CLOSE LIGHTBOX
    // ==========================================

    function closeGalleryLightbox() {

        galleryLightbox.classList.remove(
            'open'
        );


        galleryLightbox.setAttribute(
            'aria-hidden',
            'true'
        );


        document.body.style.overflow =
            '';


        activeGalleryId =
            null;


        activeGalleryImages =
            [];


        activeGalleryIndex =
            0;

    }


    lightboxClose.addEventListener(
        'click',
        closeGalleryLightbox
    );


    galleryLightbox.addEventListener(
        'click',
        event => {

            if (
                event.target ===
                galleryLightbox
            ) {

                closeGalleryLightbox();

            }

        }
    );


    // ==========================================
    // KEYBOARD CONTROLS
    // ==========================================

    document.addEventListener(
        'keydown',
        event => {

            if (
                !galleryLightbox.classList.contains(
                    'open'
                )
            ) {

                return;

            }


            if (
                event.key === 'Escape'
            ) {

                closeGalleryLightbox();

            }


            if (
                event.key === 'ArrowRight'
            ) {

                showNextGalleryImage();

            }


            if (
                event.key === 'ArrowLeft'
            ) {

                showPreviousGalleryImage();

            }

        }
    );

    /* =========================================
    ENQUIRY FORM - VALIDATION + API
    ========================================= */

    const enquiryForm =
        document.querySelector('#enquiry-form')

    const formStatus =
        document.querySelector('#form-status')

    const enquirySubmitButton =
        document.querySelector('.enquiry-submit')

    // ==========================================
    // EVENT TYPE MULTI-SELECT
    // ==========================================

    const eventTypeMultiselect =
        document.getElementById(
            'event-type-multiselect'
        )

    const eventTypeSelector =
        document.getElementById(
            'event-type-selector'
        )

    const eventTypeOptions =
        document.getElementById(
            'event-type-options'
        )

    const eventTypeSelectedText =
        document.getElementById(
            'event-type-selected-text'
        )


    if (
        eventTypeMultiselect &&
        eventTypeSelector &&
        eventTypeOptions &&
        eventTypeSelectedText
    ) {

        eventTypeSelector.addEventListener(
            'click',
            () => {

                eventTypeMultiselect.classList.toggle(
                    'open'
                )

            }
        )


        const eventTypeCheckboxes =
            eventTypeOptions.querySelectorAll(
                'input[type="checkbox"]'
            )


        eventTypeCheckboxes.forEach(
            checkbox => {

                checkbox.addEventListener(
                    'change',
                    () => {

                        const selected =
                            Array.from(
                                eventTypeCheckboxes
                            )
                                .filter(
                                    item =>
                                        item.checked
                                )
                                .map(
                                    item =>
                                        item.value
                                )


                        if (
                            selected.length === 0
                        ) {

                            eventTypeSelectedText.textContent =
                                'Select one or more services'

                        } else {

                            eventTypeSelectedText.textContent =
                                selected.join(', ')

                        }

                    }
                )

            }
        )


        document.addEventListener(
            'click',
            event => {

                if (
                    !eventTypeMultiselect.contains(
                        event.target
                    )
                ) {

                    eventTypeMultiselect.classList.remove(
                        'open'
                    )

                }

            }
        )

    }

    enquiryForm.addEventListener(
        'submit',
        async (event) => {

            event.preventDefault()


            /* -----------------------------------------
            RESET STATUS
            ----------------------------------------- */

            formStatus.textContent = ''

            formStatus.className =
                'form-status full-width'


            /* -----------------------------------------
            COLLECT FORM DATA
            ----------------------------------------- */

            const formData =
                new FormData(enquiryForm)


            const customerName =
                (formData.get('customerName') || '')
                    .trim()


            const customerPhone =
                (formData.get('customerPhone') || '')
                    .trim()


            const customerEmail =
                (formData.get('customerEmail') || '')
                    .trim()


            const eventType =
                formData
                    .getAll('eventType')
                    .filter(value => value !== '')
                    .join(', ')


            const eventDate =
                formData.get('eventDate') || ''


            const guestCount =
                formData.get('guestCount') || ''


            const budget =
                formData.get('budget') || ''


            const eventLocation =
                (formData.get('eventLocation') || '')
                    .trim()


            const message =
                (formData.get('message') || '')
                    .trim()


            /* -----------------------------------------
            NAME VALIDATION
            ----------------------------------------- */

            if (customerName.length < 2) {

                formStatus.textContent =
                    'Please enter your name.'

                formStatus.classList.add(
                    'error'
                )

                return
            }


            /* -----------------------------------------
            PHONE VALIDATION
            ----------------------------------------- */

            const phoneDigits =
                customerPhone.replace(
                    /\D/g,
                    ''
                )


            if (
                phoneDigits.length < 10 ||
                phoneDigits.length > 15
            ) {

                formStatus.textContent =
                    'Please enter a valid phone number.'

                formStatus.classList.add(
                    'error'
                )

                return
            }


            /* -----------------------------------------
            EVENT TYPE VALIDATION
            ----------------------------------------- */

            if (!eventType) {

                formStatus.textContent =
                    'Please select your event type.'

                formStatus.classList.add(
                    'error'
                )

                return
            }


            /* -----------------------------------------
            EVENT DATE VALIDATION
            ----------------------------------------- */

            if (!eventDate) {

                formStatus.textContent =
                    'Please select your event date.'

                formStatus.classList.add(
                    'error'
                )

                return
            }


            /* -----------------------------------------
            DISABLE SUBMIT BUTTON
            ----------------------------------------- */

            enquirySubmitButton.disabled = true

            enquirySubmitButton.dataset.originalText =
                enquirySubmitButton.innerHTML

            enquirySubmitButton.innerHTML =
                'Sending Enquiry...'


            formStatus.textContent =
                'Submitting your enquiry...'

            formStatus.className =
                'form-status full-width'


            /* -----------------------------------------
            PREPARE API DATA
            ----------------------------------------- */

            const enquiryData = {

                full_name:
                    customerName,

                phone:
                    phoneDigits,

                email:
                    customerEmail || null,

                event_type:
                    eventType,

                event_date:
                    eventDate,

                guest_count:
                    guestCount || null,

                budget:
                    budget || null,

                event_location:
                    eventLocation || null,

                message:
                    message || null

            }


            /* -----------------------------------------
            SEND DATA TO BACKEND
            ----------------------------------------- */

            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/enquiries`,
                        {
                            method: 'POST',

                            headers: {
                                'Content-Type':
                                    'application/json'
                            },

                            body:
                                JSON.stringify(
                                    enquiryData
                                )
                        }
                    )


                /* -------------------------------------
                READ SERVER RESPONSE
                ------------------------------------- */

                const result =
                    await response.json()


                /* -------------------------------------
                HANDLE SERVER ERROR
                ------------------------------------- */

                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        'Unable to submit enquiry.'
                    )
                }


                /* -------------------------------------
                SUCCESS POPUP
                ------------------------------------- */

                showEnquirySuccessPopup(
                    result.enquiry_id
                )


                /* -------------------------------------
                RESET FORM
                ------------------------------------- */

                enquiryForm.reset()


            } catch (error) {

                console.error(
                    'Enquiry submission error:',
                    error
                )


                /* -------------------------------------
                NETWORK / SERVER ERROR
                ------------------------------------- */

                formStatus.textContent =
                    error.message ||
                    'Unable to submit your enquiry. Please try again.'

                formStatus.className =
                    'form-status full-width error'


            } finally {

                /* -------------------------------------
                ENABLE BUTTON AGAIN
                ------------------------------------- */

                enquirySubmitButton.disabled =
                    false

                enquirySubmitButton.innerHTML =
                    enquirySubmitButton.dataset.originalText ||
                    'Send Enquiry →'

            }

        }
    )
}

// ==========================================
// ENQUIRY SUCCESS POPUP
// ==========================================

function showEnquirySuccessPopup(
    enquiryId
) {

    const existingPopup =
        document.getElementById(
            'enquiry-success-popup'
        )


    if (existingPopup) {

        existingPopup.remove()

    }


    const popup =
        document.createElement(
            'div'
        )


    popup.id =
        'enquiry-success-popup'


    popup.className =
        'enquiry-success-popup'


    popup.innerHTML = `

        <div
            class="enquiry-success-backdrop"
        ></div>


        <div
            class="enquiry-success-modal"
            role="alertdialog"
            aria-modal="true"
        >

            <div
                class="enquiry-success-icon"
            >
                ✓
            </div>


            <h3>
                Enquiry Received
            </h3>


            <p>
                Thank you for contacting
                SRI CHENNAKESAVA EVENTS.
            </p>


            <p>
                Your enquiry has been received
                successfully. Our team will
                contact you very soon.
            </p>


            <div
                class="enquiry-success-id"
            >
                Enquiry ID:
                <strong>
                    #${enquiryId}
                </strong>
            </div>


            <button
                type="button"
                class="enquiry-success-close"
                id="enquiry-success-close"
            >
                OK
            </button>

        </div>

    `


    document.body.appendChild(
        popup
    )


    requestAnimationFrame(() => {

        popup.classList.add(
            'show'
        )

    })


    const closePopup =
        () => {

            popup.classList.remove(
                'show'
            )


            setTimeout(() => {

                popup.remove()

            }, 250)

        }


    document
        .getElementById(
            'enquiry-success-close'
        )
        ?.addEventListener(
            'click',
            closePopup
        )


    popup
        .querySelector(
            '.enquiry-success-backdrop'
        )
        ?.addEventListener(
            'click',
            closePopup
        )


    setTimeout(
        closePopup,
        5000
    )

}