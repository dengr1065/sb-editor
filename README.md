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
-   `sbe:msg [message]`: Send a message from messages/ directory by its' name.

## Configuration

-   `token`: Discord bot token, required to login.
-   `apiToken`: Token for shapez.io API, required to access puzzles.
-   `puzzleWatchlist`: List of channel IDs to automatically run sbe:puzzle in.
-   `trustedRoles`: List of role IDs permitted to use instruction viewer and
    quick messages.
-   `antiSpamEnabled`: Enable or disable simple automated spam detection.
-   `upvoteThreshold`: Amount of emoji required to pin a message. Set to 0
    in order to disable pins.
-   `upvoteEmojis`: List of emoji IDs required for a message to get pinned.
-   `upvoteWatchlist`: List of channel IDs where messages will be pinned.
-   `disabledCommands`: Disable specific commands for each server.

---

Licensed under GNU General Public License, Version 3. Assets are taken from
the [shapez.io GitHub repository](https://github.com/tobspr/shapez.io).
