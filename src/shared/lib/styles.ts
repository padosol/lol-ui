import { IMAGE_HOST } from "@/shared/config/image";

export function getStyleImageUrl(styleId: number): string {
  if (!styleId || styleId === 0) {
    return "";
  }
  return `${IMAGE_HOST}/styles/${styleId}.png`;
}
