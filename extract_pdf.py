import PyPDF2
import json

def extract_text(pdf_path):
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ''
        for i in range(len(reader.pages)):
            text += reader.pages[i].extract_text() + '\n'
        return text

if __name__ == '__main__':
    text = extract_text('RUBRIK WAWANCARA FASILITATOR ETOS ID.pdf')
    print(text)
