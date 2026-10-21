import { z } from 'zod';

export const regionSchema = z.enum([
  'world',
  'europe',
  'asia',
  'africa',
  'namerica',
  'samerica',
  'oceania',
]);
export type Region = z.infer<typeof regionSchema>;

export const levelIdSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);
export type LevelId = z.infer<typeof levelIdSchema>;

export const itemKindSchema = z.enum([
  'continent',
  'ocean',
  'country',
  'peninsula',
  'island',
  'mountain',
  'lowland',
  'river',
  'sea',
  'line',
  'hemisphere',
  'pole',
]);
export type ItemKind = z.infer<typeof itemKindSchema>;

// A hand-written fact. `reviewed` stays false until a teacher has checked it.
export const factSchema = z.object({
  textSl: z.string().min(10),
  source: z.string().min(3),
  reviewed: z.boolean(),
});
export type Fact = z.infer<typeof factSchema>;

export const itemSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  levels: z.array(levelIdSchema).min(1),
  kind: itemKindSchema,
  nameSl: z.string().min(2),
  plural: z.boolean().optional(),
  geo: z.string().min(1),
  region: regionSchema,
  flag: z
    .string()
    .regex(/^[A-Z]{2}$/)
    .optional(),
  coastal: z.boolean().optional(),
  group: z.string().optional(),
  fact: factSchema.optional(),
  curriculum: z.string().min(3),
});
export type Item = z.infer<typeof itemSchema>;

export function itemsInLevel(items: readonly Item[], level: LevelId): Item[] {
  return items.filter((item) => item.levels.includes(level));
}
