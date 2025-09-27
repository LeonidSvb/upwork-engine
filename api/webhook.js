export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    const headers = req.headers;
    const timestamp = new Date().toISOString();

    console.log('='.repeat(80));
    console.log('WEBHOOK RECEIVED AT:', timestamp);
    console.log('='.repeat(80));
    console.log('HEADERS:', JSON.stringify(headers, null, 2));
    console.log('-'.repeat(80));
    console.log('PAYLOAD:', JSON.stringify(payload, null, 2));
    console.log('='.repeat(80));

    return res.status(200).json({
      success: true,
      message: 'Data received and logged',
      timestamp: timestamp
    });

  } catch (error) {
    console.error('ERROR:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}