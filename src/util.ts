import { spawnSync } from "child_process";
import { readFile } from "fs/promises";

export function executeCommand(location: string, args: string[], cwd?: string): string {
    const process = spawnSync(location, args, {
        shell: false,
        cwd: cwd,
        timeout: 10e3,
        encoding: "utf-8"
    });

    if (process.error) {
        throw process.error;
    }

    if (process.status) {
        throw new Error(`Subprocess ${location} exited with status ${process.status}`);
    }

    return process.stdout.trim();
}

type LineRange = {
    content: string;
    start: number;
    end: number;
};

export async function getSurroundingLines(
    filePath: string,
    line: number,
    extBefore: number,
    extAfter: number
): Promise<LineRange> {
    let startLine = line - extBefore;
    if (startLine < 1) {
        startLine = 1;
    }

    if (extAfter < 0) {
        extAfter = 0;
    }

    const lines = (await readFile(filePath, "utf-8")).split("\n");
    let endLine = startLine + extBefore + extAfter;
    endLine = Math.min(endLine, lines.length);

    const surroundingLines = lines //
        .slice(startLine - 1, endLine)
        .map((line) => line || "/* empty line */")
        .join("\n");

    return {
        content: surroundingLines,
        start: startLine,
        end: endLine
    };
}
