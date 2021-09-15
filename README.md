# ShapeBot Editor

This is a little bot to extend ShapeBot basic features (role management) with
commands intended for the end user.

## Setup

Requirements: Node.js, Yarnpkg. _Depending on your operating system, a C/C++
compiler may be required._

-   Clone the repository.
-   Install dependencies by running `yarn`.
-   Copy and adjust the configuration file (`config.json`).
-   Finally, run the bot: `node .`.

## Features

-   `sbe:compress`: Compress a JSON data into shapez.io savegame format.
-   `sbe:decompress`: Decode and decompress shapez.io savegame into
    human-readable JSON.
-   `sbe:puzzle <key>`: Display a puzzle using the short key.
-   `sbe:reports <key/username>`: View reports for a puzzle or by username.
-   `sbe:puzzlesearch [search terms]`: Search the puzzle collection.

## Configuration

-   `token`: Discord bot token, required to login.
-   `apiToken`: Token for shapez.io API, required to access puzzles.
-   `puzzleWatchlist`: List of channel IDs to automatically run sbe:puzzle in.
-   `viewerAccessRoles`: List of role IDs permitted to use shape viewer.
-   `antiSpamEnabled`: Controls automatic spam detection.
-   `antiSpamRole`: If automatic spam detection is enabled, specify a role ID
    to assign here.

---

Licensed under GNU General Public License, Version 3. Assets are taken from
the [shapez.io GitHub repository](https://github.com/tobspr/shapez.io).
