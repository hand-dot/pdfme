from typing import Dict, List, Any
import json
import subprocess
import os

class PDFGenerator:
    def __init__(self):
        self.node_path = os.path.join(os.path.dirname(__file__), "../dist/index.js")
    
    def generate_pdf(self, template: Dict[str, Any], inputs: List[Dict[str, Any]]) -> bytes:
        """
        Generate PDF using PDFme
        
        Args:
            template: PDFme template dictionary
            inputs: List of input data dictionaries
            
        Returns:
            PDF file contents as bytes
        """
        cmd = ["node", self.node_path, "--template", json.dumps(template), "--inputs", json.dumps(inputs)]
        result = subprocess.run(cmd, capture_output=True, check=True)
        return result.stdout

    def generate_pdf_to_file(self, template: Dict[str, Any], inputs: List[Dict[str, Any]], output_path: str):
        """
        Generate PDF and save to file
        
        Args:
            template: PDFme template dictionary
            inputs: List of input data dictionaries
            output_path: Path to save the PDF file
        """
        pdf_data = self.generate_pdf(template, inputs)
        with open(output_path, "wb") as f:
            f.write(pdf_data)
