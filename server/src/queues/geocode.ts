import { Job, Queue, Worker } from "bullmq";

import { LocationType } from "@googlemaps/google-maps-services-js";
import { Property } from "database";
import { defaultOptions } from "./connection";
import { gmapsClient } from "../clients/google";
import { logger } from "../logger";
import { prisma } from "../clients/prisma";

const isDev = process.env.NODE_ENV === "development";

type GeocodeQueueData = Required<
  Pick<Property, "id" | "unparsedAddress" | "city" | "stateOrProvince" | "postalCode">
>;

export const geocodeQueue = new Queue<GeocodeQueueData>("geocode", {
  ...defaultOptions,
  defaultJobOptions: {
    removeOnComplete: true,
  },
});

export const geocodeWorker = new Worker("geocode", geocodeHandler, {
  ...defaultOptions,
  /** Google Maps API has a limit of 50 requests per second
      but we'll be nice and only do 40 per second to be safe. */
  limiter: {
    max: 40,
    duration: 1000,
  },
  concurrency: 5,
});

export async function geocodeHandler(job: Job<GeocodeQueueData>) {
  if (isDev) return;

  try {
    const { id, unparsedAddress, city, stateOrProvince, postalCode } = job.data;

    const response = await gmapsClient.geocode({
      params: {
        address: [unparsedAddress, city, stateOrProvince, postalCode].filter(Boolean).join(", "),
        key: process.env.GOOGLE_MAPS_API_KEY as string,
      },
    });

    if (!response.data.results.length) {
      logger.log({ level: "warn", message: `No geocode results for property ${id}` });
      return;
    }

    const { location, location_type } = response.data.results[0].geometry;

    if (location_type !== LocationType.ROOFTOP) {
      logger.log({
        level: "warn",
        message: `Accuracy of geocode results for property ${id} is not 'ROOFTOP'`,
      });
      return;
    }

    const { lat, lng } = location;

    if (!lat || !lng) {
      logger.log({ level: "warn", message: `No geocode results for property ${id}` });
      return;
    }

    await prisma.property.update({
      where: { id },
      data: {
        latitude: lat,
        longitude: lng,
      },
    });

    logger.log({ level: "info", message: `Processed geocode for property ${id}` });

    return "OK";
  } catch (error) {
    logger.log({ level: "error", message: JSON.stringify(error) });

    return "ERROR";
  }
}
