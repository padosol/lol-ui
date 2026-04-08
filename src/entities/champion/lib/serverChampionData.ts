import fs from "fs/promises";
import path from "path";
import type { ChampionJson } from "@/shared/model/game-data";

let cachedPromise: Promise<ChampionJson> | null = null;

export function loadChampionDataServer(): Promise<ChampionJson> {
  if (!cachedPromise) {
    cachedPromise = (async () => {
      const filePath = path.join(process.cwd(), "public", "data", "championFull.json");
      const raw = await fs.readFile(filePath, "utf-8");
      return JSON.parse(raw) as ChampionJson;
    })();
  }
  return cachedPromise;
}

export async function getChampionKeyFromId(
  championId: string
): Promise<{ key: string; name: string } | null> {
  const data = await loadChampionDataServer();
  const champ = data.data[championId];
  if (!champ) return null;
  return { key: champ.key, name: champ.name };
}
