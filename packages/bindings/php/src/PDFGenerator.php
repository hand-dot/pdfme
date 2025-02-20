<?php

namespace PDFme;

class PDFGenerator
{
    private string $nodePath;

    public function __construct()
    {
        $this->nodePath = dirname(__DIR__) . '/dist/index.js';
    }

    /**
     * Generate PDF using PDFme
     *
     * @param array $template PDFme template array
     * @param array $inputs List of input data arrays
     * @return string PDF file contents
     * @throws \RuntimeException
     */
    public function generatePDF(array $template, array $inputs): string
    {
        $cmd = sprintf(
            'node %s --template %s --inputs %s',
            escapeshellarg($this->nodePath),
            escapeshellarg(json_encode($template)),
            escapeshellarg(json_encode($inputs))
        );

        $output = null;
        $returnCode = null;
        exec($cmd, $output, $returnCode);

        if ($returnCode !== 0) {
            throw new \RuntimeException('Failed to generate PDF');
        }

        return implode('', $output);
    }

    /**
     * Generate PDF and save to file
     *
     * @param array $template PDFme template array
     * @param array $inputs List of input data arrays
     * @param string $outputPath Path to save the PDF file
     * @throws \RuntimeException
     */
    public function generatePDFToFile(array $template, array $inputs, string $outputPath): void
    {
        $pdfData = $this->generatePDF($template, $inputs);
        if (file_put_contents($outputPath, $pdfData) === false) {
            throw new \RuntimeException('Failed to write PDF to file');
        }
    }
}
