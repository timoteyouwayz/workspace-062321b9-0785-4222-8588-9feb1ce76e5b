const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_POSTGRES_URL || "postgresql://neondb_owner:npg_cRqfN7iK1hpv@ep-late-mountain-ad4c2oke-pooler.c-2.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

const config = {
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
};

export default config;
