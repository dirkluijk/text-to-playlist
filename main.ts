import { exists } from "@std/fs/exists";
import { chunk, withoutAll } from "@std/collections";
import { PageIterator } from "@soundify/web-api/pagination";
import { addItemsToPlaylist, getPlaylistTracks, removePlaylistItems, SpotifyClient } from "@soundify/web-api";
import { Command } from "@cliffy/command";
import { Playlist, Track } from "./src/utils/spotify.ts";
import { retrieveAccessToken } from "./src/utils/spotify-authorization.ts";
import denoJSON from "./deno.json" with { type: "json" };

const SPOTIFY_TRACK_PATTERN = /https:\/\/open\.spotify\.com\/track\/\w+/g;

const { args, options } = await new Command()
  .name("text-to-playlist")
  .version(denoJSON.version)
  .description(
    "Adds all Spotify tracks in the given text to a Spotify Playlist",
  )
  .option(
    "-P, --playlist <playlistUrl>",
    "The Spotify Playlist URL to add to tracks to",
    { required: true },
  )
  .option("-D, --debug", "Outputs debugging logs")
  .option(
    "--remove-duplicates [flag:boolean]",
    "Whether to filter out duplicates from input",
    { default: true },
  )
  .option(
    "--remove-other-tracks [flag:boolean]",
    "Whether to remove tracks from playlist that do not exit in input",
    { default: false },
  )
  .arguments("<inputFileOrText>")
  .parse(Deno.args);

const input = await exists(args[0]) ? await Deno.readTextFile(args[0]) : args[0];
const playlist = Playlist.fromUrl(options.playlist);
const { removeDuplicates, removeOtherTracks } = options;

const accessToken = await retrieveAccessToken();
const spotifyClient = new SpotifyClient(accessToken);

// Read input and extract Spotify track links
const trackUrls = removeDuplicates
  ? Array.from(
    new Set(input.match(SPOTIFY_TRACK_PATTERN) ?? []),
  )
  : input.match(SPOTIFY_TRACK_PATTERN) ?? [];

const tracks = trackUrls.map(Track.fromUrl);

if (options.debug) {
  console.debug("Found tracks:");
  console.table(tracks.map((it) => it.toUrl()));
}

const currentTracks = await new PageIterator(
  (offset) => getPlaylistTracks(spotifyClient, playlist.id, { limit: 50, offset }),
).collect().then((tracks) => tracks.map(({ track }) => new Track(track.id)));

// add everything that is in `tracks` but not in `currentTracks`
const trackUrisToAdd = withoutAll(
  tracks.map((it) => it.toUri()),
  currentTracks.map((it) => it.toUri()),
);

for (const batch of chunk(trackUrisToAdd, 50)) {
  await addItemsToPlaylist(spotifyClient, playlist.id, batch);
}

console.log(
  `Added ${trackUrisToAdd.length} tracks to playlist: ${playlist.toUrl()}`,
);

// delete everything that is in `currentTrackURIs` but not in `trackURIs`
const trackURIsToRemove = removeOtherTracks
  ? withoutAll(
    currentTracks.map((it) => it.toUri()),
    tracks.map((it) => it.toUri()),
  )
  : [];

for (const batch of chunk(trackURIsToRemove, 50)) {
  await removePlaylistItems(spotifyClient, playlist.id, batch);
}

console.log(
  `Removed ${trackURIsToRemove.length} tracks from playlist: ${playlist.toUrl()}`,
);
