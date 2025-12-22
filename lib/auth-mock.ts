export const getMockUser = () => ({
  telegram_id: "123456789",                                 
  username: "ove4lo",
  first_name: "Алина",
  last_name: "Михайлова",
  is_premium: true,
});

export const useCurrentUser = () => {
  return { user: getMockUser(), isLoaded: true, isSignedIn: true };
};