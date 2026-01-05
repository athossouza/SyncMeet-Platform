const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// --- Configuration ---
const MOODLE_SQL_PATH = path.join(__dirname, '../u242475129_VhCW8.sql');
const TARGET_COURSE_ID = 4;
const TARGET_ORG_NAME = 'HERCULES';

const MODULE_TYPE_ID_PAGE = 16;
const MODULE_TYPE_ID_URL = 22;

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const MONTH_MAP = {
    'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04', 'maio': '05', 'junho': '06',
    'julho': '07', 'agosto': '08', 'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
};

function parseDateFromSectionName(name) {
    if (!name) return null;
    const regex = /Sessão (?:.*?)(\d{1,2}) de ([a-zç]+) de (\d{4})/i;
    const match = name.match(regex);
    if (match) {
        const day = match[1].padStart(2, '0');
        const monthName = match[2].toLowerCase();
        const year = match[3];
        const month = MONTH_MAP[monthName];
        if (month) {
            return `${year}-${month}-${day}`; // YYYY-MM-DD
        }
    }
    return null;
}

function parseRow(rowStr) {
    if (rowStr.startsWith('(')) rowStr = rowStr.substring(1);
    if (rowStr.endsWith(')')) rowStr = rowStr.substring(0, rowStr.length - 1);

    const columns = [];
    let currentVal = '';
    let inQuote = false;

    for (let i = 0; i < rowStr.length; i++) {
        const char = rowStr[i];

        if (char === "'" && (i === 0 || rowStr[i - 1] !== '\\')) {
            inQuote = !inQuote;
            continue;
        }

        if (char === ',' && !inQuote) {
            columns.push(cleanValue(currentVal));
            currentVal = '';
        } else {
            currentVal += char;
        }
    }
    columns.push(cleanValue(currentVal));
    return columns;
}

function cleanValue(val) {
    val = val.trim();
    if (val === 'NULL') return null;
    return val.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\r/g, '\r').replace(/\\n/g, '\n');
}

function extractTableData(sqlContent, tableName) {
    console.log(`Extracting data from ${tableName}...`);
    // Improved Regex: Match until ");\n" or ");" at end of line/string
    // We use a custom parser approach because regex with big strings and "content;" is tricky

    // 1. Find all start indices of "INSERT INTO `tableName`"
    const blocks = [];
    const searchStr = `INSERT INTO \`${tableName}\``;
    let startIndex = 0;

    while ((startIndex = sqlContent.indexOf(searchStr, startIndex)) !== -1) {
        // Find the "VALUES" part
        const valuesIndex = sqlContent.indexOf('VALUES', startIndex);
        if (valuesIndex === -1) break;

        // Find the End: Look for ");\n" or ");\r\n" or End of File
        // But simply searching for ");" is safer than regex greedy issues
        let endIndex = sqlContent.indexOf(');\n', valuesIndex);
        if (endIndex === -1) endIndex = sqlContent.indexOf(');\r\n', valuesIndex);
        if (endIndex === -1) endIndex = sqlContent.length; // Fallback

        // Extract the VALUES content: " (row1), (row2), ..."
        // Start after "VALUES" (len 6) + whitespace
        let blockContent = sqlContent.substring(valuesIndex + 6, endIndex + 1); // include the ')'
        blockContent = blockContent.trim();
        // Remove trailing ';' if captured
        if (blockContent.endsWith(';')) blockContent = blockContent.substring(0, blockContent.length - 1);

        blocks.push(blockContent);
        startIndex = endIndex;
    }

    const rows = [];
    for (const valuesBlock of blocks) {
        // Split by "), (" handling whitespace
        // We look for ")", optional space/newline, "," optional space/newline, "("
        const rawRows = valuesBlock.split(/\)\s*,\s*\(/);

        for (let i = 0; i < rawRows.length; i++) {
            let rowStr = rawRows[i];
            // Fix leading/trailing parens
            if (i === 0 && rowStr.startsWith('(')) rowStr = rowStr.substring(1);
            if (i === rawRows.length - 1 && rowStr.endsWith(')')) rowStr = rowStr.substring(0, rowStr.length - 1);

            rows.push(parseRow(rowStr));
        }
    }
    console.log(`Debug ${tableName}: Extracted ${rows.length} rows.`);
    return rows;
}

