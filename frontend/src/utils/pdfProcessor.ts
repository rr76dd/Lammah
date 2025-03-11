import pdf from 'pdf-parse';
import Tesseract from 'tesseract.js';
import PDFParser from 'pdf2json';

interface ProcessedText {
  text: string;
  isOCR: boolean;
  error?: string;
}

/**
 * Attempts to extract text from a PDF file using multiple methods
 * @param buffer PDF file buffer
 * @returns Processed text with metadata
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<ProcessedText> {
  try {
    // First attempt: Try pdf-parse
    try {
      const data = await pdf(buffer);
      const extractedText = data.text;
      
      // If text is successfully extracted and not empty
      if (extractedText && extractedText.trim().length > 0) {
        return {
          text: cleanArabicText(extractedText),
          isOCR: false
        };
      }
    } catch (error) {
      console.warn('pdf-parse extraction failed, trying alternative methods...', error);
    }

    // Second attempt: Try pdf2json
    try {
      const pdfParser = new PDFParser();
      
      const parsePromise = new Promise((resolve, reject) => {
        pdfParser.on('pdfParser_dataReady', (pdfData) => {
          resolve(pdfData);
        });
        pdfParser.on('pdfParser_dataError', (error) => {
          reject(error);
        });
      });

      pdfParser.parseBuffer(buffer);
      const pdfData: any = await parsePromise;
      
      if (pdfData && pdfData.Pages) {
        const extractedText = pdfData.Pages.map((page: any) => {
          return page.Texts.map((text: any) => decodeURIComponent(text.R[0].T)).join(' ');
        }).join('\n');

        if (extractedText && extractedText.trim().length > 0) {
          return {
            text: cleanArabicText(extractedText),
            isOCR: false
          };
        }
      }
    } catch (error) {
      console.warn('pdf2json extraction failed, falling back to OCR...', error);
    }

    // Final attempt: Use Tesseract OCR
    const { data: { text: ocrText } } = await Tesseract.recognize(
      buffer,
      'ara',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    if (!ocrText || ocrText.trim().length === 0) {
      throw new Error('No text could be extracted from the PDF');
    }

    return {
      text: cleanArabicText(ocrText),
      isOCR: true
    };

  } catch (error) {
    console.error('Failed to extract text from PDF:', error);
    return {
      text: '',
      isOCR: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during PDF processing'
    };
  }
}

/**
 * Cleans and formats Arabic text extracted from PDF
 * @param text Raw extracted text
 * @returns Cleaned and formatted text
 */
function cleanArabicText(text: string): string {
  return text
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Fix common Arabic text issues
    .replace(/[ﻻ]/g, 'لا')
    .replace(/[ﷲ]/g, 'الله')
    // Fix spacing around punctuation
    .replace(/([،؛؟!.])\s*/g, '$1 ')
    // Add space after numbers
    .replace(/(\d+)([^\d\s])/g, '$1 $2')
    // Fix reversed parentheses
    .replace(/\(([^)]+)\)/g, '($1)')
    // Remove zero-width characters
    .replace(/[\u200B-\u200F\u202A-\u202E]/g, '')
    // Normalize Arabic characters
    .normalize('NFKC')
    .trim();
}

/**
 * Checks if the extracted text is likely to be valid Arabic content
 * @param text Extracted text to validate
 * @returns boolean indicating if text appears to be valid Arabic
 */
export function isValidArabicText(text: string): boolean {
  // Check if text contains a minimum percentage of Arabic characters
  const arabicCharCount = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const totalLength = text.replace(/\s/g, '').length;
  
  if (totalLength === 0) return false;
  
  const arabicPercentage = (arabicCharCount / totalLength) * 100;
  return arabicPercentage > 30; // Requires at least 30% Arabic characters
} 