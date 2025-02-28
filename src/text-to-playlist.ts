import { exists } from "@std/fs/exists";
import { chunk, withoutAll } from "@std/collections";
import { PageIterator } from "@soundify/web-api/pagination";
import { addItemsToPlaylist, getPlaylistTracks, removePlaylistItems, SpotifyClient } from "@soundify/web-api";
import { Playlist, Track } from "./utils/spotify.ts";
import { retrieveAccessToken } from "./utils/spotify-authorization.ts";

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
  const mergedOptions: Options = { ...defaultOptions, ...options };
  const accessToken = await retrieveAccessToken();
  const playlist = Playlist.fromUrl(playlistUrl);
  const spotifyClient = new SpotifyClient(accessToken);

  // Read input and extract Spotify track links
  const SPOTIFY_TRACK_PATTERN = /https:\/\/open\.spotify\.com\/track\/\w+/g;
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

/**
 * Additional options.
 */
export type Options = {
  /**
   * Whether to filter out duplicates from input.
   */
  removeDuplicates: boolean;

  /**
   * Whether to remove tracks from playlist that do not exit in input.
   */
  removeOtherTracks: boolean;

  /**
   * Outputs debugging logs.
   */
  debug: boolean;
};

/**
 * Result of the playlist synchronization.
 */
export type Result = {
  /**
   * Track URIs that were added.
   */
  tracksAdded: string[];

  /**
   * Track URIs that were removed.
   */
  tracksRemoved: string[];
};

export const defaultOptions = {
  debug: false,
  removeDuplicates: true,
  removeOtherTracks: false,
} satisfies Partial<Options>;
