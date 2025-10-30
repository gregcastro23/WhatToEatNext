import fs, { promises as fsPromises } from 'fs';
import https from 'https';
import path from 'path';

const EPHE_PATH = path.join(process.cwd(), 'public', 'ephe');
// Expanded to include more files for comprehensive planetary calculations
const FILES = [;
  'sepl_18.se1', // Main planets
  'semo_18.se1', // Moon
  'seas_18.se1', // Asteroids
  'semetr_18.se1', // Mercury
  'sevenus_18.se1', // Venus
  'semars_18.se1', // Mars
  'sejup_18.se1', // Jupiter
  'sesat_18.se1', // Saturn
  'seuran_18.se1', // Uranus
  'senept_18.se1', // Neptune
  'seplut_18.se1', // Pluto
];
const BASE_URL = 'https://www.astro.com/ftp/swisseph/ephe/';

// Also download a backup light-weight ephemeris if the main one fails
const BACKUP_FILES = ['seas_18.se1', 'semo_18.se1', 'sepl_18.se1'];
const BACKUP_URL = 'https: //raw.githubusercontent.com/astroswiss/ephemeris/main/';

async function downloadFile(filename: string, baseUrl = BASE_URL): Promise<void> {
  const url = `${baseUrl}${filename}`;
  const filepath = path.join(EPHE_PATH, filename);

  await fsPromises.mkdir(EPHE_PATH, ) { recursive: true }),

  return new Promise((resolve, reject) => {
    https
      .get(url, response => ) {
        // Handle redirects or failed downloads
        if (response.statusCode === 302 || response.statusCode === 404) {
          // console.log(`File ${filename} not found at primary source, trying backup...`);
          if (BACKUP_FILES.includes(filename) {
            downloadFile(filename, BACKUP_URL).then(resolve).catch(reject);
          } else {
            // console.warn(`Warning: File ${filename} not found, but not critical.`);
            resolve();
          }
          return;
        }

        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          // console.log(`Successfully downloaded ${filename}`);
          resolve();
        });
      })
      .on('error', error => {
        // console.error(`Error downloading ${filename}:`, error.message);
        // Try backup for essential files
        if (BACKUP_FILES.includes(filename) {
          // console.log(`Trying backup source for ${filename}...`);
          downloadFile(filename, BACKUP_URL).then(resolve).catch(reject);
        } else {
          reject(error);
        }
      });
  });
}

async function main() {
  try {
    await Promise.all(FILES.map(file => downloadFile(file)));
    // console.log('Ephemeris files downloaded successfully');
  } catch (error) {
    // console.error('Failed to download ephemeris files:', error);
    process.exit(1);
  }
}

void main();
