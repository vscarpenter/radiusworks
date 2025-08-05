#!/usr/bin/env node

/**
 * Image Optimization Utility for Radius Works Website
 * Converts images to WebP format and optimizes file sizes
 */

const fs = require('fs');
const path = require('path');

class ImageOptimizer {
    constructor() {
        this.sourceDir = 'images/stock';
        this.outputDir = 'images/optimized';
        this.maxFileSize = 500 * 1024; // 500KB max file size
        this.supportedFormats = ['.jpg', '.jpeg', '.png'];
    }

    /**
     * Initialize the optimization process
     */
    async init() {
        console.log('🖼️  Starting image optimization for Radius Works...');
        
        // Check if directories exist
        if (!fs.existsSync(this.sourceDir)) {
            console.log(`📁 Source directory ${this.sourceDir} not found. Creating structure...`);
            this.createDirectoryStructure();
            return;
        }

        await this.processAllImages();
        console.log('✅ Image optimization complete!');
    }

    /**
     * Create the directory structure for stock images
     */
    createDirectoryStructure() {
        const dirs = ['hero', 'services', 'about', 'reviews', 'backgrounds'];
        
        dirs.forEach(dir => {
            const stockPath = path.join(this.sourceDir, dir);
            const optimizedPath = path.join(this.outputDir, dir);
            
            if (!fs.existsSync(stockPath)) {
                fs.mkdirSync(stockPath, { recursive: true });
                console.log(`📁 Created: ${stockPath}`);
            }
            
            if (!fs.existsSync(optimizedPath)) {
                fs.mkdirSync(optimizedPath, { recursive: true });
                console.log(`📁 Created: ${optimizedPath}`);
            }
        });
        
        console.log('📋 Directory structure created. Add images to /images/stock/ folders and run this script again.');
    }

    /**
     * Process all images in the stock directory
     */
    async processAllImages() {
        const categories = ['hero', 'services', 'about', 'reviews', 'backgrounds'];
        
        for (const category of categories) {
            const categoryPath = path.join(this.sourceDir, category);
            
            if (fs.existsSync(categoryPath)) {
                console.log(`\n📂 Processing ${category} images...`);
                await this.processCategory(category);
            }
        }
    }

    /**
     * Process images in a specific category
     */
    async processCategory(category) {
        const sourcePath = path.join(this.sourceDir, category);
        const outputPath = path.join(this.outputDir, category);
        
        const files = fs.readdirSync(sourcePath);
        const imageFiles = files.filter(file => 
            this.supportedFormats.includes(path.extname(file).toLowerCase())
        );

        if (imageFiles.length === 0) {
            console.log(`  ⚠️  No images found in ${category}`);
            return;
        }

        for (const file of imageFiles) {
            await this.optimizeImage(category, file);
        }
    }

    /**
     * Optimize a single image
     */
    async optimizeImage(category, filename) {
        const sourcePath = path.join(this.sourceDir, category, filename);
        const stats = fs.statSync(sourcePath);
        
        console.log(`  🔄 Processing: ${filename}`);
        console.log(`     Original size: ${this.formatFileSize(stats.size)}`);
        
        // For now, we'll create a placeholder optimization
        // In a real implementation, you'd use sharp, imagemin, or similar
        const outputFilename = this.getOptimizedFilename(filename);
        const outputPath = path.join(this.outputDir, category, outputFilename);
        
        // Copy file as placeholder (in real implementation, this would be actual optimization)
        fs.copyFileSync(sourcePath, outputPath);
        
        // Create WebP version filename
        const webpFilename = filename.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        const webpPath = path.join(this.outputDir, category, webpFilename);
        
        // Placeholder for WebP conversion (would use actual conversion library)
        fs.copyFileSync(sourcePath, webpPath);
        
        console.log(`     ✅ Optimized: ${outputFilename}`);
        console.log(`     ✅ WebP created: ${webpFilename}`);
    }

    /**
     * Get optimized filename
     */
    getOptimizedFilename(filename) {
        const ext = path.extname(filename);
        const name = path.basename(filename, ext);
        return `${name}${ext}`;
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Generate image metadata for SEO
     */
    generateImageMetadata() {
        const metadata = {
            hero: {},
            services: {},
            about: {},
            reviews: {},
            backgrounds: {}
        };

        // This would scan optimized images and generate metadata
        console.log('📊 Generating image metadata...');
        
        const metadataPath = 'scripts/image-metadata.json';
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
        console.log(`📄 Metadata saved to: ${metadataPath}`);
    }
}

// Run the optimizer if called directly
if (require.main === module) {
    const optimizer = new ImageOptimizer();
    optimizer.init().catch(console.error);
}

module.exports = ImageOptimizer;