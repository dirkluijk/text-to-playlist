import { Command } from "@cliffy/command";
import denoJSON from "./deno.json" with { type: "json" };
import { defaultOptions, textToPlaylist } from "./src/text-to-playlist.ts";

export { textToPlaylist } from "./src/text-to-playlist.ts";
export type { Options, Result } from "./src/text-to-playlist.ts";

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
      { default: defaultOptions.removeDuplicates },
    )
    .option(
      "--remove-other-tracks [flag:boolean]",
      "Whether to remove tracks from playlist that do not exit in input",
      { default: defaultOptions.removeOtherTracks },
    )
    .arguments("<inputFileOrText>")
    .parse(Deno.args);

  const [input] = args;
  const { playlist, removeDuplicates, removeOtherTracks, debug } = options;
  const { tracksAdded, tracksRemoved } = await textToPlaylist(input, playlist, {
    removeDuplicates,
    removeOtherTracks,
    debug,
  });

  console.log(
    `Added ${tracksAdded.length} tracks to playlist: ${playlist}`,
  );

  console.log(
    `Added ${tracksRemoved.length} tracks to playlist: ${playlist}`,
  );
}
