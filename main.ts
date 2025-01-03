import { exists } from "@std/fs/exists";
import { chunk, withoutAll } from "@std/collections";
import { PageIterator } from "@soundify/web-api/pagination";
import { addItemsToPlaylist, getPlaylistTracks, removePlaylistItems, SpotifyClient } from "@soundify/web-api";
import { Command } from "@cliffy/command";
import { Playlist, Track } from "./src/utils/spotify.ts";
import { retrieveAccessToken } from "./src/utils/spotify-authorization.ts";
import denoJSON from "./deno.json" with { type: "json" };

/**
 * Adds all Spotify tracks in the given text to a Spotify Playlist
 *
 * @param textOrFile The text or file path to read the input from.
 * @param playlistUrl The Spotify Playlist URL to add to tracks to.
 * @param options Additional options.
 */
export async function textToPlaylist(
  textOrFile: string,
  playlistUrl: string,
  options: Partial<Options> = {},
): Promise<Result> {
  const input = await exists(textOrFile) ? await Deno.readTextFile(textOrFile) : textOrFile;
  const mergedOptions: Options = { ...defaultOptions, ...options, playlistUrl };
  const accessToken = await retrieveAccessToken();
  const playlist = Playlist.fromUrl(mergedOptions.playlistUrl);
  const spotifyClient = new SpotifyClient(accessToken);

  // Read input and extract Spotify track links
  const trackUrls = mergedOptions.removeDuplicates
    ? Array.from(
      new Set(input.match(SPOTIFY_TRACK_PATTERN) ?? []),
    )
    : input.match(SPOTIFY_TRACK_PATTERN) ?? [];

  const tracks = trackUrls.map(Track.fromUrl);

  if (mergedOptions.debug) {
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

  // delete everything that is in `currentTrackURIs` but not in `trackURIs`
  const trackURIsToRemove = options.removeOtherTracks
    ? withoutAll(
      currentTracks.map((it) => it.toUri()),
      tracks.map((it) => it.toUri()),
    )
    : [];

  for (const batch of chunk(trackURIsToRemove, 50)) {
    await removePlaylistItems(spotifyClient, playlist.id, batch);
  }

  return {
    tracksAdded: trackUrisToAdd,
    tracksRemoved: trackURIsToRemove,
  };
}

const SPOTIFY_TRACK_PATTERN = /https:\/\/open\.spotify\.com\/track\/\w+/g;

type Options = {
  /**
   * URL to Spotify playlist.
   */
  playlistUrl: string;

  /**
   * Whether to filter out duplicates from input.
   */
  removeDuplicates: boolean;

  /**
   * Whether to remove tracks from playlist that do not exit in input
   */
  removeOtherTracks: boolean;

  debug: boolean;
};

type Result = {
  /**
   * Track URIs that were added.
   */
  tracksAdded: string[];

  /**
   * Track URIs that were removed.
   */
  tracksRemoved: string[];
};

const defaultOptions = {
  debug: false,
  removeDuplicates: true,
  removeOtherTracks: false,
} satisfies Partial<Options>;

if (import.meta.main) {
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

  const { tracksAdded, tracksRemoved } = await textToPlaylist(args[0], options.playlist, {
    ...options,
  });

  console.log(
    `Added ${tracksAdded.length} tracks to playlist: ${options.playlist}`,
  );

  console.log(
    `Added ${tracksRemoved.length} tracks to playlist: ${options.playlist}`,
  );
}
