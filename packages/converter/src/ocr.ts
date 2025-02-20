import { createWorker } from 'tesseract.js';
import { Template } from '@pdfme/common';

export interface OCROptions {
  lang?: string;
  imageUrl: string;
}

export async function extractTextFromImage(options: OCROptions): Promise<string> {
  const worker = await createWorker();
  await worker.loadLanguage(options.lang || 'eng');
  await worker.initialize(options.lang || 'eng');
  
  const { data: { text } } = await worker.recognize(options.imageUrl);
  await worker.terminate();
  
  return text;
}

export async function createTemplateFromImage(options: OCROptions): Promise<Template> {
  const text = await extractTextFromImage(options);
  
  // Create a basic template with the extracted text
  return {
    basePdf: '',
    schemas: [
      {
        text: {
          type: 'text',
          position: { x: 0, y: 0 },
          width: 500,
          height: 700,
          value: text
        }
      }
    ]
  };
}
