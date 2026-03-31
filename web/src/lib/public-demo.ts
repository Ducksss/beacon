export const publicDemoModeEnabled =
  process.env.NEXT_PUBLIC_BEACON_PUBLIC_DEMO === 'true';

export const PUBLIC_DEMO_READ_ONLY_MESSAGE =
  'Beacon is running in read-only public demo mode. Use Try Online to test live sends with your own Telegram bot token.';

export const PUBLIC_DEMO_PRIVATE_METADATA_MESSAGE =
  'Beacon is running in public demo mode. House metadata is not available in this deployment.';

export const PUBLIC_DEMO_DATASET_MESSAGE =
  'Shared demo dataset: this dashboard is showing curated Supabase demo records for public review. The Try Online playground does not modify these records.';

export function isPublicDemoMode(): boolean {
  return publicDemoModeEnabled;
}
