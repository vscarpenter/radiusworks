/**
 * Unit Tests for Enhanced Image Fallback System
 * Tests the three-tier fallback system and modern image format support
 */

// Setup TextEncoder/TextDecoder for Node.js environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock DOM environment for testing
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
    resources: 'usable'
});
global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
global.Image = dom.window.Image;

// Mock canvas toDataURL for WebP testing
global.HTMLCanvasElement.prototype.toDataURL = jest.fn();

// Import the ImageEnhancementManager
const ImageEnhancementManager = require('../js/image-enhancements.js');

describe('Enhanced Image Fallback System', () => {
    let manager;
    let mockMetadata;

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = '';
        
        // Create mock metadata
        mockMetadata = {
            hero: {
                'test-image': {
                    src: 'images/stock/hero/test-image.png',
                    webp: 'images/optimized/hero/test-image.webp',
                    optimized: 'images/optimized/hero/test-image.png',
                    alt: 'Test image for fallback system',
                    priority: 'high'
                }
            },
            services: {
                'service-test': {
                    src: 'images/stock/services/service-test.jpg',
                    webp: 'images/optimized/services/service-test.webp',
                    optimized: 'images/optimized/services/service-test.jpg',
                    alt: 'Test service image',
                    priority: 'medium'
                }
            }
        };

        // Create manager instance
        manager = new ImageEnhancementManager();
        manager.imageMetadata = mockMetadata;
    });

    describe('Picture Element Creation', () => {
        test('should create picture element with WebP and standard sources', () => {
            // Mock WebP support
            global.HTMLCanvasElement.prototype.toDataURL.mockReturnValue('data:image/webp;base64,test');
            
            const picture = manager.createPictureElement('hero', 'test-image');
            
            expect(picture).toBeTruthy();
            expect(picture.tagName).toBe('PICTURE');
            expect(picture.classList.contains('enhanced-picture')).toBe(true);
            
            const sources = picture.querySelectorAll('source');
            expect(sources.length).toBeGreaterThanOrEqual(1);
            
            const img = picture.querySelector('img');
            expect(img).toBeTruthy();
            expect(img.src).toContain('test-image.png');
            expect(img.alt).toBe('Test image for fallback system');
        });

        test('should create fallback picture element when metadata is missing', () => {
            const picture = manager.createPictureElement('hero', 'non-existent-image');
            
            expect(picture).toBeTruthy();
            expect(picture.classList.contains('fallback-picture')).toBe(true);
            
            const img = picture.querySelector('img');
            expect(img).toBeTruthy();
            expect(img.classList.contains('fallback-image')).toBe(true);
        });

        test('should set correct loading attribute based on priority', () => {
            const highPriorityPicture = manager.createPictureElement('hero', 'test-image');
            const highPriorityImg = highPriorityPicture.querySelector('img');
            expect(highPriorityImg.loading).toBe('eager');

            const mediumPriorityPicture = manager.createPictureElement('services', 'service-test');
            const mediumPriorityImg = mediumPriorityPicture.querySelector('img');
            expect(mediumPriorityImg.loading).toBe('lazy');
        });
    });

    describe('Three-Tier Fallback System', () => {
        test('should attempt secondary fallback on first error', () => {
            const picture = manager.createPictureElement('hero', 'test-image');
            const img = picture.querySelector('img');
            
            // Mock the fallback source
            img.dataset.fallbackSrc = 'images/hero-bg.jpg';
            
            // Simulate image error
            manager.handleEnhancedImageError(img);
            
            expect(img.dataset.fallbackLevel).toBe('1');
            expect(img.src).toContain('hero-bg.jpg');
            expect(img.classList.contains('fallback-secondary')).toBe(true);
        });

        test('should attempt tertiary fallback on second error', () => {
            const picture = manager.createPictureElement('hero', 'test-image');
            const img = picture.querySelector('img');
            
            // Set up for tertiary fallback
            img.dataset.fallbackLevel = '1';
            
            // Create a container for the image
            const container = dom.window.document.createElement('div');
            container.className = 'image-container';
            container.appendChild(picture);
            
            // Simulate second image error
            manager.handleEnhancedImageError(img);
            
            expect(img.dataset.fallbackLevel).toBe('2');
            expect(img.style.display).toBe('none');
            expect(img.classList.contains('fallback-tertiary')).toBe(true);
            expect(container.classList.contains('image-placeholder')).toBe(true);
        });

        test('should handle final fallback when all options are exhausted', () => {
            const picture = manager.createPictureElement('hero', 'test-image');
            const img = picture.querySelector('img');
            
            // Set up for final fallback
            img.dataset.fallbackLevel = '2';
            
            // Create a container for the image
            const container = dom.window.document.createElement('div');
            container.className = 'image-container';
            container.appendChild(picture);
            
            // Simulate final image error
            manager.handleEnhancedImageError(img);
            
            expect(img.dataset.fallbackLevel).toBe('3');
            expect(img.style.display).toBe('none');
            expect(img.classList.contains('fallback-final')).toBe(true);
            expect(container.classList.contains('image-failed')).toBe(true);
        });
    });

    describe('WebP Support Detection', () => {
        test('should detect WebP support', () => {
            // Mock toDataURL to return WebP format
            global.HTMLCanvasElement.prototype.toDataURL.mockReturnValue('data:image/webp;base64,test');
            
            const webpSupported = manager.checkWebPSupport();
            expect(webpSupported).toBe(true);
        });

        test('should handle lack of WebP support', () => {
            // Mock toDataURL to return PNG format
            global.HTMLCanvasElement.prototype.toDataURL.mockReturnValue('data:image/png;base64,test');
            
            const webpSupported = manager.checkWebPSupport();
            expect(webpSupported).toBe(false);
        });
    });

    describe('MIME Type Detection', () => {
        test('should return correct MIME types for different extensions', () => {
            expect(manager.getImageMimeType('image.jpg')).toBe('image/jpeg');
            expect(manager.getImageMimeType('image.jpeg')).toBe('image/jpeg');
            expect(manager.getImageMimeType('image.png')).toBe('image/png');
            expect(manager.getImageMimeType('image.webp')).toBe('image/webp');
            expect(manager.getImageMimeType('image.gif')).toBe('image/gif');
            expect(manager.getImageMimeType('image.svg')).toBe('image/svg+xml');
            expect(manager.getImageMimeType('image.unknown')).toBe('image/jpeg');
        });
    });

    describe('Alt Text Generation', () => {
        test('should generate appropriate alt text when metadata is missing', () => {
            const heroAlt = manager.generateAltText('hero', 'main-plumber');
            expect(heroAlt).toBe('Professional plumbing services Milwaukee - main plumber');
            
            const serviceAlt = manager.generateAltText('services', 'bathroom-repair');
            expect(serviceAlt).toBe('bathroom repair - Radius Works Milwaukee plumbing services');
            
            const aboutAlt = manager.generateAltText('about', 'team-photo');
            expect(aboutAlt).toBe('Radius Works team - team photo');
            
            const reviewAlt = manager.generateAltText('reviews', 'customer-work');
            expect(reviewAlt).toBe('Customer satisfaction - customer work');
        });
    });

    describe('Placeholder Creation', () => {
        test('should create appropriate placeholder content for different categories', () => {
            const container = dom.window.document.createElement('div');
            
            manager.createPlaceholderContent(container, 'hero');
            
            const placeholder = container.querySelector('.placeholder-content');
            expect(placeholder).toBeTruthy();
            
            const icon = placeholder.querySelector('.placeholder-icon');
            const text = placeholder.querySelector('.placeholder-text');
            
            expect(icon.textContent).toBe('🏠');
            expect(text.textContent).toBe('Professional Plumbing Services');
        });

        test('should create error placeholder for failed images', () => {
            const container = dom.window.document.createElement('div');
            
            manager.createErrorPlaceholder(container, 'services');
            
            const errorPlaceholder = container.querySelector('.error-placeholder');
            expect(errorPlaceholder).toBeTruthy();
            
            const icon = errorPlaceholder.querySelector('.error-icon');
            const text = errorPlaceholder.querySelector('.error-text');
            
            expect(icon.textContent).toBe('⚠️');
            expect(text.textContent).toBe('Image unavailable');
        });

        test('should not create duplicate placeholders', () => {
            const container = dom.window.document.createElement('div');
            
            manager.createPlaceholderContent(container, 'hero');
            manager.createPlaceholderContent(container, 'hero');
            
            const placeholders = container.querySelectorAll('.placeholder-content');
            expect(placeholders.length).toBe(1);
        });
    });

    describe('Fallback Statistics', () => {
        test('should track fallback usage statistics', () => {
            manager.trackFallbackUsage('hero', 'test-image', 1);
            manager.trackFallbackUsage('hero', 'test-image', 2);
            
            const stats = manager.getFallbackStats();
            expect(stats['hero/test-image']).toBeTruthy();
            expect(stats['hero/test-image'].count).toBe(2);
            expect(stats['hero/test-image'].levels).toEqual([1, 2]);
        });

        test('should reset fallback statistics', () => {
            manager.trackFallbackUsage('hero', 'test-image', 1);
            manager.resetFallbackStats();
            
            const stats = manager.getFallbackStats();
            expect(Object.keys(stats).length).toBe(0);
        });
    });

    describe('Image Enhancement', () => {
        test('should enhance existing image elements', () => {
            // Create a test image element
            const img = dom.window.document.createElement('img');
            img.src = 'images/test.jpg';
            img.className = 'test-image';
            img.dataset.category = 'hero';
            img.dataset.imageName = 'test-image';
            
            const container = dom.window.document.createElement('div');
            container.appendChild(img);
            
            const enhancedPicture = manager.enhanceImageElement(img, 'hero', 'test-image');
            
            expect(enhancedPicture).toBeTruthy();
            expect(enhancedPicture.tagName).toBe('PICTURE');
            expect(container.querySelector('img')).toBeFalsy(); // Original img should be replaced
            expect(container.querySelector('picture')).toBeTruthy();
        });
    });

    describe('Error Handling Edge Cases', () => {
        test('should handle missing fallback source gracefully', () => {
            const picture = manager.createPictureElement('hero', 'test-image');
            const img = picture.querySelector('img');
            
            // Remove fallback source
            delete img.dataset.fallbackSrc;
            
            // Create a container for the image
            const container = dom.window.document.createElement('div');
            container.className = 'image-container';
            container.appendChild(picture);
            
            // Simulate image error
            manager.handleEnhancedImageError(img);
            
            // Should skip to tertiary fallback
            expect(img.dataset.fallbackLevel).toBe('2');
            expect(container.classList.contains('image-placeholder')).toBe(true);
        });

        test('should handle missing container gracefully', () => {
            const picture = manager.createPictureElement('hero', 'test-image');
            const img = picture.querySelector('img');
            
            // Don't add to container
            img.dataset.fallbackLevel = '1';
            
            // Should not throw error
            expect(() => {
                manager.handleEnhancedImageError(img);
            }).not.toThrow();
        });
    });
});