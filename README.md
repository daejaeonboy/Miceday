<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1dsmb2a-9SRYnxtKolcUdksDgHmIQAV_I

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. If you need to bootstrap the first admin account outside local dev, set `VITE_ADMIN_BOOTSTRAP_EMAILS` in `.env.local` or `.env.production`
4. Run the app:
   `npm run dev`

## HTTPS dev server

Vite is currently configured to serve HTTP by default. To enable HTTPS for local or forwarded access, set both of these in `.env.local`:

`VITE_DEV_SSL_KEY_FILE=certs/dev-key.pem`

`VITE_DEV_SSL_CERT_FILE=certs/dev-cert.pem`

Then run `npm run dev` again. If those variables are not set, the dev server stays on HTTP.

For public HTTPS with a trusted certificate, simple port forwarding is usually not enough by itself. Use a reverse proxy or tunnel that terminates TLS in front of the Vite server.

## Firebase redirect site

This repo now includes a dedicated Firebase Hosting target for permanent redirects to `https://humanpartner.kr`.

Files:

`firebase.json` -> `legacyRedirect` target

`.firebaserc` -> `humanpartner-legacy-redirect` site mapping

Before deployment, create the Firebase Hosting site once:

`firebase hosting:sites:create humanpartner-legacy-redirect`

Then deploy only the redirect site:

`firebase deploy --only hosting:legacyRedirect`

After deployment, attach the custom domain `xn--h50bn8ojruujai1p.com` to that Hosting site in Firebase Console.
