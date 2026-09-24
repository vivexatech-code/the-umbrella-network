import "server-only";

import { supabaseConfigured } from "@/lib/db/supabase";
import { MissingSupabaseSchemaError } from "@/lib/db/supabase-store";
import type { Store } from "@/lib/db/types";

let singleton: Promise<Store> | null = null;
let warned = false;
let schemaWarned = false;

async function fileStore() {
  const { FileStore } = await import("@/lib/db/file-store");
  const store = new FileStore();
  await store.ready();
  return store;
}

export function databaseMode(): "supabase" | "file" {
  return supabaseConfigured() ? "supabase" : "file";
}

export function getStore(): Promise<Store> {
  if (!singleton) {
    const pending = (async () => {
      if (!supabaseConfigured()) {
        if ((process.env.NETLIFY === "true" || process.env.AWS_LAMBDA_FUNCTION_NAME) && !warned) {
          warned = true;
          console.warn("Supabase is not configured. Registrations will not persist on Netlify.");
        }
        return fileStore();
      }
      try {
        const { SupabaseStore } = await import("@/lib/db/supabase-store");
        const store = new SupabaseStore();
        await store.ready();
        return store;
      } catch (error) {
        singleton = null;
        if (error instanceof MissingSupabaseSchemaError) {
          if (!schemaWarned) {
            schemaWarned = true;
            console.error(error.message);
          }
          return fileStore();
        }
        throw error;
      }
    })();
    singleton = pending;
  }
  return singleton;
}
