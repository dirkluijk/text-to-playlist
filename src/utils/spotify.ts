export class Track {
  constructor(public id: string) {}

  static fromUrl(trackUrl: string) {
    const pattern = new URLPattern("https://open.spotify.com/track/:id");
    const result = pattern.exec(trackUrl);

    if (!result || !result.pathname.groups.id) {
      throw new Error("Invalid Spotify track URL");
    }

    return new Track(result.pathname.groups.id);
  }

  public toUri(): string {
    return `spotify:track:${this.id}`;
  }

  public toUrl(): string {
    return `https://open.spotify.com/track/${this.id}`;
  }
}

export class Playlist {
  constructor(public id: string) {}

  static fromUrl(playlistUrl: string) {
    const pattern = new URLPattern("https://open.spotify.com/playlist/:id");
    const result = pattern.exec(playlistUrl);

    if (!result || !result.pathname.groups.id) {
      throw new Error("Invalid Spotify playlist URL");
    }

    return new Playlist(result.pathname.groups.id);
  }

  public toUri(): string {
    return `spotify:playlist:${this.id}`;
  }

  public toUrl(): string {
    return `https://open.spotify.com/playlist/${this.id}`;
  }
}
