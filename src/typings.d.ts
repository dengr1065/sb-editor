interface PuzzleMetaData {
    id: number;
    shortKey: string;
    likes: number;
    downloads: number;
    completions: number;
    difficulty: number | null;
    averageTime: number | null;
    title: string;
    author: string;
    completed: boolean;
}

interface BuildingPosition {
    x: number;
    y: number;
    r: number;
}

interface PuzzleGameBuilding {
    type: "emitter" | "goal" | "block";
    item?: string;
    pos: BuildingPosition;
}

interface PuzzleGameData {
    version: number;
    bounds: {
        w: number;
        h: number;
    };
    buildings: PuzzleGameBuilding[];
    excludedBuildings: string[];
}

export interface PuzzleData {
    meta: PuzzleMetaData;
    game: PuzzleGameData;
}
