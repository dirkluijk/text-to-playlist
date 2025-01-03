# Text to playlist 🎸

[![JSR version](http://img.shields.io/jsr/v/@dirkluijk/text-to-playlist.svg)](https://jsr.io/@dirkluijk/text-to-playlist)
[![Build status](https://github.com/dirkluijk/text-to-playlist/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/dirkluijk/text-to-playlist/actions/workflows/ci.yml)

Simple CLI script to sync Spotify tracks from a raw text to a playlist.

## Usage

Install Deno, and run:

```bash
deno run --allow-net jsr:@dirkluijk/text-to-playlist <inputFileOrText> --playlist <playlistUrl>
```

## Options

```
-h, --help                            - Show this help.                                                                  
-V, --version                         - Show the version number for this program.                                        
-P, --playlist         <playlistUrl>  - The Spotify Playlist URL to add to tracks to                      (required)     
-D, --debug                           - Outputs debugging logs                                                           
--remove-duplicates    [flag]         - Whether to filter out duplicates from input                       (Default: true)
--remove-other-tracks  [flag]         - Whether to remove tracks from playlist that do not exit in input  (Default: true)
```

## Contributors

- [@dirkluijk](https://github.com/dirkluijk) - Deno fork
- [@janluijk](https://github.com/janluijk) - original Python implementation
