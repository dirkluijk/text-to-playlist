# Text to playlist 🎸

[![JSR version](http://img.shields.io/jsr/v/@dirkluijk/text-to-playlist.svg)](https://jsr.io/@dirkluijk/text-to-playlist)
[![Build status](https://github.com/dirkluijk/text-to-playlist/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/dirkluijk/text-to-playlist/actions/workflows/ci.yml)

Simple CLI script written in Deno to sync Spotify tracks from a raw text to a Spotify playlist.

## Usage

[Install Deno], and run:

[Install Deno]: https://docs.deno.com/runtime/getting_started/installation/

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
--remove-other-tracks  [flag]         - Whether to remove tracks from playlist that do not exit in input  (Default: false)
```

## Programmatic usage

To use this library in Deno, install it from JSR:

```bash
deno add jsr:@dirkluijk/text-to-playlist
```

```typescript
import { textToPlaylist } from "@dirkluijk/text-to-playlist";

await textToPlaylist("some text or file", "link to playlist");
```

Check out the [API docs here](https://jsr.io/@dirkluijk/text-to-playlist/doc).

## Contributors

- [@dirkluijk](https://github.com/dirkluijk) - Deno fork
- [@janluijk](https://github.com/janluijk) - original Python implementation
