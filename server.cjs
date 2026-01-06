const express = require('express');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve Static Files (Vite Build)
app.use(express.static(path.join(__dirname, 'dist')));

// API: Sync Trigger
app.post('/api/sync', async (req, res) => {
    console.log('API: Sync requested');

    try {
        await new Promise((resolve, reject) => {
            const syncProcess = spawn('node', ['scripts/sync-calendar.cjs'], {
                cwd: __dirname,
                stdio: 'inherit'
            });

            syncProcess.on('close', (code) => {
                if (code === 0) {
                    console.log('Sync finished successfully');
                    resolve();
                } else {
                    console.error(`Sync exited with code ${code}`);
                    reject(new Error(`Exit code ${code}`));
                }
            });

            syncProcess.on('error', (err) => {
                reject(err);
            });
        });

        res.json({ message: 'Sync completed successfully' });
    } catch (error) {
        console.error('Sync failed:', error);
        res.status(500).json({ error: 'Sync failed', details: error.message });
    }
});

// API: Trigger AI Summary (Called by Admin Frontend after Create/Update)
app.post('/api/ai-summary', async (req, res) => {
    console.log('API: AI Summary requested');
    try {
        await new Promise((resolve, reject) => {
            const process = spawn('node', ['scripts/generate-summary.cjs'], {
                cwd: __dirname,
                stdio: 'inherit'
            });
            process.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Exit code ${code}`));
            });
        });
        res.json({ message: 'AI Summary process finished' });
    } catch (error) {
        console.error('AI Summary failed:', error);
        res.status(500).json({ error: 'Failed', details: error.message });
    }
});

// SPA Catch-all -> index.html
// Express 5 requires specific wildcard handling or regex. 
// Using regex /.*/ to match everything as fallback.
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
