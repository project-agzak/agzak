import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { ApiError } from "@/lib/api";
import {
  fetchMyCollection as apiFetchMyCollection,
  fetchMemberCollection as apiFetchMemberCollection,
  type CollectionCookieDto,
  type MemberCollectionParams,
} from "@/lib/collectionAPI";

type CollectionStoreState = {
  // 나의 도감
  myCollection: CollectionCookieDto[] | null;
  // 다른 멤버(프로필 모달 대상)의 도감
  memberCollection: CollectionCookieDto[] | null;

  isLoadingMy: boolean;
  isLoadingMember: boolean;

  myError?: ApiError;
  memberError?: ApiError;

  // actions
  loadMyCollection: () => Promise<void>;
  loadMemberCollection: (params: MemberCollectionParams) => Promise<void>;
  clearMemberCollection: () => void;
};

export const useCollectionStore = create<CollectionStoreState>()(
  devtools(
    (set) => ({
      myCollection: null,
      memberCollection: null,
      isLoadingMy: false,
      isLoadingMember: false,
      myError: undefined,
      memberError: undefined,

      // GET /api/v1/collection
      loadMyCollection: async () => {
        set({ isLoadingMy: true, myError: undefined });
        const res = await apiFetchMyCollection();

        if (res.ok && res.data) {
          set({
            myCollection: res.data,
            isLoadingMy: false,
          });
        } else {
          set({
            isLoadingMy: false,
            myError: res.error,
          });
        }
      },

      // GET /api/v1/collection/members
      loadMemberCollection: async (params) => {
        set({ isLoadingMember: true, memberError: undefined });
        const res = await apiFetchMemberCollection(params);

        if (res.ok && res.data) {
          set({
            memberCollection: res.data,
            isLoadingMember: false,
          });
        } else {
          set({
            isLoadingMember: false,
            memberError: res.error,
          });
        }
      },

      clearMemberCollection: () => {
        set({
          memberCollection: null,
          memberError: undefined,
        });
      },
    }),
    { name: "collection-store" }
  )
);
