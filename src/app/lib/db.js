import PocketBase from 'pocketbase';

// Create a single PocketBase instance for the entire app
export const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

// Enable auto refresh of auth tokens
pb.autoCancellation(false);

// Helper to check if user is authenticated
export const isUserValid = () => {
  return pb.authStore.isValid;
};

// Helper to get current user
export const getCurrentUser = () => {
  return pb.authStore.record;
};