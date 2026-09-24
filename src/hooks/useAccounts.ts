import { useState, useCallback } from "react";
import type { AuthAccount } from "@/types";
import { STORAGE_KEY, DEMO_ACCOUNTS } from "@/constants";
import { generateId } from "@/lib/utils";

export function useAccounts() {
  const [accounts, setAccounts] = useState<AuthAccount[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    // Initialize with demo accounts
    const demos = DEMO_ACCOUNTS as AuthAccount[];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demos));
    return demos;
  });

  const save = useCallback((updated: AuthAccount[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setAccounts(updated);
  }, []);

  const addAccount = useCallback(
    (account: Omit<AuthAccount, "id" | "createdAt">) => {
      const newAccount: AuthAccount = {
        ...account,
        id: generateId(),
        createdAt: Date.now(),
      };
      const updated = [...accounts, newAccount];
      save(updated);
      return newAccount;
    },
    [accounts, save]
  );

  const updateAccount = useCallback(
    (id: string, updates: Partial<AuthAccount>) => {
      const updated = accounts.map((a) => (a.id === id ? { ...a, ...updates } : a));
      save(updated);
    },
    [accounts, save]
  );

  const deleteAccount = useCallback(
    (id: string) => {
      const updated = accounts.filter((a) => a.id !== id);
      save(updated);
    },
    [accounts, save]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      const updated = accounts.map((a) =>
        a.id === id ? { ...a, isFavorite: !a.isFavorite } : a
      );
      save(updated);
    },
    [accounts, save]
  );

  const reorderAccounts = useCallback(
    (fromIdx: number, toIdx: number) => {
      const updated = [...accounts];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      save(updated);
    },
    [accounts, save]
  );

  const markUsed = useCallback(
    (id: string) => {
      updateAccount(id, { lastUsed: Date.now() });
    },
    [updateAccount]
  );

  const favorites = accounts.filter((a) => a.isFavorite);
  const recent = [...accounts]
    .filter((a) => a.lastUsed)
    .sort((a, b) => (b.lastUsed ?? 0) - (a.lastUsed ?? 0))
    .slice(0, 3);

  return {
    accounts,
    favorites,
    recent,
    addAccount,
    updateAccount,
    deleteAccount,
    toggleFavorite,
    reorderAccounts,
    markUsed,
  };
}
