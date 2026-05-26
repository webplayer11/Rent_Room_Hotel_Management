const fs = require('fs');
const path = require('path');

const targetDirs = ['app', 'src'];
const modalComponentPath = 'src/shared/components/GlobalConfirmModal';

function getRelativePath(fromPath, toPath) {
  const fromDir = path.dirname(fromPath);
  let rel = path.relative(fromDir, toPath).replace(/\\/g, '/');
  if (!rel.startsWith('.')) {
    rel = './' + rel;
  }
  return rel;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('Alert.alert(')) {
    // Replace Alert.alert with CustomAlert.alert
    content = content.replace(/Alert\.alert\(/g, 'CustomAlert.alert(');
    
    // Check if we need to add the import
    if (!content.includes('CustomAlert')) {
      const absModalPath = path.resolve(__dirname, modalComponentPath);
      const relPath = getRelativePath(filePath, absModalPath);
      
      const importStatement = `import { CustomAlert } from '${relPath}';\n`;
      
      // Inject import after the last import statement or at the top
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const endOfLastImport = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, endOfLastImport + 1) + importStatement + content.slice(endOfLastImport + 1);
      } else {
        content = importStatement + content;
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

targetDirs.forEach(dir => walk(path.join(__dirname, dir)));
console.log('Done replacing Alert.alert with CustomAlert.alert');
