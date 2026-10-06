"use client";

import { Level01Door } from "./Level01Door";
import { Level02MissingCard } from "./Level02MissingCard";
import { Level03BlackRoom } from "./Level03BlackRoom";
import { Level04Eye } from "./Level04Eye";
import { Level05Tree } from "./Level05Tree";
import { Level06Balance } from "./Level06Balance";
import { Level07PatternName } from "./Level07PatternName";
import { Level08Wait } from "./Level08Wait";
import { Level09SequenceBreak } from "./Level09SequenceBreak";
import { Level10CardChoice } from "./Level10CardChoice";
import { LevelGeneric } from "./LevelGeneric";

export interface LevelRendererProps {
  levelId: number;
  mechanic: string;
  params: Record<string, unknown>;
  onSubmit: (payload: unknown) => Promise<{ success: boolean; message?: string }>;
}

const SPECIFIC: Record<number, React.ComponentType<LevelRendererProps>> = {
  1: Level01Door as React.ComponentType<LevelRendererProps>,
  2: Level02MissingCard as React.ComponentType<LevelRendererProps>,
  3: Level03BlackRoom as React.ComponentType<LevelRendererProps>,
  4: Level04Eye as React.ComponentType<LevelRendererProps>,
  5: Level05Tree as React.ComponentType<LevelRendererProps>,
  6: Level06Balance as React.ComponentType<LevelRendererProps>,
  7: Level07PatternName as React.ComponentType<LevelRendererProps>,
  8: Level08Wait as React.ComponentType<LevelRendererProps>,
  9: Level09SequenceBreak as React.ComponentType<LevelRendererProps>,
  10: Level10CardChoice as React.ComponentType<LevelRendererProps>,
};

export function LevelRenderer({ levelId, mechanic, params, onSubmit }: LevelRendererProps) {
  const Specific = SPECIFIC[levelId];
  if (Specific) {
    return <Specific levelId={levelId} mechanic={mechanic} params={params} onSubmit={onSubmit} />;
  }
  return (
    <LevelGeneric levelId={levelId} mechanic={mechanic} params={params} onSubmit={onSubmit} />
  );
}
