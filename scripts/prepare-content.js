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

  // NOTE: this used to copy the root README.md over src/content/README.md.
  // That made sense before the repo was flattened, when the root README also
  // served as the app's Introduction page. It does not any more: the two files
  // have different jobs (repo README vs. the `/` Introduction), and the copy
  // silently replaced the Introduction with the repo README in every CI build —
  // so the deployed `/` page was the repo README, project structure and all.
  // Do not reinstate it. src/content/README.md is the Introduction; edit it directly.

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
