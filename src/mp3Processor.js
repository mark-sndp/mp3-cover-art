const path = require('path');
const fs = require('fs-extra');
const { spawn } = require('child_process');

/**
 * MP3 Processor class handles reading MP3 files and applying cover art using FFmpeg
 */
class Mp3Processor {
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * Get all MP3 files from a directory
   * @param {string} folderPath - Path to the folder to scan
   * @returns {Array} Array of MP3 file paths
   */
  async getMp3Files(folderPath) {
    try {
      const files = await fs.readdir(folderPath);
      const mp3Files = files
        .filter(file => path.extname(file).toLowerCase() === '.mp3')
        .map(file => path.join(folderPath, file));
      
      this.logger.info(`Found ${mp3Files.length} MP3 files in ${folderPath}`);
      return mp3Files;
    } catch (error) {
      throw new Error(`Failed to read directory ${folderPath}: ${error.message}`);
    }
  }

  /**
   * Apply cover art to a single MP3 file using FFmpeg
   * @param {string} inputFile - Path to input MP3 file
   * @param {string} coverArtPath - Path to cover art image
   * @param {string} outputFile - Path to output MP3 file
   * @returns {Promise} Promise that resolves when processing is complete
   */
  applyCoverArt(inputFile, coverArtPath, outputFile) {
    return new Promise((resolve, reject) => {
      this.logger.info(`Processing: ${path.basename(inputFile)}`);
      
      const ffmpegArgs = [
        '-i', inputFile,
        '-i', coverArtPath,
        '-map', '0:a',          // Map audio from first input
        '-map', '1:0',          // Map image from second input
        '-c:a', 'copy',         // Copy audio without re-encoding
        '-c:v', 'copy',         // Copy video without re-encoding
        '-id3v2_version', '3',  // Use ID3v2.3
        '-disposition:v:0', 'attached_pic',  // Mark image as attached picture
        '-y',                   // Overwrite output file if it exists
        outputFile
      ];

      this.logger.info(`FFmpeg command: ffmpeg ${ffmpegArgs.join(' ')}`);

      const ffmpegProcess = spawn('ffmpeg', ffmpegArgs, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stderr = '';
      let stdout = '';

      ffmpegProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      ffmpegProcess.stderr.on('data', (data) => {
        const line = data.toString();
        stderr += line;
        
        // Log progress information
        if (line.includes('time=')) {
          this.logger.debug(`FFmpeg: ${line.trim()}`);
        }
      });

      ffmpegProcess.on('close', (code) => {
        if (code === 0) {
          this.logger.info(`✓ Completed: ${path.basename(outputFile)}`);
          resolve();
        } else {
          this.logger.error(`✗ Failed to process ${path.basename(inputFile)}: FFmpeg exited with code ${code}`);
          if (stderr) {
            this.logger.error(`FFmpeg stderr: ${stderr.trim()}`);
          }
          reject(new Error(`FFmpeg process exited with code ${code}`));
        }
      });

      ffmpegProcess.on('error', (error) => {
        this.logger.error(`✗ Failed to start FFmpeg: ${error.message}`);
        reject(error);
      });
    });
  }

  /**
   * Process all MP3 files in a folder
   * @param {string} inputFolder - Path to input folder
   * @param {string} coverArtPath - Path to cover art image
   * @param {string} outputFolder - Path to output folder
   */
  async processFolder(inputFolder, coverArtPath, outputFolder) {
    try {
      // Get all MP3 files
      const mp3Files = await this.getMp3Files(inputFolder);
      
      if (mp3Files.length === 0) {
        this.logger.warn('No MP3 files found in the input folder');
        return;
      }

      // Ensure output folder exists
      await fs.ensureDir(outputFolder);

      let successCount = 0;
      let failureCount = 0;

      this.logger.info(`Starting to process ${mp3Files.length} MP3 files...`);

      // Process each MP3 file
      for (const inputFile of mp3Files) {
        try {
          const fileName = path.basename(inputFile);
          const outputFile = path.join(outputFolder, fileName);
          
          // Check if output file already exists
          if (await fs.pathExists(outputFile)) {
            this.logger.warn(`Output file already exists, skipping: ${fileName}`);
            continue;
          }

          await this.applyCoverArt(inputFile, coverArtPath, outputFile);
          successCount++;
          
        } catch (error) {
          this.logger.error(`Failed to process ${path.basename(inputFile)}: ${error.message}`);
          failureCount++;
        }
      }

      // Summary
      this.logger.info(`\n=== Processing Summary ===`);
      this.logger.info(`Total files: ${mp3Files.length}`);
      this.logger.info(`Successful: ${successCount}`);
      this.logger.info(`Failed: ${failureCount}`);
      this.logger.info(`Skipped: ${mp3Files.length - successCount - failureCount}`);

      if (successCount > 0) {
        this.logger.info(`✓ All processed files saved to: ${outputFolder}`);
      }

    } catch (error) {
      throw new Error(`Failed to process folder: ${error.message}`);
    }
  }

  /**
   * Validate FFmpeg installation
   * @returns {Promise<boolean>} True if FFmpeg is available
   */
  static async validateFFmpeg() {
    return new Promise((resolve) => {
      const ffmpegProcess = spawn('ffmpeg', ['-version'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      ffmpegProcess.on('close', (code) => {
        resolve(code === 0);
      });

      ffmpegProcess.on('error', () => {
        resolve(false);
      });
    });
  }
}

module.exports = Mp3Processor;