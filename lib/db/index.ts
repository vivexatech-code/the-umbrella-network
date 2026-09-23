import "server-only";

import { supabaseConfigured } from "@/lib/db/supabase";
import type { Store } from "@/lib/db/types";

let singleton: Promise<Store> | null = null;
let warned = false;

export function databaseMode(): "supabase" | "file" {
  return supabaseConfigured() ? "supabase" : "file";
}

export function getStore(): Promise<Store> {
  if (!singleton) {
    singleton = (async () => {
      if (!supabaseConfigured()) {
        if ((process.env.NETLIFY === "true" || process.env.AWS_LAMBDA_FUNCTION_NAME) && !warned) {
          warned = true;
          console.warn("Supabase is not configured. Registrations will not persist on Netlify.");
        }
        const { FileStore } = await import("@/lib/db/file-store");
        const store = new FileStore();
        await store.ready();
        return store;
      }
      const { SupabaseStore } = await import("@/lib/db/supabase-store");
      const store = new SupabaseStore();
      await store.ready();
      return store;
    })();
  }
  return singleton;
}
