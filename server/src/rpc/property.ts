import { MLSServer } from "@honestdoor/proto-ts";
import { propertyQueue } from "../queues/property";

const upsertProperty: MLSServer["upsertProperty"] = async (call, callback) => {
  const { property } = call.request;

  if (!property) return callback(new Error("Property is required"), { success: false });

  const job = await propertyQueue.add(property.listingKey!!, property);

  if (!job.id)
    return callback(new Error("Failed to create property flow"), {
      success: false,
    });

  return callback(null, { success: true });
};

const upsertProperties: MLSServer["upsertProperties"] = async (call, callback) => {
  const { properties } = call.request;

  if (!properties) return callback(new Error("Properties are required"), { success: false });

  const jobs = await propertyQueue.addBulk(
    properties.map((p) => ({ name: p.listingKey!!, data: p }))
  );

  if (!jobs.length)
    return callback(new Error("Failed to create properties flow"), {
      success: false,
    });

  return callback(null, { success: true });
};

export { upsertProperty, upsertProperties };
