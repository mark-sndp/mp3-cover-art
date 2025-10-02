#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const Mp3Processor = require('./mp3Processor');
const Logger = require('./logger');

/**
 * MP3 Cover Art Application
 * Applies cover art to MP3 files in a folder using FFmpeg
 */
class Mp3CoverArtApp {
  constructor(logLevel = 'info') {
    // Available log levels: 'debug', 'info', 'warn', 'error'
    this.logger = new Logger(logLevel);
  }

  /**
   * Parse and validate command line arguments
   * @returns {Object} Parsed arguments
   */
  parseArguments() {
    const args = process.argv.slice(2);
    
    // Parse log level option
    let logLevel = 'info';
    const logLevelIndex = args.indexOf('--log-level');
    if (logLevelIndex !== -1 && args[logLevelIndex + 1]) {
      logLevel = args[logLevelIndex + 1];
      // Remove log level arguments
      args.splice(logLevelIndex, 2);
    }
    
    if (args.length < 2) {
      this.showUsage();
      process.exit(1);
    }

    const inputFolder = path.resolve(args[0]);
    const coverArtPath = path.resolve(args[1]);
    const outputFolder = args[2] ? path.resolve(args[2]) : path.join(inputFolder, '..', 'output');

    return {
      inputFolder,
      coverArtPath,
      outputFolder,
      logLevel
    };
  }

  /**
   * Show usage information
   */
  showUsage() {
    console.log(`
Usage: node src/main.js <input-folder> <cover-art-image> [output-folder] [--log-level <level>]

Arguments:
  input-folder    Path to folder containing MP3 files
  cover-art-image Path to image file to use as cover art
  output-folder   Path to output folder (optional, defaults to ../output)

Options:
  --log-level     Log level: debug, info, warn, error (default: info)

Examples:
  node src/main.js ./input ./cover.jpg
  node src/main.js ./music ./artwork.png ./processed
  node src/main.js ./input ./cover.jpg --log-level debug
  node src/main.js ./input ./cover.jpg ./output --log-level warn
    `);
  }

  /**
   * Validate input arguments
   * @param {Object} args - Parsed arguments
   */
  async validateArguments(args) {
    const { inputFolder, coverArtPath, outputFolder } = args;

    // Check if input folder exists
    if (!await fs.pathExists(inputFolder)) {
      throw new Error(`Input folder does not exist: ${inputFolder}`);
    }

    // Check if cover art file exists
    if (!await fs.pathExists(coverArtPath)) {
      throw new Error(`Cover art file does not exist: ${coverArtPath}`);
    }

    // Check if cover art is an image file
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.gif'];
    const ext = path.extname(coverArtPath).toLowerCase();
    if (!imageExtensions.includes(ext)) {
      throw new Error(`Cover art must be an image file. Supported formats: ${imageExtensions.join(', ')}`);
    }

    // Ensure output folder exists
    await fs.ensureDir(outputFolder);

    this.logger.info(`Input folder: ${inputFolder}`);
    this.logger.info(`Cover art: ${coverArtPath}`);
    this.logger.info(`Output folder: ${outputFolder}`);
  }

  /**
   * Main application entry point
   */
  async run() {
    try {
      // Parse and validate arguments first to get log level
      const args = this.parseArguments();
      
      // Update logger with specified log level
      this.logger = new Logger(args.logLevel);
      
      this.logger.info('MP3 Cover Art Application Started');
      this.logger.debug(`Log level set to: ${args.logLevel}`);
      
      await this.validateArguments(args);

      // Validate FFmpeg installation
      this.logger.info('Checking FFmpeg installation...');
      const ffmpegAvailable = await Mp3Processor.validateFFmpeg();
      if (!ffmpegAvailable) {
        throw new Error('FFmpeg is not installed or not accessible. Please install FFmpeg and ensure it is in your system PATH.');
      }
      this.logger.info('✓ FFmpeg is available');

      // Initialize MP3 processor
      const processor = new Mp3Processor(this.logger);

      // Process MP3 files
      await processor.processFolder(args.inputFolder, args.coverArtPath, args.outputFolder);

      this.logger.info('MP3 Cover Art Application Completed Successfully');
      
    } catch (error) {
      this.logger.error(`Application failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run the application if this file is executed directly
if (require.main === module) {
  const app = new Mp3CoverArtApp();
  app.run();
}

module.exports = Mp3CoverArtApp;