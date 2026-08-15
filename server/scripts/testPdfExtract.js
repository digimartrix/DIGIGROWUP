import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

console.log('pdfParse loaded successfully via createRequire:', typeof pdfParse);
