const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.warn('Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Admin log endpoint will fail without service role.');
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  global: { headers: { 'Content-Type': 'application/json' } }
});

// POST /api/admins/log
// body: { admin_id, action, target_table, target_id, session_id, status }
router.post('/log', async (req, res) => {
  try {
    const payload = req.body || {};
    const { admin_id, action, target_table, target_id, session_id, status } = payload;

    if (!admin_id || !action || !target_table) {
      return res.status(400).json({ success: false, error: 'Missing required fields: admin_id, action, target_table' });
    }

    const { data, error } = await supabase
      .from('admin_activity_log')
      .insert({
        admin_id,
        action,
        target_table,
        target_id: target_id || null,
        session_id: session_id || null,
        status: status || 'SUCCESS'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, log: data });
  } catch (error) {
    console.error('Error in /api/admins/log:', error);
    res.status(500).json({ success: false, error: error.message || error });
  }
});

module.exports = router;
