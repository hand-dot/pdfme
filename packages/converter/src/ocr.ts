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
  
  const schema = {
    name: 'OCR Text',
    type: 'text',
    content: text,
    position: { x: 0, y: 0 },
    width: 500,
    height: 700,
    rotate: 0,
    opacity: 1,
    readOnly: false,
    required: false,
    fontSize: 12,
    lineHeight: 1.2,
    characterSpacing: 0,
    alignment: 'left',
    verticalAlignment: 'top',
    fontColor: '#000000',
    backgroundColor: '#ffffff',
    fontName: 'Helvetica'
  } as const;
  
  return {
    basePdf: '',
    schemas: [[schema]]
  };
}
