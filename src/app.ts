import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from "fastify-type-provider-zod";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";

import AppError from "./errors/AppError";
import authRoutes from "./routes/auth.routes";
import { env } from "./config/env";
import recordRoutes from "./routes/record.routes";

const app = Fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Ilumeo API",
      version: "1.0.0",
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: "refreshToken",
    signed: false,
  },
  sign: {
    expiresIn: "30m",
  },
});

app.register(fastifyCookie);

app.register(cors, {
  origin: env.CLIENT_URL,
  credentials: true,
});

app.register(authRoutes, { prefix: "/auth" });
app.register(recordRoutes, { prefix: "/record" });

app.setErrorHandler(function (error, request, reply) {
  console.log("ERROR:", error);

  if (error instanceof AppError) {
    return reply
      .status(error.statusCode)
      .send({ error: { message: error.message } });
  }

  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.code(400).send({
      error: {
        message: "Request doesn't match the schema",
        statusCode: 400,
      },
      details: {
        issues: error.message,
        method: request.method,
        url: request.url,
      },
    });
  }

  if (isResponseSerializationError(error)) {
    return reply.code(500).send({
      error: {
        message: "Response doesn't match the schema",
        statusCode: 500,
      },
      details: {
        issues: error.cause.issues,
        method: error.method,
        url: error.url,
      },
    });
  }

  reply.status(500).send({ message: "Internal server error" });
});

export default app;
