const express = require('express');
const cors = require('cors');
const { syncEvents } = require('./scripts/sync-calendar.cjs');

const app = express();
const port = 3000;

app.use(cors());

app.post('/api/sync', async (req, res) => {
    console.log('⚡️ Manual sync triggered via API');
    try {
        await syncEvents();
        res.json({ success: true, message: 'Sync completed successfully' });
    } catch (error) {
        console.error('❌ Sync failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Serve static files from 'dist'
const path = require('path');
app.use(express.static(path.join(__dirname, 'dist')));

// SPA Fallback: Clean URLs return index.html
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`🚀 Sync Server running at http://localhost:${port}`);
});
