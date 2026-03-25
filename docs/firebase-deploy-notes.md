## Firebase deploy notes

- Service domain: `https://miceday.co.kr`
- Firebase project display name: `Miceday`
- Firebase project ID: `human-partner`
- Local hosting target alias: `miceday`

Use `firebase deploy --only hosting` or `firebase deploy --only functions` from this repo.
The repo is configured so the `miceday` hosting target points to the Firebase Hosting site `human-partner`.
