const fs = require('fs');
const content = fs.readFileSync('debug_html.txt', 'utf8');

// The regex we want to test:
const splitRegex = /<p class="title"[^>]*>(?:(?!<\/p>)[\s\S])*Transcri(?:ç|&ccedil;)(?:ã|&atilde;)o[\s\S]*?<\/p>/i;

const match = content.match(splitRegex);
console.log('Match found:', !!match);
if (match) {
    console.log('Index:', match.index);
    console.log('Matched string:', match[0]);
    console.log('Notes length:', content.substring(0, match.index).length);
    console.log('Transcript length:', content.substring(match.index).length);
} else {
    console.log('Match FAILED.');
    console.log('Content excerpt around "Transcri":');
    const idx = content.indexOf('Transcri');
    if (idx !== -1) {
        console.log(content.substring(idx - 100, idx + 100));
    } else {
        console.log('"Transcri" not found in content.');
    }
}
