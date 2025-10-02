const fs = require('fs-extra');
const path = require('path');

/**
 * Logger class for console and file logging
 */
class Logger {
  constructor(logLevel = 'info', logToFile = true) {
    this.logLevel = logLevel;
    this.logToFile = logToFile;
    this.logLevels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    // Create logs directory and file
    if (this.logToFile) {
      this.logDir = path.join(process.cwd(), 'logs');
      this.logFile = path.join(this.logDir, `mp3-cover-art-${this.getDateString()}.log`);
      this.initializeLogFile();
    }
  }

  /**
   * Initialize log file and directory
   */
  async initializeLogFile() {
    try {
      await fs.ensureDir(this.logDir);
      await fs.ensureFile(this.logFile);
    } catch (error) {
      console.error('Failed to initialize log file:', error.message);
    }
  }

  /**
   * Get current date string for log file naming
   * @returns {string} Date string in YYYY-MM-DD format
   */
  getDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  /**
   * Get timestamp for log entries
   * @returns {string} Formatted timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Check if message should be logged based on level
   * @param {string} level - Log level
   * @returns {boolean} True if should log
   */
  shouldLog(level) {
    return this.logLevels[level] >= this.logLevels[this.logLevel];
  }

  /**
   * Format log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @returns {string} Formatted log message
   */
  formatMessage(level, message) {
    const timestamp = this.getTimestamp();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  /**
   * Write message to log file
   * @param {string} formattedMessage - Formatted log message
   */
  async writeToFile(formattedMessage) {
    if (this.logToFile) {
      try {
        await fs.appendFile(this.logFile, formattedMessage + '\n');
      } catch (error) {
        console.error('Failed to write to log file:', error.message);
      }
    }
  }

  /**
   * Generic log method
   * @param {string} level - Log level
   * @param {string} message - Log message
   */
  async log(level, message) {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message);
    
    // Console output with colors
    switch (level) {
      case 'debug':
        console.log(`\x1b[36m${formattedMessage}\x1b[0m`); // Cyan
        break;
      case 'info':
        console.log(`\x1b[32m${formattedMessage}\x1b[0m`); // Green
        break;
      case 'warn':
        console.log(`\x1b[33m${formattedMessage}\x1b[0m`); // Yellow
        break;
      case 'error':
        console.log(`\x1b[31m${formattedMessage}\x1b[0m`); // Red
        break;
      default:
        console.log(formattedMessage);
    }

    // Write to file
    await this.writeToFile(formattedMessage);
  }

  /**
   * Debug level logging
   * @param {string} message - Log message
   */
  debug(message) {
    this.log('debug', message);
  }

  /**
   * Info level logging
   * @param {string} message - Log message
   */
  info(message) {
    this.log('info', message);
  }

  /**
   * Warning level logging
   * @param {string} message - Log message
   */
  warn(message) {
    this.log('warn', message);
  }

  /**
   * Error level logging
   * @param {string} message - Log message
   */
  error(message) {
    this.log('error', message);
  }

  /**
   * Get the current log file path
   * @returns {string} Log file path
   */
  getLogFilePath() {
    return this.logFile;
  }
}

module.exports = Logger;