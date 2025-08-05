/**
 * Enhanced Image Loading and Management System
 * For Radius Works Website Visual Enhancements
 */

class ImageEnhancementManager {
    constructor() {
        this.imageMetadata = null;
        this.lazyImages = [];
        this.observer = null;
        this.loadedImages = new Set();
        
        this.init();
    }

    /**
     * Initialize the image enhancement system
     */
    async init() {
        console.log('🖼️ Initializing Image Enhancement Manager...');
        
        try {
            await this.loadImageMetadata();
            this.setupLazyLoading();
            this.setupImageErrorHandling();
            this.setupWebPSupport();
            this.setupImagePreloading();
            this.enhanceExistingImages();
            this.monitorImagePerformance();
            
            console.log('✅ Image Enhancement Manager initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Image Enhancement Manager:', error);
        }
    }

    /**
     * Load image metadata from JSON file
     */
    async loadImageMetadata() {
        try {
            const response = await fetch('scripts/image-metadata.json');
            this.imageMetadata = await response.json();
            console.log('📊 Image metadata loaded successfully');
        } catch (error) {
            console.warn('⚠️ Could not load image metadata, using fallback system');
            this.imageMetadata = this.createFallbackMetadata();
        }
    }

    /**
     * Create fallback metadata if JSON file is not available
     */
    createFallbackMetadata() {
        return {
            hero: {},
            services: {},
            about: {},
            reviews: {},
            seo: {
                openGraph: {
                    defaultImage: 'images/stock/hero/hero-main-plumber.png'
                }
            }
        };
    }

    /**
     * Setup lazy loading for images
     */
    setupLazyLoading() {
        // Check for Intersection Observer support
        if (!('IntersectionObserver' in window)) {
            console.warn('⚠️ IntersectionObserver not supported, loading all images immediately');
            this.loadAllImages();
            return;
        }

        // Create intersection observer
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        // Find all lazy images
        this.lazyImages = document.querySelectorAll('img[loading="lazy"], .lazy-image');
        
        // Observe lazy images
        this.lazyImages.forEach(img => {
            img.classList.add('loading');
            this.observer.observe(img);
        });

        console.log(`🔍 Observing ${this.lazyImages.length} lazy images`);
    }

    /**
     * Load a specific image
     */
    loadImage(img) {
        return new Promise((resolve, reject) => {
            const imageUrl = img.dataset.src || img.src;
            
            if (this.loadedImages.has(imageUrl)) {
                resolve(img);
                return;
            }

            img.classList.add('loading');
            
            const tempImg = new Image();
            
            tempImg.onload = () => {
                img.src = imageUrl;
                img.classList.remove('loading');
                img.classList.add('loaded');
                this.loadedImages.add(imageUrl);
                resolve(img);
            };
            
            tempImg.onerror = () => {
                this.handleImageError(img);
                reject(new Error(`Failed to load image: ${imageUrl}`));
            };
            
            tempImg.src = imageUrl;
        });
    }

