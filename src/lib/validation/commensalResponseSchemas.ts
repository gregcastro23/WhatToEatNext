import { z } from "zod";

export const SearchResultSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  })
  .passthrough();

export type SearchResult = z.infer<typeof SearchResultSchema>;

export const UserSearchResponseSchema = z
  .object({
    success: z.boolean(),
    users: z.array(SearchResultSchema).optional(),
  })
  .passthrough();

export type UserSearchResponse = z.infer<typeof UserSearchResponseSchema>;

export const GenericActionResponseSchema = z
  .object({
    success: z.boolean(),
    message: z.string().optional(),
  })
  .passthrough();

export type GenericActionResponse = z.infer<typeof GenericActionResponseSchema>;

export const CommensalRelationshipSchema = z.enum([
  "self",
  "family",
  "friend",
  "partner",
  "colleague",
  "other",
]);

export type CommensalRelationship = z.infer<typeof CommensalRelationshipSchema>;

export const BirthDataSchema = z
  .object({
    dateTime: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    utcInstant: z.string().optional(),
    timezone: z.string().optional(),
    timezoneBasis: z.string().optional(),
    location: z
      .object({
        latitude: z.number(),
        longitude: z.number(),
      })
      .optional(),
  })
  .passthrough();

export type BirthDataWire = z.infer<typeof BirthDataSchema>;

export const PlanetInfoSchema = z
  .object({
    name: z.string(),
    sign: z.string(),
    position: z
      .union([z.number(), z.null(), z.undefined()])
      .transform((val) => (typeof val === "number" && !Number.isNaN(val) ? val : 0)),
  })
  .passthrough();

export type PlanetInfoWire = z.infer<typeof PlanetInfoSchema>;

export const DominantElementSchema = z
  .string()
  .transform((val) => {
    const formatted = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
    return ["Fire", "Water", "Earth", "Air"].includes(formatted) ? (formatted as "Fire" | "Water" | "Earth" | "Air") : (val as "Fire" | "Water" | "Earth" | "Air");
  })
  .pipe(z.enum(["Fire", "Water", "Earth", "Air"]));

export const ElementalPropertiesSchema = z.object({
  Fire: z.number(),
  Water: z.number(),
  Earth: z.number(),
  Air: z.number(),
});

export const AlchemicalPropertiesSchema = z.object({
  Spirit: z.number(),
  Essence: z.number(),
  Matter: z.number(),
  Substance: z.number(),
});

export const NatalChartSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    birthData: BirthDataSchema.optional(),
    planets: z.array(PlanetInfoSchema).optional(),
    ascendant: z.string().optional(),
    planetaryPositions: z.record(z.string(), z.string()).optional(),
    dominantElement: DominantElementSchema.optional(),
    dominantModality: z.enum(["Cardinal", "Fixed", "Mutable"]).optional(),
    elementalBalance: ElementalPropertiesSchema.optional(),
    alchemicalProperties: AlchemicalPropertiesSchema.optional(),
    calculatedAt: z.string().optional(),
  })
  .passthrough();

export type NatalChartWire = z.infer<typeof NatalChartSchema>;

export const GroupMemberSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    relationship: CommensalRelationshipSchema.optional(),
    birthData: BirthDataSchema.optional(),
    natalChart: NatalChartSchema,
    createdAt: z.string().optional(),
  })
  .passthrough();

export type GroupMemberWire = z.infer<typeof GroupMemberSchema>;

export const ExtendedDiningGroupSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    memberIds: z.array(z.string()),
    linkedUserIds: z.array(z.string()).optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough();

export type ExtendedDiningGroupWire = z.infer<typeof ExtendedDiningGroupSchema>;
export const DiningGroupSchema = ExtendedDiningGroupSchema;
export type DiningGroupWire = ExtendedDiningGroupWire;

export const LinkedCommensalSchema = z
  .object({
    userId: z.string(),
    name: z.string(),
    email: z.string().optional(),
    natalChart: NatalChartSchema,
    birthData: BirthDataSchema.optional(),
    commensalshipId: z.string().optional(),
    syncedAt: z.string().optional(),
  })
  .passthrough();

export type LinkedCommensalWire = z.infer<typeof LinkedCommensalSchema>;

export const CommensalMemberResponseSchema = z
  .object({
    success: z.boolean(),
    message: z.string().optional(),
    commensal: GroupMemberSchema.optional(),
  })
  .passthrough();

export type CommensalMemberResponse = z.infer<
  typeof CommensalMemberResponseSchema
>;

export const CommensalListResponseSchema = z
  .object({
    success: z.boolean(),
    commensals: z.array(GroupMemberSchema).optional(),
    linkedCommensals: z.array(LinkedCommensalSchema).optional(),
    totalCount: z.number().optional(),
  })
  .passthrough();

export type CommensalListResponse = z.infer<typeof CommensalListResponseSchema>;

export const DiningGroupResponseSchema = z
  .object({
    success: z.boolean(),
    message: z.string().optional(),
    diningGroup: ExtendedDiningGroupSchema.optional(),
  })
  .passthrough();

export type DiningGroupResponse = z.infer<typeof DiningGroupResponseSchema>;

export const DiningGroupListResponseSchema = z
  .object({
    success: z.boolean(),
    diningGroups: z.array(ExtendedDiningGroupSchema).optional(),
  })
  .passthrough();

export type DiningGroupListResponse = z.infer<
  typeof DiningGroupListResponseSchema
>;

export const LinkedCommensalsResponseSchema = z
  .object({
    success: z.boolean(),
    linkedCommensals: z.array(LinkedCommensalSchema).optional(),
  })
  .passthrough();

export type LinkedCommensalsResponse = z.infer<
  typeof LinkedCommensalsResponseSchema
>;
