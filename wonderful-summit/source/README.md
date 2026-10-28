# Wonderful Summit

Portrait mobile spell-painting roguelite.

## Run and build

Use Node.js 22.13 or newer.

```sh
npm ci
npm run dev
npm test
npm run build
```

The static build is written to `dist-pages/`. Copy its contents into the parent `wonderful-summit/` folder to update the hosted game. Relative asset URLs support subfolder hosting.

## Developer panel

Hold Spellbook for 3 seconds. Authorization is temporarily disabled for all players; grants apply locally to the current session. There is no account or API requirement in this build. Restore server-side identity checks before restricting access again.
