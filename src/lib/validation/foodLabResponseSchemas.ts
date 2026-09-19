import { z } from "zod";

export const FoodLabPhotoSchema = z
  .object({
    dataUrl: z.string(),
    caption: z.string().optional(),
    uploadedAt: z.string(),
  })
  .passthrough();

export type FoodLabPhoto = z.infer<typeof FoodLabPhotoSchema>;

export const FoodLabEntrySchema = z
  .object({
    id: z.string(),
    dishName: z.string(),
    description: z.string().optional(),
    notes: z.string().optional(),
    recipeName: z.string().optional(),
    cuisineType: z.string().optional(),
    cookingMethod: z.string().optional(),
    cookedAt: z.string(),
    photos: z.array(FoodLabPhotoSchema),
    elementalTags: z.record(z.string(), z.number()),
    alchemicalTags: z.record(z.string(), z.number()),
    rating: z.number().optional(),
    tags: z.array(z.string()),
    isPublic: z.boolean(),
    shareToken: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .passthrough();

export type FoodLabEntry = z.infer<typeof FoodLabEntrySchema>;

export const FoodLabSingleResponseSchema = z
  .object({
    success: z.boolean(),
    entry: FoodLabEntrySchema,
    message: z.string().optional(),
  })
  .passthrough();

export type FoodLabSingleResponse = z.infer<typeof FoodLabSingleResponseSchema>;

export const FoodLabUploadResponseSchema = z
  .object({
    success: z.boolean(),
    dataUrl: z.string(),
    uploadedAt: z.string(),
    message: z.string().optional(),
  })
  .passthrough();

export type FoodLabUploadResponse = z.infer<typeof FoodLabUploadResponseSchema>;

export const FoodLabListResponseSchema = z
  .object({
    success: z.boolean(),
    entries: z.array(FoodLabEntrySchema).optional(),
    message: z.string().optional(),
  })
  .passthrough();

export type FoodLabListResponse = z.infer<typeof FoodLabListResponseSchema>;
