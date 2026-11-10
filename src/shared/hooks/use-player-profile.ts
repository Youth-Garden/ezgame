import { usePlayerStore, type PlayerProfile } from "@/shared/store/player.store";

export type { PlayerProfile };

export function usePlayerProfile() {
  const profile = usePlayerStore((state) => state.profile);
  const randomizeAvatar = usePlayerStore((state) => state.randomizeAvatar);
  const setName = usePlayerStore((state) => state.setName);
  const setAvatarStyle = usePlayerStore((state) => state.setAvatarStyle);
  const updateProfile = usePlayerStore((state) => state.updateProfile);

  return {
    profile,
    randomizeAvatar,
    setName,
    setAvatarStyle,
    updateProfile,
  };
}

