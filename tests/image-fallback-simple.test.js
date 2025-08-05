/**
 * Simplified Unit Tests for Enhanced Image Fallback System
 * Tests core functionality without complex DOM operations
 */

// Setup TextEncoder/TextDecoder for Node.js environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Import the ImageEnhancementManager
const ImageEnhancementManager = require('../js/image-enhancements.js');

describe('Enhanced Image Fallback System - Core Functionality', () => {
    let manager;
    let mockMetadata;

    beforeEach(() => {
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

    describe('Fallback Image Selection', () => {
        test('should return correct fallback images for different categories', () => {
            expect(manager.getFallbackImage('hero')).toBe('images/hero-bg.jpg');
            expect(manager.getFallbackImage('services')).toBe('images/residential-service.jpg');
            expect(manager.getFallbackImage('about')).toBe('images/radius-logo2.png');
            expect(manager.getFallbackImage('reviews')).toBe('images/hero-bg.jpg');
            expect(manager.getFallbackImage('unknown')).toBe('images/hero-bg.jpg');
        });
    });

    describe('Placeholder Content Generation', () => {
        test('should return correct placeholder icons for different categories', () => {
            expect(manager.getPlaceholderIcon('hero')).toBe('🏠');
            expect(manager.getPlaceholderIcon('services')).toBe('🔧');
            expect(manager.getPlaceholderIcon('about')).toBe('👥');
            expect(manager.getPlaceholderIcon('reviews')).toBe('⭐');
            expect(manager.getPlaceholderIcon('unknown')).toBe('🖼️');
        });

        test('should return correct placeholder text for different categories', () => {
            expect(manager.getPlaceholderText('hero')).toBe('Professional Plumbing Services');
            expect(manager.getPlaceholderText('services')).toBe('Service Image');
            expect(manager.getPlaceholderText('about')).toBe('Our Team');
            expect(manager.getPlaceholderText('reviews')).toBe('Customer Review');
            expect(manager.getPlaceholderText('unknown')).toBe('Image');
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

        test('should handle multiple images in statistics', () => {
            manager.trackFallbackUsage('hero', 'image1', 1);
            manager.trackFallbackUsage('services', 'image2', 2);
            manager.trackFallbackUsage('hero', 'image1', 3);
            
            const stats = manager.getFallbackStats();
            expect(stats['hero/image1'].count).toBe(2);
            expect(stats['services/image2'].count).toBe(1);
            expect(stats['hero/image1'].levels).toEqual([1, 3]);
            expect(stats['services/image2'].levels).toEqual([2]);
        });
    });

    describe('Image Metadata Handling', () => {
        test('should handle missing metadata gracefully', () => {
            const result = manager.getOptimizedImageSrc('nonexistent', 'image');
            expect(result).toBeNull();
        });

        test('should return correct optimized image sources', () => {
            const webpSrc = manager.getOptimizedImageSrc('hero', 'test-image', 'webp');
            expect(webpSrc).toBe('images/optimized/hero/test-image.webp');
            
            const optimizedSrc = manager.getOptimizedImageSrc('hero', 'test-image', 'optimized');
            expect(optimizedSrc).toBe('images/optimized/hero/test-image.png');
        });

        test('should return correct alt text from metadata', () => {
            const altText = manager.getOptimizedAltText('hero', 'test-image');
            expect(altText).toBe('Test image for fallback system');
            
            const missingAltText = manager.getOptimizedAltText('hero', 'nonexistent');
            expect(missingAltText).toBe('');
        });
    });

    describe('Fallback Metadata Creation', () => {
        test('should create fallback metadata structure', () => {
            const fallbackMetadata = manager.createFallbackMetadata();
            
            expect(fallbackMetadata).toHaveProperty('hero');
            expect(fallbackMetadata).toHaveProperty('services');
            expect(fallbackMetadata).toHaveProperty('about');
            expect(fallbackMetadata).toHaveProperty('reviews');
            expect(fallbackMetadata).toHaveProperty('seo');
            expect(fallbackMetadata.seo).toHaveProperty('openGraph');
            expect(fallbackMetadata.seo.openGraph.defaultImage).toBe('images/stock/hero/hero-main-plumber.png');
        });
    });

    describe('Error Level Handling', () => {
        test('should handle different fallback levels correctly', () => {
            // Mock image element
            const mockImg = {
                src: 'original-src.jpg',
                dataset: { fallbackLevel: '0', fallbackSrc: 'fallback.jpg', category: 'hero', imageName: 'test' },
                classList: { add: jest.fn() },
                style: {}
            };

            // Test secondary fallback
            manager.attemptSecondaryFallback(mockImg);
            expect(mockImg.dataset.fallbackLevel).toBe('1');
            expect(mockImg.src).toBe('fallback.jpg');
            expect(mockImg.classList.add).toHaveBeenCalledWith('fallback-secondary');
        });

        test('should skip to tertiary when no secondary fallback available', () => {
            const mockImg = {
                src: 'original-src.jpg',
                dataset: { fallbackLevel: '0', category: 'hero', imageName: 'test' },
                classList: { add: jest.fn() },
                style: {},
                closest: jest.fn().mockReturnValue(null)
            };

            // Mock attemptTertiaryFallback to avoid DOM operations
            manager.attemptTertiaryFallback = jest.fn();
            
            manager.attemptSecondaryFallback(mockImg);
            expect(manager.attemptTertiaryFallback).toHaveBeenCalledWith(mockImg);
        });
    });

    describe('WebP Support Detection', () => {
        test('should detect WebP support with canvas', () => {
            // Mock canvas and document.createElement
            const mockCanvas = {
                width: 0,
                height: 0,
                toDataURL: jest.fn().mockReturnValue('data:image/webp;base64,test')
            };
            
            global.document = {
                createElement: jest.fn().mockReturnValue(mockCanvas)
            };
            
            const webpSupported = manager.checkWebPSupport();
            expect(webpSupported).toBe(true);
            expect(mockCanvas.width).toBe(1);
            expect(mockCanvas.height).toBe(1);
        });

        test('should handle WebP not supported', () => {
            const mockCanvas = {
                width: 0,
                height: 0,
                toDataURL: jest.fn().mockReturnValue('data:image/png;base64,test')
            };
            
            global.document = {
                createElement: jest.fn().mockReturnValue(mockCanvas)
            };
            
            const webpSupported = manager.checkWebPSupport();
            expect(webpSupported).toBe(false);
        });
    });
});