/**
 * Represents a Spotify track.
 */
export class Track {
  constructor(public id: string) {}

  /**
   * Parses a track from its Spotify URL.
   * @see https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids
   */
  static fromUrl(trackUrl: string) {
    const pattern = new URLPattern("https://open.spotify.com/track/:id");
    const result = pattern.exec(trackUrl);

    if (!result || !result.pathname.groups.id) {
      throw new Error("Invalid Spotify track URL");
    }

    return new Track(result.pathname.groups.id);
  }

  /**
   * Returns the Spotify track URI.
   * @see https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids
   */
  public toUri(): string {
    return `spotify:track:${this.id}`;
  }

  /**
   * Returns the Spotify track URL.
   * @see https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids
   */
  public toUrl(): string {
    return `https://open.spotify.com/track/${this.id}`;
  }
}

/**
 * Represents a Spotify playlist.
 */
export class Playlist {
  constructor(public id: string) {}

  /**
   * Parses a playlist from its Spotify URL.
   * @see https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids
   */
  static fromUrl(playlistUrl: string) {
    const pattern = new URLPattern("https://open.spotify.com/playlist/:id");
    const result = pattern.exec(playlistUrl);

    if (!result || !result.pathname.groups.id) {
      throw new Error("Invalid Spotify playlist URL");
    }

    return new Playlist(result.pathname.groups.id);
  }

  /**
   * Returns the Spotify playlist URI.
   * @see https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids
   */
  public toUri(): string {
    return `spotify:playlist:${this.id}`;
  }

  /**
   * Returns the Spotify playlist URL.
   * @see https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids
   */
  public toUrl(): string {
    return `https://open.spotify.com/playlist/${this.id}`;
  }
}
