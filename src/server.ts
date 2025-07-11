import app from "./app";
import { env } from "@/config/env";

const start = async () => {
  try {
    await app.listen({ port: env.SERVER_PORT, host: "0.0.0.0" });
    console.log("Servidor rodando na porta " + env.SERVER_PORT);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
