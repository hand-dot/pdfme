import { Template } from '@pdfme/common';
import { generate } from '@pdfme/generator';

async function main() {
  const args = process.argv.slice(2);
  const templateIndex = args.indexOf('--template');
  const inputsIndex = args.indexOf('--inputs');

  if (templateIndex === -1 || inputsIndex === -1) {
    console.error('Missing required arguments: --template and --inputs');
    process.exit(1);
  }

  try {
    const template: Template = JSON.parse(args[templateIndex + 1]);
    const inputs: Record<string, string>[] = JSON.parse(args[inputsIndex + 1]);
    
    const pdf = await generate({ template, inputs });
    process.stdout.write(Buffer.from(pdf));
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
