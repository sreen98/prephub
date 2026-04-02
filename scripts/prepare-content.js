import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../');
const webContentDir = path.resolve(rootDir, 'src/content');

const dirsToCopy = [
  'Back End',
  'Front End',
  'Javascript and Typescript',
  'System Design'
];

async function prepareContent() {
  await fs.ensureDir(webContentDir);
  
  // Copy README.md
  await fs.copy(path.join(rootDir, 'README.md'), path.join(webContentDir, 'README.md'));

  for (const dir of dirsToCopy) {
    const source = path.join(rootDir, dir);
    const dest = path.join(webContentDir, dir.toLowerCase().replace(/ /g, '-'));
    
    if (fs.existsSync(source)) {
      await fs.copy(source, dest, {
        filter: (src) => {
          return fs.lstatSync(src).isDirectory() || src.endsWith('.md');
        }
      });
      console.log(`Copied ${dir} to ${dest}`);
    }
  }
}

prepareContent().catch(console.error);
