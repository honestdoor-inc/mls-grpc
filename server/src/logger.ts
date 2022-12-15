import winston from "winston";

export const logger = winston.createLogger({
  format: winston.format.json(),
  defaultMeta: { service: "mls-grpc" },
  transports: [
    // new winston.transports.File({ filename: "error.log", level: "error" }),
    // new winston.transports.File({ filename: "combined.log" }),
    new winston.transports.Console({
      format: winston.format.splat(),
    }),
  ],
});
