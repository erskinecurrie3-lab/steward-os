/**
 * StewardOS Supabase Client — RLS with church_id
 *
 * In every API route, call createSupabaseForRequest() to get a client
 * with church_id set for the session. RLS policies then enforce that
 * all queries can only touch rows matching that church_id.
 *
 * Without this, a bug in API code could leak one church's data to another.
 * With RLS, that is physically impossible — the database enforces isolation.
 *
 * Note: Uses Church.id (UUID from DB), not Clerk orgId. Call requireChurch()
 * first to ensure user is authenticated and in an org.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { requireChurch } from "@/lib/auth";
import { getChurchByClerkOrg } from "@/lib/church";

export async function createSupabaseForRequest(): Promise<SupabaseClient> {
  const ctx = await requireChurch();

  const church = await getChurchByClerkOrg(ctx.churchId);
  const churchId = church?.id ?? ""; // RLS policies use Church UUID

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for createSupabaseForRequest. Get it from Supabase Dashboard → Settings → API."
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  );

  // Set church_id for RLS policies in this session
  await supabase.rpc("set_app_church_id", { p_church_id: churchId });

  return supabase;
}
