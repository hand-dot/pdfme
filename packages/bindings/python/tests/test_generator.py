import unittest
from pdfme import PDFGenerator
import os

class TestPDFGenerator(unittest.TestCase):
    def setUp(self):
        self.generator = PDFGenerator()
        self.template = {
            "basePdf": "",  # Empty base PDF for testing
            "schemas": [
                {
                    "text": {
                        "type": "text",
                        "position": {"x": 0, "y": 0},
                        "width": 100,
                        "height": 20
                    }
                }
            ]
        }
        self.inputs = [{"text": "Test PDF"}]
        
    def test_generate_pdf(self):
        pdf_data = self.generator.generate_pdf(self.template, self.inputs)
        self.assertIsInstance(pdf_data, bytes)
        self.assertTrue(len(pdf_data) > 0)
        
    def test_generate_pdf_to_file(self):
        output_path = "test_output.pdf"
        self.generator.generate_pdf_to_file(self.template, self.inputs, output_path)
        self.assertTrue(os.path.exists(output_path))
        self.assertTrue(os.path.getsize(output_path) > 0)
        os.remove(output_path)

if __name__ == '__main__':
    unittest.main()
