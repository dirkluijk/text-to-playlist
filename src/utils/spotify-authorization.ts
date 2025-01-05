import wretch from "wretch";
import FormUrlAddon from "wretch/addons/formUrl";
import { open } from "./open.ts";
import { createPkceChallenge } from "./pkce.ts";

const CLIENT_ID = "e7ac817efe444b7bbdf70875114b1b0d";
const REDIRECT_URI = "http://localhost:8888/callback";

const [codeVerifier, codeChallenge] = await createPkceChallenge();

/**
 * Starts a local web server to accept the callback from the Spotify Authorization flow.
 */
function waitForAuthorization(options: { port: number }): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const abortController = new AbortController();
    const server = Deno.serve({
      handler: (request: Request) => {
        const requestUrl = new URL(request.url);
        const queryParams = new URLSearchParams(requestUrl.search);
        const code = queryParams.get("code");

        if (code === null) {
          reject(new Error("Missing code in Spotify callback"));
          return new Response("Error: missing code in Spotify callback.", {
            status: 400,
          });
        }

        setTimeout(() => abortController.abort());
        resolve(server.finished.then(() => code));

        return new Response("You can now close this browser window.");
      },
      port: options.port,
      signal: abortController.signal,
      onListen: () => {},
    });
  });
}

export async function retrieveAccessToken(): Promise<string> {
  // request permissions upfront
  await Deno.permissions.request({ name: "net", host: '0.0.0.0:8888' });

  // ask user authorization
  await open(
    "https://accounts.spotify.com/authorize?" +
      new URLSearchParams({
        response_type: "code",
        client_id: CLIENT_ID,
        scope: "playlist-modify-private,playlist-modify-public",
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
        redirect_uri: REDIRECT_URI,
      }).toString(),
  );

  // wait for user to have accepted
  // opens web server to accept the callback
  const code = await waitForAuthorization({ port: 8888 });

  // now request the access token based on the authorization code
  const { access_token } = await wretch("https://accounts.spotify.com/api/token")
    .addon(FormUrlAddon)
    .formUrl({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    })
    .post()
    .json<{ access_token: string }>();

  return access_token;
}
