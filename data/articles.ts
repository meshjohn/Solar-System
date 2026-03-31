import { PlanetData } from "./planets";

export function getArticleContent(topic: string, planet: PlanetData): string {
  return `INITIALIZING DATABASE QUERY...
==================================
NODE: ${planet.name.toUpperCase()} / SECTOR: ${planet.field.toUpperCase()}
TOPIC SEARCH: ${topic.toUpperCase()}
STATUS: DECRYPTING SECURE ARCHIVES...

/// RECORD FOUND ///

${topic} constitutes a vital intellectual sector within the broader domain of ${planet.field}. Long associated with the orbital resonance of ${planet.name}, the deeper study of ${topic} reveals foundational truths about human understanding and cosmic architecture.

Early practitioners explored the outer limits of this discipline, mapping theoretical boundaries and establishing paradigms that have endured through successive epochs. Today, the synthesis of these early models continues to dictate advanced methodological frameworks.

KEY METRICS AROUND ${topic.toUpperCase()}:
> Historical Relevance Index : 98.4%
> Active Research Nodes      : 14,204
> Disruption Potential       : Alpha-Tier

Connecting nodes indicate significant crossover with adjacent methodologies. The study of ${topic} remains not merely an academic exercise, but a living, evolving ecosystem of thought that powers the very core of ${planet.name}'s influence.

[ END OF RECORD ]`;
}
