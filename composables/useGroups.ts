import type { Group } from "~/types";

export default function () {
  return useState<{
    groups: Group[];
    mainGroupId: string;
  } | null>("groups", () => null);
}
