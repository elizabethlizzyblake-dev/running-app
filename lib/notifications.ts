import type { SupabaseClient } from '@supabase/supabase-js'

export async function writeNotification(
  supabase: SupabaseClient,
  userId: string,
  type: string,
  message: string,
  data: Record<string, unknown> = {}
): Promise<void> {
  await supabase.from('notifications').insert({ user_id: userId, type, message, data, read: false })
}
