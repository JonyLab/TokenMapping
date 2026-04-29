require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 55872;

app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
  });
});

app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(`\nToken Mapping running at http://localhost:${PORT}`);
  if (!process.env.SUPABASE_URL) {
    console.log('⚠️  Supabase not configured. Copy .env.example to .env and add credentials.\n');
  }
});
