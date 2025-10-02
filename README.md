# MP3 Cover Art Tool

A Node.js application that applies cover art images to MP3 audio files using FFmpeg. This tool processes all MP3 files in a specified folder and creates new files with embedded cover art in an output directory.

## Features

- 🎵 Batch processing of MP3 files
- 🖼️ Supports multiple image formats (JPG, PNG, BMP, GIF)
- 📁 Automatic output directory creation
- 📝 Comprehensive logging (console + file)
- ⚡ Fast processing using native FFmpeg execution
- 🔍 Input validation and error handling
- 📊 Processing summary with statistics

## Prerequisites

### Required Software

1. **Node.js** (version 14.0.0 or higher)
   - Download from [nodejs.org](https://nodejs.org/)

2. **FFmpeg** (required for audio processing)
   - **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html) or install via chocolatey:
     ```bash
     choco install ffmpeg
     ```
   - **macOS**: Install via Homebrew:
     ```bash
     brew install ffmpeg
     ```
   - **Linux**: Install via package manager:
     ```bash
     # Ubuntu/Debian
     sudo apt update && sudo apt install ffmpeg
     
     # CentOS/RHEL
     sudo yum install ffmpeg
     ```

### Verify FFmpeg Installation

```bash
ffmpeg -version
```

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mark-sndp/mp3-cover-art.git
   cd mp3-cover-art
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Usage

### Basic Syntax

```bash
node src/main.js <input-folder> <cover-art-image> [output-folder]
```

### Parameters

- `input-folder`: Path to the folder containing MP3 files
- `cover-art-image`: Path to the image file to use as cover art
- `output-folder`: *(Optional)* Path to the output folder. Defaults to `../output` relative to input folder

### Examples

#### Basic Usage
```bash
# Process MP3s in ./music folder with cover.jpg
node src/main.js ./music ./cover.jpg

# Specify custom output folder
node src/main.js ./music ./artwork.png ./processed-music
```

#### Real-world Examples
```bash
# Process an album folder
node src/main.js "C:/Music/My Album" "C:/Images/album-cover.jpg"

# Process with absolute paths
node src/main.js "/home/user/music" "/home/user/images/cover.png" "/home/user/output"
```

### NPM Scripts

```bash
# Run the application
npm start <input-folder> <cover-art-image> [output-folder]

# Development mode (same as start)
npm run dev <input-folder> <cover-art-image> [output-folder]
```

## Supported Formats

### Audio Files
- **Input**: MP3 files only
- **Output**: MP3 files with embedded cover art

### Image Files
- JPG/JPEG
- PNG
- BMP
- GIF

## Output

### File Structure
```
project/
├── input/              # Your MP3 files
├── output/             # Processed MP3 files (default)
├── logs/               # Application logs
│   └── mp3-cover-art-YYYY-MM-DD.log
└── src/                # Source code
```

### Logging

The application provides detailed logging in two formats:

1. **Console Output**: Real-time colored output showing progress
2. **Log Files**: Detailed logs saved to `logs/mp3-cover-art-YYYY-MM-DD.log`

#### Log Levels
- **INFO**: General information and progress
- **WARN**: Warnings (e.g., skipped files)
- **ERROR**: Error messages
- **DEBUG**: Detailed debugging information

### Processing Summary

After completion, you'll see a summary like:
```
=== Processing Summary ===
Total files: 15
Successful: 14
Failed: 1
Skipped: 0
✓ All processed files saved to: ./output
```

## Error Handling

The application handles various error scenarios:

- **Missing FFmpeg**: Clear error message with installation instructions
- **Invalid paths**: Validation of input folder and cover art file
- **Unsupported formats**: Checks for valid image file extensions
- **File conflicts**: Skips existing output files to prevent overwrites
- **Processing errors**: Individual file failures don't stop batch processing

## Performance Considerations

- Files are processed sequentially to avoid system overload
- Original files are preserved (never modified)
- Output files are only created if processing succeeds
- Existing output files are skipped to avoid duplicate work

## Troubleshooting

### Common Issues

1. **"FFmpeg not found" error**
   - Ensure FFmpeg is installed and accessible in your system PATH
   - Test with `ffmpeg -version` command

2. **"No MP3 files found" warning**
   - Check that the input folder contains .mp3 files
   - Verify folder path is correct

3. **"Permission denied" errors**
   - Ensure you have read access to input folder
   - Ensure you have write access to output folder

4. **"File already exists" warnings**
   - The application skips existing files to prevent overwrites
   - Delete output files or use a different output folder to reprocess

### Debug Mode

For detailed debugging information, modify the Logger initialization in `src/main.js`:

```javascript
this.logger = new Logger('debug'); // Change from 'info' to 'debug'
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Dependencies

- **[fs-extra](https://www.npmjs.com/package/fs-extra)**: Enhanced file system operations
- **Native Node.js modules**: `child_process`, `path`, `fs`

## Technical Details

### How It Works

1. **Validation**: Checks input folder, cover art file, and creates output directory
2. **Discovery**: Scans input folder for .mp3 files
3. **Processing**: Uses native Node.js `child_process` to spawn FFmpeg and embed cover art into each MP3 file
4. **Logging**: Records all operations to console and log file
5. **Summary**: Provides detailed statistics on completion

### FFmpeg Command

The application uses the following FFmpeg command structure:
```bash
ffmpeg -i input.mp3 -i cover.jpg -map 0:a -map 1:0 -c:a copy -c:v copy -id3v2_version 3 -disposition:v:0 attached_pic -y output.mp3
```

This command:
- Maps the audio stream from the MP3 file (`0:a`)
- Maps the image stream from the cover art (`1:0`)
- Copies audio stream without re-encoding (`-c:a copy`)
- Copies video/image stream without re-encoding (`-c:v copy`)
- Sets ID3v2.3 metadata version
- Marks the image as attached picture (cover art)
- Overwrites output file if it exists (`-y`)