    /**
     * Setup enhanced error handling for images
     */
    setupImageErrorHandling() {
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                this.handleImageError(e.target);
            }
        }, true);
    }

    /**
     * Enhanced image error handling with three-tier fallback system
     */
    handleEnhancedImageError(img) {
        const originalSrc = img.src;
        const fallbackLevel = parseInt(img.dataset.fallbackLevel || '0');
        
        console.warn(`⚠️ Image failed to load (Level ${fallbackLevel}): ${originalSrc}`);
        
        switch (fallbackLevel) {
            case 0:
                // First tier failed: Try secondary fallback (original image)
                this.attemptSecondaryFallback(img);
                break;
            case 1:
                // Second tier failed: Try tertiary fallback (CSS placeholder)
                this.attemptTertiaryFallback(img);
                break;
            case 2:
            default:
                // All tiers failed: Final graceful degradation
                this.handleFinalFallback(img);
                break;
        }
        
        // Track fallback statistics
        this.trackFallbackUsage(img.dataset.category, img.dataset.imageName, fallbackLevel);
    }

    /**
     * Attempt secondary fallback (original image)
     */
    attemptSecondaryFallback(img) {
        const fallbackSrc = img.dataset.fallbackSrc;
        if (fallbackSrc && fallbackSrc !== img.src) {
            img.dataset.fallbackLevel = '1';
            img.src = fallbackSrc;
            img.classList.add('fallback-secondary');
            console.log(`🔄 Attempting secondary fallback: ${fallbackSrc}`);
        } else {
            // Skip to tertiary if no secondary available
            this.attemptTertiaryFallback(img);
        }
    }

    /**
     * Attempt tertiary fallback (CSS placeholder)
     */
    attemptTertiaryFallback(img) {
        img.dataset.fallbackLevel = '2';
        img.style.display = 'none';
        img.classList.add('fallback-tertiary');
        
        const container = img.closest('.image-container, .service-card, .hero-image, .about-image, .enhanced-picture');
        if (container) {
            container.classList.add('image-placeholder');
            this.createPlaceholderContent(container, img.dataset.category);
        }
        
        console.log(`🎨 Using CSS placeholder for ${img.dataset.category}/${img.dataset.imageName}`);
    }

    /**
     * Handle final fallback when all options are exhausted
     */
    handleFinalFallback(img) {
        img.dataset.fallbackLevel = '3';
        img.style.display = 'none';
        img.classList.add('fallback-final');
        
        const container = img.closest('.image-container, .service-card, .hero-image, .about-image, .enhanced-picture');
        if (container) {
            container.classList.add('image-failed');
            this.createErrorPlaceholder(container, img.dataset.category);
        }
        
        console.error(`❌ All fallback options exhausted for ${img.dataset.category}/${img.dataset.imageName}`);
    }

    /**
     * Legacy error handler for backward compatibility
     */
    handleImageError(img) {
        // Redirect to enhanced error handler
        this.handleEnhancedImageError(img);
    }

    /**
     * Check WebP support and setup appropriate sources
     */
    setupWebPSupport() {
        // Check WebP support
        const webpSupported = this.checkWebPSupport();
        
        if (!webpSupported) {
            console.log('ℹ️ WebP not supported, using JPEG fallbacks');
            // Remove WebP sources from picture elements
            document.querySelectorAll('source[type="image/webp"]').forEach(source => {
                source.remove();
            });
        } else {
            console.log('✅ WebP supported, using optimized images');
        }
    }

    /**
     * Check if browser supports WebP
     */
    checkWebPSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    /**
     * Preload critical images
     */
    setupImagePreloading() {
        // Preload hero images and other critical images
        const criticalImages = [
            'images/stock/hero/hero-main-plumber.png',
            'images/optimized/hero/hero-main-plumber.webp'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });

        console.log(`⚡ Preloading ${criticalImages.length} critical images`);
    }

    /**
     * Load all images immediately (fallback for no IntersectionObserver)
     */
    loadAllImages() {
        const allImages = document.querySelectorAll('img[loading="lazy"], .lazy-image');
        allImages.forEach(img => this.loadImage(img));
    }

    /**
     * Get optimized image source based on metadata
     */
    getOptimizedImageSrc(category, imageName, format = 'webp') {
        if (!this.imageMetadata || !this.imageMetadata[category]) {
            return null;
        }

        const imageData = this.imageMetadata[category][imageName];
        if (!imageData) {
            return null;
        }

        return format === 'webp' ? imageData.webp : imageData.optimized;
    }

    /**
     * Get SEO-optimized alt text
     */
    getOptimizedAltText(category, imageName) {
        if (!this.imageMetadata || !this.imageMetadata[category]) {
            return '';
        }

        const imageData = this.imageMetadata[category][imageName];
        return imageData ? imageData.alt : '';
    }

    /**
     * Create enhanced picture element with three-tier fallback system
     */
    createPictureElement(category, imageName, className = '', options = {}) {
        const imageData = this.imageMetadata?.[category]?.[imageName];
        if (!imageData) {
            console.warn(`⚠️ No metadata found for ${category}/${imageName}`);
            return this.createFallbackPictureElement(category, imageName, className, options);
        }

        const picture = document.createElement('picture');
        picture.className = `enhanced-picture ${className}`;
        picture.dataset.category = category;
        picture.dataset.imageName = imageName;

        // WebP source (modern format)
        if (imageData.webp && this.checkWebPSupport()) {
            const webpSource = document.createElement('source');
            webpSource.srcset = imageData.webp;
            webpSource.type = 'image/webp';
            webpSource.dataset.format = 'webp';
            picture.appendChild(webpSource);
        }

        // JPEG/PNG source (standard format)
        if (imageData.optimized) {
            const standardSource = document.createElement('source');
            standardSource.srcset = imageData.optimized;
            standardSource.type = this.getImageMimeType(imageData.optimized);
            standardSource.dataset.format = 'standard';
            picture.appendChild(standardSource);
        }

        // Fallback img element with three-tier fallback
        const img = document.createElement('img');
        img.src = imageData.src; // Primary: Stock image
        img.alt = imageData.alt || this.generateAltText(category, imageName);
        img.loading = imageData.priority === 'high' || options.eager ? 'eager' : 'lazy';
        img.className = 'enhanced-image';
        img.dataset.fallbackSrc = this.getFallbackImage(category); // Secondary: Original fallback
        img.dataset.category = category;
        img.dataset.imageName = imageName;
        
        // Enhanced error handling with three-tier system
        img.addEventListener('error', (e) => this.handleEnhancedImageError(e.target));
        img.addEventListener('load', (e) => this.handleImageLoad(e.target));
        
        picture.appendChild(img);
        
        return picture;
    }

    /**
     * Create fallback picture element when metadata is missing
     */
    createFallbackPictureElement(category, imageName, className = '', options = {}) {
        const picture = document.createElement('picture');
        picture.className = `enhanced-picture fallback-picture ${className}`;
        picture.dataset.category = category;
        picture.dataset.imageName = imageName;

        const img = document.createElement('img');
        img.src = this.getFallbackImage(category);
        img.alt = this.generateAltText(category, imageName);
        img.loading = options.eager ? 'eager' : 'lazy';
        img.className = 'enhanced-image fallback-image';
        img.dataset.fallbackSrc = this.getFallbackImage(category);
        img.dataset.category = category;
        img.dataset.imageName = imageName;
        
        img.addEventListener('error', (e) => this.handleEnhancedImageError(e.target));
        img.addEventListener('load', (e) => this.handleImageLoad(e.target));
        
        picture.appendChild(img);
        
        return picture;
    }

    /**
     * Get fallback image for category
     */
    getFallbackImage(category) {
        const fallbacks = {
            hero: 'images/hero-bg.jpg',
            services: 'images/residential-service.jpg',
            about: 'images/radius-logo2.png',
            reviews: 'images/hero-bg.jpg'
        };
        
        return fallbacks[category] || 'images/hero-bg.jpg';
    }

    /**
     * Get MIME type for image file
     */
    getImageMimeType(src) {
        const extension = src.split('.').pop().toLowerCase();
        const mimeTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp',
            'gif': 'image/gif',
            'svg': 'image/svg+xml'
        };
        return mimeTypes[extension] || 'image/jpeg';
    }

    /**
     * Generate alt text when metadata is missing
     */
    generateAltText(category, imageName) {
        const altTemplates = {
            hero: `Professional plumbing services Milwaukee - ${imageName.replace(/-/g, ' ')}`,
            services: `${imageName.replace(/-/g, ' ')} - Radius Works Milwaukee plumbing services`,
            about: `Radius Works team - ${imageName.replace(/-/g, ' ')}`,
            reviews: `Customer satisfaction - ${imageName.replace(/-/g, ' ')}`
        };
        
        return altTemplates[category] || `Radius Works - ${imageName.replace(/-/g, ' ')}`;
    }

    /**
     * Handle successful image load
     */
    handleImageLoad(img) {
        img.classList.add('loaded');
        img.classList.remove('loading');
        
        const fallbackLevel = parseInt(img.dataset.fallbackLevel || '0');
        if (fallbackLevel > 0) {
            console.log(`✅ Fallback image loaded successfully (Level ${fallbackLevel}): ${img.src}`);
        }
        
        // Remove any placeholder classes from container
        const container = img.closest('.image-container, .service-card, .hero-image, .about-image, .enhanced-picture');
        if (container) {
            container.classList.remove('image-placeholder', 'image-failed');
        }
    }

    /**
     * Create placeholder content for failed images
     */
    createPlaceholderContent(container, category) {
        if (container.querySelector('.placeholder-content')) {
            return; // Already has placeholder
        }

        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder-content';
        
        const icon = this.getPlaceholderIcon(category);
        const text = this.getPlaceholderText(category);
        
        placeholder.innerHTML = `
            <div class="placeholder-icon">${icon}</div>
            <div class="placeholder-text">${text}</div>
        `;
        
        container.appendChild(placeholder);
    }

    /**
     * Create error placeholder for completely failed images
     */
    createErrorPlaceholder(container, category) {
        if (container.querySelector('.error-placeholder')) {
            return; // Already has error placeholder
        }

        const errorPlaceholder = document.createElement('div');
        errorPlaceholder.className = 'error-placeholder';
        errorPlaceholder.innerHTML = `
            <div class="error-icon">⚠️</div>
            <div class="error-text">Image unavailable</div>
        `;
        
        container.appendChild(errorPlaceholder);
    }

    /**
     * Get placeholder icon for category
     */
    getPlaceholderIcon(category) {
        const icons = {
            hero: '🏠',
            services: '🔧',
            about: '👥',
            reviews: '⭐'
        };
        return icons[category] || '🖼️';
    }

    /**
     * Get placeholder text for category
     */
    getPlaceholderText(category) {
        const texts = {
            hero: 'Professional Plumbing Services',
            services: 'Service Image',
            about: 'Our Team',
            reviews: 'Customer Review'
        };
        return texts[category] || 'Image';
    }

    /**
     * Track fallback usage for analytics
     */
    trackFallbackUsage(category, imageName, fallbackLevel) {
        if (!this.fallbackStats) {
            this.fallbackStats = {};
        }
        
        const key = `${category}/${imageName}`;
        if (!this.fallbackStats[key]) {
            this.fallbackStats[key] = { levels: [], count: 0 };
        }
        
        this.fallbackStats[key].levels.push(fallbackLevel);
        this.fallbackStats[key].count++;
        
        // Log to console for debugging
        console.log(`📊 Fallback stats for ${key}:`, this.fallbackStats[key]);
    }

    /**
     * Update Open Graph image dynamically
     */
    updateOpenGraphImage(imageSrc) {
        let ogImage = document.querySelector('meta[property="og:image"]');
        if (!ogImage) {
            ogImage = document.createElement('meta');
            ogImage.setAttribute('property', 'og:image');
            document.head.appendChild(ogImage);
        }
        ogImage.setAttribute('content', imageSrc);
    }

    /**
     * Add structured data for images
     */
    addImageStructuredData() {
        if (!this.imageMetadata?.seo?.structuredData?.businessImages) {
            return;
        }

        const images = this.imageMetadata.seo.structuredData.businessImages.map(src => ({
            "@type": "ImageObject",
            "url": `https://www.radiusworks.net/${src}`,
            "caption": "Professional plumbing services in Milwaukee"
        }));

        // Find existing JSON-LD script or create new one
        let jsonLdScript = document.querySelector('script[type="application/ld+json"]');
        if (jsonLdScript) {
            const structuredData = JSON.parse(jsonLdScript.textContent);
            structuredData.image = images;
            jsonLdScript.textContent = JSON.stringify(structuredData, null, 2);
        }
    }

    /**
     * Replace existing images with enhanced picture elements
     */
    enhanceExistingImages() {
        const imagesToEnhance = document.querySelectorAll('img[data-enhance]');
        
        imagesToEnhance.forEach(img => {
            const category = img.dataset.category;
            const imageName = img.dataset.imageName;
            const className = img.className;
            
            if (category && imageName) {
                const pictureElement = this.createPictureElement(category, imageName, className, {
                    eager: img.loading === 'eager'
                });
                
                if (pictureElement) {
                    img.parentNode.replaceChild(pictureElement, img);
                    console.log(`🔄 Enhanced image: ${category}/${imageName}`);
                }
            }
        });
        
        // Specifically enhance hero images that are already using picture elements
        this.enhanceHeroImages();
    }

    /**
     * Enhance hero images with proper loading and SEO optimization
     */
    enhanceHeroImages() {
        const heroImages = document.querySelectorAll('.hero-img-enhanced');
        
        heroImages.forEach(img => {
            const category = img.dataset.category;
            const imageName = img.dataset.imageName;
            
            if (category === 'hero' && imageName && this.imageMetadata?.hero?.[imageName]) {
                const imageData = this.imageMetadata.hero[imageName];
                
                // Update alt text with SEO-optimized version from metadata
                if (imageData.alt) {
                    img.alt = imageData.alt;
                }
                
                // Add title attribute for additional SEO
                if (imageData.title) {
                    img.title = imageData.title;
                }
                
                // Ensure eager loading for hero images
                img.loading = 'eager';
                
                // Add loading state management
                img.classList.add('loading');
                
                img.addEventListener('load', () => {
                    img.classList.remove('loading');
                    img.classList.add('loaded');
                    console.log(`✅ Hero image loaded: ${imageName}`);
                });
                
                img.addEventListener('error', () => {
                    console.warn(`⚠️ Hero image failed to load: ${imageName}`);
                });
                
                console.log(`🎯 Enhanced hero image: ${imageName} with SEO alt text`);
            }
        });
    }

    /**
     * Create picture element from existing img element
     */
    enhanceImageElement(img, category, imageName) {
        const pictureElement = this.createPictureElement(category, imageName, img.className, {
            eager: img.loading === 'eager'
        });
        
        if (pictureElement && img.parentNode) {
            img.parentNode.replaceChild(pictureElement, img);
            return pictureElement;
        }
        
        return null;
    }

    /**
     * Test fallback system functionality
     */
    testFallbackSystem(category = 'hero', imageName = 'test-image') {
        console.log('🧪 Testing fallback system...');
        
        // Create test picture element with non-existent images
        const testData = {
            src: 'images/non-existent-primary.jpg',
            webp: 'images/non-existent-primary.webp',
            optimized: 'images/non-existent-optimized.jpg',
            alt: 'Test image for fallback system'
        };
        
        // Temporarily add test data to metadata
        if (!this.imageMetadata[category]) {
            this.imageMetadata[category] = {};
        }
        this.imageMetadata[category][imageName] = testData;
        
        // Create test picture element
        const testPicture = this.createPictureElement(category, imageName, 'test-fallback');
        
        // Add to a test container
        let testContainer = document.getElementById('fallback-test-container');
        if (!testContainer) {
            testContainer = document.createElement('div');
            testContainer.id = 'fallback-test-container';
            testContainer.style.cssText = 'position: fixed; top: 10px; right: 10px; width: 200px; height: 100px; border: 2px solid red; z-index: 9999; background: white;';
            document.body.appendChild(testContainer);
        }
        
        testContainer.appendChild(testPicture);
        
        // Clean up test data
        setTimeout(() => {
            delete this.imageMetadata[category][imageName];
            if (testContainer) {
                testContainer.remove();
            }
            console.log('🧪 Fallback test completed');
        }, 5000);
        
        return testPicture;
    }

    /**
     * Get fallback statistics
     */
    getFallbackStats() {
        return this.fallbackStats || {};
    }

    /**
     * Reset fallback statistics
     */
    resetFallbackStats() {
        this.fallbackStats = {};
        console.log('📊 Fallback statistics reset');
    }

    /**
     * Monitor image performance
     */
    monitorImagePerformance() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.initiatorType === 'img') {
                        console.log(`📊 Image loaded: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['resource'] });
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.imageEnhancementManager = new ImageEnhancementManager();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageEnhancementManager;
}

/**
 * Global error handling functions for specific image categories
 * These functions are called directly from HTML onerror attributes
 */

/**
 * Handle about section image errors with enhanced fallback system
 */
function handleAboutImageError(img) {
    console.warn('⚠️ About image failed to load:', img.src);
    
    const fallbackLevel = parseInt(img.dataset.fallbackLevel || '0');
    const category = img.dataset.category || 'about';
    const imageName = img.dataset.imageName || 'unknown';
    
    switch (fallbackLevel) {
        case 0:
            // First attempt: Try fallback source
            const fallbackSrc = img.dataset.fallbackSrc;
            if (fallbackSrc && fallbackSrc !== img.src) {
                img.dataset.fallbackLevel = '1';
                img.src = fallbackSrc;
                img.classList.add('fallback-secondary');
                console.log(`🔄 About image attempting secondary fallback: ${fallbackSrc}`);
            } else {
                handleAboutImageError(img); // Skip to next level
            }
            break;
            
        case 1:
            // Second attempt failed: Use CSS placeholder
            img.dataset.fallbackLevel = '2';
            img.style.display = 'none';
            img.classList.add('fallback-tertiary');
            
            // Add fallback styling to parent containers
            const teamMember = img.closest('.team-member');
            const teamPrimary = img.closest('.team-primary');
            
            if (teamMember) {
                teamMember.classList.add('team-fallback');
                console.log(`🎨 About team member using CSS placeholder: ${imageName}`);
            } else if (teamPrimary) {
                teamPrimary.classList.add('team-fallback');
                console.log(`🎨 About team primary using CSS placeholder: ${imageName}`);
            }
            break;
            
        default:
            // Final fallback: Hide completely
            img.dataset.fallbackLevel = '3';
            img.style.display = 'none';
            img.classList.add('fallback-final');
            
            const container = img.closest('.team-member, .team-primary, .about-team-gallery');
            if (container) {
                container.classList.add('image-failed');
            }
            
            console.error(`❌ All about image fallback options exhausted: ${imageName}`);
            break;
    }
    
    // Track fallback usage if manager is available
    if (window.imageEnhancementManager) {
        window.imageEnhancementManager.trackFallbackUsage(category, imageName, fallbackLevel);
    }
}

/**
 * Handle review section image errors with enhanced fallback system
 */
function handleReviewImageError(img) {
    console.warn('⚠️ Review image failed to load:', img.src);
    
    const fallbackLevel = parseInt(img.dataset.fallbackLevel || '0');
    const category = img.dataset.category || 'reviews';
    const imageName = img.dataset.imageName || 'unknown';
    
    switch (fallbackLevel) {
        case 0:
            // First attempt: Try fallback source
            const fallbackSrc = img.dataset.fallbackSrc;
            if (fallbackSrc && fallbackSrc !== img.src) {
                img.dataset.fallbackLevel = '1';
                img.src = fallbackSrc;
                img.classList.add('fallback-secondary');
                console.log(`🔄 Review image attempting secondary fallback: ${fallbackSrc}`);
            } else {
                handleReviewImageError(img); // Skip to next level
            }
            break;
            
        case 1:
            // Second attempt failed: Use subtle CSS placeholder
            img.dataset.fallbackLevel = '2';
            img.style.display = 'none';
            img.classList.add('fallback-tertiary');
            
            // Add subtle fallback styling to review card
            const reviewCard = img.closest('.review-card.enhanced');
            const reviewBackground = img.closest('.review-background');
            
            if (reviewCard && reviewBackground) {
                reviewBackground.classList.add('review-fallback');
                reviewCard.classList.add('review-no-image');
                
                // Create subtle gradient background instead of image
                reviewBackground.style.background = `
                    linear-gradient(135deg, 
                        rgba(41, 53, 78, 0.03) 0%, 
                        rgba(16, 185, 129, 0.02) 50%, 
                        rgba(248, 250, 252, 0.05) 100%)
                `;
                
                console.log(`🎨 Review card using gradient placeholder: ${imageName}`);
            }
            break;
            
        default:
            // Final fallback: Clean white background
            img.dataset.fallbackLevel = '3';
            img.style.display = 'none';
            img.classList.add('fallback-final');
            
            const container = img.closest('.review-card.enhanced');
            if (container) {
                container.classList.add('review-image-failed');
                const background = container.querySelector('.review-background');
                if (background) {
                    background.style.background = '#ffffff';
                }
            }
            
            console.error(`❌ All review image fallback options exhausted: ${imageName}`);
            break;
    }
    
    // Track fallback usage if manager is available
    if (window.imageEnhancementManager) {
        window.imageEnhancementManager.trackFallbackUsage(category, imageName, fallbackLevel);
    }
}