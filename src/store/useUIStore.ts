import { create } from "zustand";

interface UIState {
  isVipModalOpen: boolean;
  openVipModal: () => void;
  closeVipModal: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isVipModalOpen: false,
  openVipModal: () => set({ isVipModalOpen: true }),
  closeVipModal: () => set({ isVipModalOpen: false }),
}));
