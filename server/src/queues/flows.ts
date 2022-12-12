import { FlowJob, FlowProducer } from "bullmq";

import { Property } from "@honestdoor/proto-ts/out/proto/generated";
import cuid from "cuid";

const flowProducer = new FlowProducer();

export async function createPropertyFlow(property: Property) {
  const flowId = cuid();

  const media = property.media;
  const propertyNoMedia = { ...property, media: undefined };

  return await flowProducer.add({
    name: "property",
    data: propertyNoMedia,
    queueName: "property",
    opts: { jobId: flowId },
    children: [
      {
        name: "media",
        data: media,
        queueName: "media",
        opts: { jobId: flowId },
      },
    ],
  });
}

export async function createPropertiesFlow(properties: Property[]) {
  const jobs = properties.reduce((acc: FlowJob[], property: Property) => {
    const flowId = cuid();

    const media = property.media;
    const propertyNoMedia = { ...property, media: undefined };

    return [
      ...acc,
      {
        name: "property",
        data: propertyNoMedia,
        queueName: "property",
        opts: { jobId: flowId },
        children: [
          {
            name: "media",
            data: media,
            queueName: "media",
            opts: { jobId: flowId },
          },
        ],
      },
    ];
  }, [] as FlowJob[]);

  return await flowProducer.addBulk(jobs);
}
