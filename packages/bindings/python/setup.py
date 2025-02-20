from setuptools import setup, find_packages

setup(
    name="pdfme",
    version="0.0.1",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "nodejs>=12.0.0"
    ],
    author="PDFme Team",
    author_email="info@pdfme.com",
    description="Python bindings for PDFme - PDF generation library",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://pdfme.com",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.7",
)
