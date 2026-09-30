// Legacy Lovable auth helper retained only as a compatibility shim.
// The app now uses Supabase Auth directly for Google sign-in.

export const lovable = {
  auth: {
    signInWithOAuth: async () => ({
      redirected: false,
      error: null,
    }),
  },
};
