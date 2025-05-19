import { env } from "@/env";

export const isDevelopmentEnvironment =
    env.NEXT_PUBLIC_APP_ENV === "development";
