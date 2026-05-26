const fs = require('fs');
const path = require('path');

function findAlerts(dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== '.expo') {
                results = results.concat(findAlerts(fullPath));
            }
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('Alert.alert')) {
                results.push(fullPath);
            }
        }
    }
    return results;
}

const mobileDir = path.join(__dirname);
const files = findAlerts(mobileDir);

console.log(`Found ${files.length} files with Alert.alert`);
files.forEach(f => console.log(f.replace(mobileDir, '')));
