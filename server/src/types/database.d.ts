import type { Media, Property } from "@hd/db";

export type PropertyWithMedia = Property & { media?: Media[] };
export type MediaWithoutPropertyId = Omit<Media, "propertyId">;
