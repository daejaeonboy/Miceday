import fs from 'fs';
import path from 'path';

const dir = 'c:/Users/USER/Desktop/humanrental';
const targets = ['components', 'pages'];

const replacements = [
  { from: /#1e3a8a/gi, to: '#001e45' },
  { from: /#173f7d/gi, to: '#001e45' },
  { from: /#1e40af/gi, to: '#001e45' } // also old brand-800
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

targets.forEach(t => {
  const files = walk(path.join(dir, t));
  files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let changed = false;
    replacements.forEach(r => {
      if (r.from.test(content)) {
        content = content.replace(r.from, r.to);
        changed = true;
      }
    });
    if (changed) {
      fs.writeFileSync(f, content, 'utf8');
      console.log(`Updated ${f}`);
    }
  });
});
console.log("Done");
