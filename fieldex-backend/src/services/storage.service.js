const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const BUCKET = 'visit-photos';

async function upload(file, visitId) {
  const ext = path.extname(file.originalname) || '.jpg';
  const name = `${visitId}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(name, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (error) {
    console.error('Supabase storage error:', JSON.stringify(error, null, 2));
    throw new Error(`Storage upload failed: ${error.message} (status: ${error.statusCode})`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(name);
  return data.publicUrl;
}

async function remove(publicUrl) {
  const url = new URL(publicUrl);
  // Path is like /storage/v1/object/public/BUCKET/...key
  const parts = url.pathname.split(`/object/public/${BUCKET}/`);
  if (parts.length < 2) return;
  const key = parts[1];
  await supabase.storage.from(BUCKET).remove([key]);
}

module.exports = { upload, remove };
