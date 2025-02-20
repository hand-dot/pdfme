import { createWorker } from 'tesseract.js';
import { Template } from '@pdfme/common';
import type { TextSchema } from '@pdfme/schemas/dist/types/src/text/types';

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
  
  const textSchema: TextSchema = {
    type: 'text',
    position: { x: 0, y: 0 },
    width: 500,
    height: 700,
    fontSize: 12,
    lineHeight: 1.2,
    characterSpacing: 0,
    alignment: 'left',
    verticalAlignment: 'top',
    fontColor: '#000000',
    backgroundColor: '#ffffff'
  };
  
  // Create a basic template with the extracted text
  return {
    basePdf: '',
    schemas: [
      {
        name: 'OCR Text',
        type: 'text',
        position: textSchema.position,
        width: textSchema.width,
        height: textSchema.height,
        fontSize: textSchema.fontSize,
        lineHeight: textSchema.lineHeight,
        characterSpacing: textSchema.characterSpacing,
        alignment: textSchema.alignment,
        verticalAlignment: textSchema.verticalAlignment,
        fontColor: textSchema.fontColor,
        backgroundColor: textSchema.backgroundColor,
        content: text
      }
    ]
  };
}
