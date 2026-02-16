"""
PDF Text Extractor for E-book Analysis
Extracts chapter structure and content from foreclosure e-books
"""

import sys
from pathlib import Path

try:
    import PyPDF2
except ImportError:
    print("PyPDF2 not installed. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "PyPDF2"])
    import PyPDF2

def extract_pdf_text(pdf_path):
    """Extract all text from PDF file"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            total_pages = len(pdf_reader.pages)

            print(f"\nExtracting from: {Path(pdf_path).name}")
            print(f"Total pages: {total_pages}")

            for page_num in range(total_pages):
                page = pdf_reader.pages[page_num]
                text += f"\n--- Page {page_num + 1} ---\n"
                text += page.extract_text()

            return text
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
        return None

def save_extracted_text(pdf_path, output_dir):
    """Extract PDF text and save to text file"""
    text = extract_pdf_text(pdf_path)

    if text:
        # Create output filename
        pdf_name = Path(pdf_path).stem
        output_file = Path(output_dir) / f"{pdf_name}.txt"

        # Save to file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(text)

        print(f"Saved to: {output_file}")
        print(f"Character count: {len(text)}")
        return output_file
    return None

def main():
    # PDF files to extract
    pdf_files = [
        r"C:\Users\monte\Downloads\online-voices-finding-support-through-social-media-during-foreclosure_6928af15.pdf",
        r"C:\Users\monte\Downloads\real-solutions-for-real-estate-overcoming-pre-foreclosure-challenges_69274db2.pdf"
    ]

    # Output directory
    output_dir = Path(__file__).parent / "ebook-content"
    output_dir.mkdir(exist_ok=True)

    print("="*60)
    print("E-book PDF Text Extraction")
    print("="*60)

    extracted_files = []

    for pdf_path in pdf_files:
        if Path(pdf_path).exists():
            output_file = save_extracted_text(pdf_path, output_dir)
            if output_file:
                extracted_files.append(output_file)
        else:
            print(f"\nWarning: File not found - {pdf_path}")

    print("\n" + "="*60)
    print(f"Extraction complete! Files saved to: {output_dir}")
    print("="*60)

    if extracted_files:
        print("\nExtracted files:")
        for f in extracted_files:
            print(f"  - {f.name}")
        print("\nYou can now analyze these text files to create video script templates.")

    return extracted_files

if __name__ == "__main__":
    main()
