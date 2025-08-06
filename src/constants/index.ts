export const ErrorMessages = {
  INVALID_CREDENTIALS: "Email ou senha incorretos.",
  EMAIL_ALREADY_REGISTERED: "Email já registrado",
  USER_NOT_FOUND: "Usuário não encontrado",
  UNAUTHORIZED: "Não autorizado",
  ALREADY_FINISHED:
    "Expediente já finalizado, não é possível iniciar novamente.",
  ALREADY_STARTED: "Você já iniciou o expediente e ainda não finalizou.",
  NEED_TO_START_FIRST:
    "Você precisa iniciar o expediente antes de finalizá-lo.",
  ALREADY_ENDED: "Você já finalizou o expediente hoje.",
} as const;

export const SALT_ROUNDS = 10 as const;

export const TIMEZONE = "America/Sao_Paulo" as const;

export const RecordTypes = {
  START: "start",
  END: "end",
} as const;

export const COOKIE = {
  NAME: "refreshToken",
  PATH: "/",
  MAX_AGE_DAYS: 7,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
} as const;

export const MESSAGES = {
  LOGOUT_SUCCESS: "Sucesso",
  USER_CREATED: "Usuário cadastrado com sucesso.",
  RECORD_CREATED: "Ponto registrado com sucesso.",
} as const;

export const TOKEN_EXPIRATION = {
  ACCESS: "1h",
  REFRESH: "7d",
} as const;

export const ENV = {
  isProduction: process.env.NODE_ENV === "production",
} as const;
