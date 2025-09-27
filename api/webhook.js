import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;

    console.log('Webhook received:', JSON.stringify(payload, null, 2));

    const sourceJobId = payload.jobId || payload.id || payload.job_id || `job_${Date.now()}`;
    const sourceUrl = payload.url || payload.link || payload.job_url || null;

    const { data, error } = await supabase
      .from('jobs')
      .insert({
        source_job_id: sourceJobId,
        source_url: sourceUrl,
        raw: payload,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        console.log('Duplicate job ignored:', sourceJobId);
        return res.status(200).json({
          success: true,
          message: 'Job already exists',
          jobId: sourceJobId
        });
      }

      throw error;
    }

    console.log('Job saved:', data.id);

    return res.status(200).json({
      success: true,
      jobId: data.id,
      sourceJobId: sourceJobId
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}