async function migrate() {
    console.log('📖 Reading SQL file...');
    const sqlContent = fs.readFileSync(MOODLE_SQL_PATH, 'utf8');

    const { data: orgs } = await supabase.from('organizations').select('id, name');
    const targetOrg = orgs.find(o => o.name === TARGET_ORG_NAME);

    if (!targetOrg) {
        console.error(`❌ Organization "${TARGET_ORG_NAME}" not found!`);
        return;
    }
    console.log(`✅ Found Org: ${targetOrg.name} (${targetOrg.id})`);

    const sectionsRaw = extractTableData(sqlContent, 'o6tq_course_sections');
    const sections = sectionsRaw.map(r => ({
        id: r[0],
        course: r[1],
        name: r[3],
        sequence: r[6]
    })).filter(s => s.course == TARGET_COURSE_ID);

    const cmsRaw = extractTableData(sqlContent, 'o6tq_course_modules');
    const cms = cmsRaw.map(r => ({
        id: r[0],
        course: r[1],
        module: r[2],
        instance: r[3]
    })).filter(cm => cm.course == TARGET_COURSE_ID);

    const urlsRaw = extractTableData(sqlContent, 'o6tq_url');
    const urls = urlsRaw.map(r => ({
        id: r[0],
        course: r[1],
        externalurl: r[5]
    })).filter(u => u.course == TARGET_COURSE_ID);

    const pagesRaw = extractTableData(sqlContent, 'o6tq_page');
    const pages = pagesRaw.map(r => ({
        id: r[0],
        course: r[1],
        content: r[3] && r[3].length > r[5]?.length ? r[3] : r[5]
    })).filter(p => p.course == TARGET_COURSE_ID);

    console.log(`📊 Found: ${sections.length} Sections, ${cms.length} Modules, ${urls.length} URLs, ${pages.length} Pages`);

    for (const section of sections) {
        const date = parseDateFromSectionName(section.name);
        if (!date) {
            console.log(`⚠️ Skipping Section: "${section.name}" (No date found)`);
            continue;
        }

        // Debug: Only process May 27 for now to verify quickly
        // if (date !== '2025-05-27') continue; 
        // Actually, let's process ALL because the loop restart is annoying.
        // But to prioritize, I sort the array? No, Moodle structure is fixed.
        // I will just let it run for all. I shouldn't have stopped it.
        // Reverting thought: I'll just run it. Parallelism is too complex for this script right now.
        // I'll just restart and wait.


        console.log(`\n📅 Processing Session: ${section.name} (${date})`);

        let youtubeId = null;
        let summaryHtml = '';

        const moduleIds = section.sequence ? section.sequence.split(',') : [];

        for (const cmId of moduleIds) {
            const cm = cms.find(c => c.id == cmId);
            if (!cm) continue;

            if (cm.module == MODULE_TYPE_ID_URL) {
                const urlObj = urls.find(u => u.id == cm.instance);
                if (urlObj) {
                    const ytMatch = urlObj.externalurl.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
                    if (ytMatch) {
                        youtubeId = ytMatch[1];
                        console.log(`   📹 Found YouTube (URL Module): ${youtubeId}`);
                    }
                }
            } else if (cm.module == MODULE_TYPE_ID_PAGE) {
                const pageObj = pages.find(p => p.id == cm.instance);
                if (pageObj) {
                    summaryHtml += pageObj.content + '<br/><hr/><br/>';
                    console.log(`   📝 Found Summary (${pageObj.content.length} chars)`);

                    if (!youtubeId) {
                        const embedMatch = pageObj.content.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
                        if (embedMatch) {
                            youtubeId = embedMatch[1];
                            console.log(`   📹 Found YouTube (Embedded): ${youtubeId}`);
                        }
                    }
                }
            }
        }

        const rangeStart = `${date}T00:00:00`;
        const rangeEnd = `${date}T23:59:59`;

        const { data: existingSessions, error: matchError } = await supabase
            .from('sessions')
            .select('id, title, date, summary_html, summary_text') // Selecting fields to populate pre-values
            .eq('organization_id', targetOrg.id)
            .gte('date', rangeStart)
            .lte('date', rangeEnd);

        if (matchError) console.error(`   ❌ Match Query Error:`, matchError);

        let existing = existingSessions && existingSessions.length > 0 ? existingSessions[0] : null;

        if (existing) {
            console.log(`   🔄 Updating Existing Session ${existing.id} (${existing.date})...`);

            // 1. Basic Pre-Cleaning
            let cleanHtml = summaryHtml;
            cleanHtml = cleanHtml.replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, '');
            cleanHtml = cleanHtml.replace(/<p>\s*<a href="[^"]*youtu[^"]*"[^>]*>.*?<\/a>\s*<\/p>/gi, '');

            // Declare variables for AI results
            let finalHtml = existing.summary_html;
            let summaryText = existing.summary_text;
            let textForAiPrompt = cleanHtml;
            const shouldRunAi = true;

            if (shouldRunAi && textForAiPrompt.length > 50) {
                console.log(`   🧠 Remastering Content with AI...`);
                try {
                    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                        },
                        body: JSON.stringify({
                            model: "gpt-4o-mini",
                            messages: [
                                {
                                    role: "system",
                                    content: `Você é um editor de conteúdo especialista. Sua tarefa é limpar e formatar notas de reunião vindas de um sistema legado (Moodle/Outlook).
REGRAS:
1. Analise o HTML/Texto fornecido.
2. Remova todo o 'lixo' técnico (tags vazias, divs aninhadas, atributos de estilo, metadados).
3. Reescreva o conteúdo usando HTML SEMÂNTICO LIMPO:
   - Use <h3> para cabeçalhos (ex: "Next steps", "Tópicos abordados").
   - Use <ul>/<li> para listas.
   - Use <p> para parágrafos.
   - Mantenha TODOS os links importantes (<a href>).
4. O texto deve ser profissional e legível. Corrija espaçamentos.
5. Crie um resumo curto (max 24 palavras) do conteúdo.
6. Retorne APENAS um JSON válido.

Formato JSON esperado:
{
  "remastered_html": "<div style='color: #1f2937 !important;'>...seu html limpo aqui...</div>",
  "summary_text": "Resumo aqui..."
}
IMPORTANTE: Envolva todo o HTML retornado em uma div raiz com style='color: #1f2937 !important;' para garantir legibilidade.`
                                },
                                {
                                    role: "user",
                                    content: textForAiPrompt.substring(0, 15000)
                                }
                            ],
                            temperature: 0.3,
                            response_format: { type: "json_object" }
                        })
                    });

                    if (aiResponse.ok) {
                        const aiData = await aiResponse.json();
                        const content = JSON.parse(aiData.choices[0].message.content);
                        finalHtml = content.remastered_html;
                        summaryText = content.summary_text;
                        console.log(`   ✨ AI Remaster Complete.`);
                        console.log(`   📝 Summary: "${summaryText}"`);
                    }
                } catch (err) {
                    console.error('   ⚠️ Failed to remaster content:', err.message);
                }
            } else {
                // Fallback cleaning if AI skipped
                cleanHtml = cleanHtml.replace(/<div[^>]*class="title"[^>]*>\s*<strong>(.*?)<\/strong>\s*<\/div>/gi, '<h3>$1</h3>');
                const tagsToStrip = ['div', 'p', 'span', 'strong', 'em', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr'];
                tagsToStrip.forEach(tag => {
                    const regex = new RegExp(`<${tag}\\s+[^>]*>`, 'gi');
                    cleanHtml = cleanHtml.replace(regex, `<${tag}>`);
                });
                cleanHtml = cleanHtml.replace(/<div>\s*&nbsp;\s*<\/div>/gi, '');
                cleanHtml = cleanHtml.replace(/<p>\s*&nbsp;\s*<\/p>/gi, '');
            }

            const updatePayload = {
                summary_html: finalHtml || cleanHtml, // Fallback to basic clean if AI failed
                summary_text: summaryText || existing.summary_text
            };
            if (youtubeId) {
                updatePayload.youtube_video_id = youtubeId;
                updatePayload.video_embed_url = `https://www.youtube.com/embed/${youtubeId}`;
            }

            const { error: updateError } = await supabase.from('sessions').update(updatePayload).eq('id', existing.id);
            if (updateError) console.error(`   ❌ Update Failed:`, updateError);
            else console.log(`   ✅ Video/Summary/Text Updated.`);

        } else {
            console.log(`   ➕ Creating New Session (No Match Found)...`);

            // 1. Advanced HTML Cleaning & Formatting
            let cleanHtml = summaryHtml;
            cleanHtml = cleanHtml.replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, '');
            cleanHtml = cleanHtml.replace(/<p>\s*<a href="[^"]*youtu[^"]*"[^>]*>.*?<\/a>\s*<\/p>/gi, '');
            cleanHtml = cleanHtml.replace(/<div[^>]*class="title"[^>]*>\s*<strong>(.*?)<\/strong>\s*<\/div>/gi, '<h3>$1</h3>');

            let finalHtml = null;
            let summaryText = null;

            // NEW Creation AI Logic
            if (cleanHtml.length > 50) {
                console.log(`   🧠 Remastering Content with AI (New Session)...`);
                try {
                    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                        },
                        body: JSON.stringify({
                            model: "gpt-4o-mini",
                            messages: [
                                {
                                    role: "system",
                                    content: `Você é um editor de conteúdo especialista. Sua tarefa é limpar e formatar notas de reunião vindas de um sistema legado (Moodle/Outlook).
REGRAS:
1. Analise o HTML/Texto fornecido.
2. Remova todo o 'lixo' técnico (tags vazias, divs aninhadas, atributos de estilo, metadados).
3. Reescreva o conteúdo usando HTML SEMÂNTICO LIMPO:
   - Use <h3> para cabeçalhos (ex: "Next steps", "Tópicos abordados").
   - Use <ul>/<li> para listas.
   - Use <p> para parágrafos.
   - Mantenha TODOS os links importantes (<a href>).
4. O texto deve ser profissional e legível. Corrija espaçamentos.
5. Crie um resumo curto (max 24 palavras) do conteúdo.
6. Retorne APENAS um JSON válido.

Formato JSON esperado:
{
  "remastered_html": "<div style='color: #1f2937 !important;'>...seu html limpo aqui...</div>",
  "summary_text": "Resumo aqui..."
}
IMPORTANTE: Envolva todo o HTML retornado em uma div raiz com style='color: #1f2937 !important;' para garantir legibilidade.`
                                },
                                {
                                    role: "user",
                                    content: cleanHtml.substring(0, 15000)
                                }
                            ],
                            temperature: 0.3,
                            response_format: { type: "json_object" }
                        })
                    });

                    if (aiResponse.ok) {
                        const aiData = await aiResponse.json();
                        const content = JSON.parse(aiData.choices[0].message.content);
                        finalHtml = content.remastered_html;
                        summaryText = content.summary_text;
                    }
                } catch (err) {
                    console.error('   ⚠️ Failed to remaster content:', err.message);
                }
            }

            const sessionData = {
                organization_id: targetOrg.id,
                title: section.name,
                date: date,
                ...(youtubeId && {
                    youtube_video_id: youtubeId,
                    video_embed_url: `https://www.youtube.com/embed/${youtubeId}`
                }),
                summary_html: finalHtml || cleanHtml || null,
                summary_text: summaryText || null,
                duration_seconds: 3600
            };

            const { error: insertError } = await supabase.from('sessions').insert(sessionData);
            if (insertError) console.error(`   ❌ Insert Failed:`, insertError);
            else console.log(`   ✅ Session Inserted.`);
        }
    }
}

migrate();
