import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS for cron operations
// Note: VITE_ prefix is not available in serverless functions, use SUPABASE_URL
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Allow GET (for Vercel cron) or POST (for manual trigger)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const now = new Date().toISOString();

    // Find all scheduled posts whose publish time has passed
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, title, scheduled_at')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now);

    if (fetchError) {
      console.error('Error fetching scheduled posts:', fetchError);
      return res.status(500).json({ error: fetchError.message });
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return res.status(200).json({ published: 0, message: 'No scheduled posts to publish' });
    }

    const ids = scheduledPosts.map(p => p.id);

    // Update all due posts to published
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ status: 'published' })
      .in('id', ids);

    if (updateError) {
      console.error('Error publishing posts:', updateError);
      return res.status(500).json({ error: updateError.message });
    }

    console.log(`Published ${scheduledPosts.length} scheduled posts:`, scheduledPosts.map(p => p.title));

    return res.status(200).json({
      published: scheduledPosts.length,
      posts: scheduledPosts.map(p => ({ id: p.id, title: p.title })),
    });
  } catch (err) {
    console.error('Cron job error:', err);
    return res.status(500).json({ error: err.message });
  }
}
