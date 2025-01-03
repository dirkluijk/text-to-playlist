/**
 * Opens a URL in the users' browser.
 */
export async function open(uri: string): Promise<void> {
  const platform = Deno.build.os;
  const start = platform === "darwin" ? "open" : platform === "windows" ? "start" : "xdg-open";

  await new Deno.Command(start, { args: [uri] }).spawn().output();
}
