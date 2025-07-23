import crc32 from "crc/crc32";
import lzs from "lz-string";
import { compressObject, decompressObject } from "./compressor.js";

const checksumPrefix = "crc32".padEnd(32, "-");
const binSalt = "Ec'])@^+*9zMevK3uMV4432x9%iK'=";
const marker = Buffer.of(0x01);

/**
 * @typedef {Object} DecompressResult
 * @property {object} [data] Decompressed data
 * @property {string[]} warnings Warnings and errors
 */

/**
 * Decompress a .bin file (shapez.io savegame format)
 * @param {Buffer} file The .bin file to decompress
 * @returns {DecompressResult}
 */
export function decompress(file) {
    const warnings = [];

    try {
        if (file[0] != 0x01) {
            warnings.push("Invalid compression marker");
        }

        const encoded = file.toString("utf-8", 1);
        const decoded = lzs.decompressFromEncodedURIComponent(encoded);
        if (!decoded) {
            // either null or empty string
            throw new Error("Corrupted .bin file (failed to decompress)");
        }

        const checksum = decoded.substr(32, 8);
        const compressed = decoded.substr(40);
        if (!decoded.startsWith(checksumPrefix)) {
            warnings.push("Incorrect checksum type (old savegame?)");
        } else {
            const actualChecksum = computeChecksum(compressed);
            if (actualChecksum != checksum) {
                warnings.push("Failed to verify data (checksum mismatch)");
            }
        }

        const parsed = JSON.parse(compressed);
        return { data: decompressObject(parsed), warnings };
    } catch (err) {
        warnings.push(err.message || String(err));
    }

    return { warnings };
}

/**
 * Compress to a .bin file
 * @param {object} data Data to compress
 */
export function compress(data) {
    const stringified = JSON.stringify(compressObject(data));
    const checksum = computeChecksum(stringified);

    const decoded = checksumPrefix + checksum + stringified;
    const encoded = lzs.compressToEncodedURIComponent(decoded);
    return Buffer.concat([marker, Buffer.from(encoded, "utf-8")]);
}

/**
 * Compute CRC32 checksum for compressed .bin data
 * @param {string} compressed Compressed data to verify
 * @returns {string}
 */
function computeChecksum(compressed) {
    return crc32(compressed + binSalt)
        .toString(16)
        .padStart(8, "0");
}
