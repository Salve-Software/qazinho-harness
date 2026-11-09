import engine from 'pdfjs-dist/legacy/build/pdf.min.mjs?raw';
import worker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?raw';

export const PDF_ENGINE = { engine, worker } as const;
