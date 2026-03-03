import fs from "fs/promises";
import path from "path";
import { getPatchNote } from "../api/patchnotesApi";
import { transformPatchNote, type PatchNoteMetadata } from "./transformPatchNote";
import type { ChampionJson } from "@/shared/model/game-data";
import type { PatchNoteExtended } from "../types";

let cachedChampionData: ChampionJson | null = null;

async function loadChampionData(): Promise<ChampionJson> {
  if (cachedChampionData) return cachedChampionData;
  const filePath = path.join(
    process.cwd(),
    "public",
    "data",
    "championFull.json"
  );
  const raw = await fs.readFile(filePath, "utf-8");
  cachedChampionData = JSON.parse(raw) as ChampionJson;
  return cachedChampionData;
}

export async function fetchPatchNoteServer(
  versionId: string
): Promise<PatchNoteExtended> {
  const [championData, response] = await Promise.all([
    loadChampionData(),
    getPatchNote(versionId),
  ]);

  const metadata: PatchNoteMetadata = {
    patchUrl: response.patchUrl,
    createdAt: response.createdAt,
  };

  return transformPatchNote(response.content, championData, metadata);
}
