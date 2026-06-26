const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let newContent = content
        .replace(/\[#C96A2A\]/gi, 'orange-500')
        .replace(/\[#B05A20\]/gi, 'orange-600')
        .replace(/\[#DEB39C\]/gi, 'orange-400')
        .replace(/\[#FAF0E6\]/gi, 'orange-50')
        .replace(/\[#F3E2D5\]/gi, 'orange-200'); // F3E2D5 is slightly darker than FAF0E6
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir('./src');
