// Set NEXT_PUBLIC_DATABASE_FEATURES_ENABLED=true only once DATABASE_URL, the
// migrations and the required secrets are in place. Inlined at build time, so
// changing it requires a redeploy.
export const databaseFeaturesEnabled = process.env.NEXT_PUBLIC_DATABASE_FEATURES_ENABLED === "true";
