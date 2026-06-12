import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: "file:/home/dima/home/focus_champ/prisma/dev.db",
  },
})
