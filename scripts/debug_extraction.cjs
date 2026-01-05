const fs = require('fs');
const path = require('path');

const MOODLE_SQL_PATH = path.join(__dirname, '../u242475129_VhCW8.sql');

function extractTableDataDebug(sqlContent, tableName) {
    console.log(`Extracting data from ${tableName}...`);
    const regex = new RegExp(`INSERT INTO \`${tableName}\` .*? VALUES\\s*([\\s\\S]*?);`, 'g');

    let match;
    while ((match = regex.exec(sqlContent)) !== null) {
        let valuesBlock = match[1];
        console.log(`Found INSERT block for ${tableName} (Length: ${valuesBlock.length})`);
        console.log(`First 100 chars: ${valuesBlock.substring(0, 100)}`);

        // Try manual split on first few rows
        const rows = valuesBlock.split(/\),\s*\(/);
        console.log(`Approx rows count: ${rows.length}`);
        if (rows.length > 0) {
            console.log(`Sample Row 1: ${rows[0]}`);
        }
    }
}

const sqlContent = fs.readFileSync(MOODLE_SQL_PATH, 'utf8');
extractTableDataDebug(sqlContent, 'o6tq_url');
extractTableDataDebug(sqlContent, 'o6tq_page');
