import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { extractTextFromPDF, isValidArabicText } from '@/utils/pdfProcessor';

// Validate environment variables at the top level
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Configure route options
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Define interfaces for type safety
interface ProcessFileRequest {
  fileId: string;
  action: 'quiz' | 'summary' | 'flashcards';
  fileContent?: string;
  fileUrl?: string;
}

interface QuizQuestion {
  text?: string;
  question?: string;
  choices?: string[];
  options?: string[];
  correctAnswer?: string;
  correct_answer?: string;
}

// Simple test endpoint to verify the API is working
export async function GET() {
  return NextResponse.json({ status: 'API route is working' });
}

// Main POST handler
export async function POST(request: NextRequest) {
  console.log('POST request received at /api/process-file');
  
  try {
    // Validate API key exists
    if (!OPENROUTER_API_KEY) {
      console.error('OpenRouter API key is missing');
      return NextResponse.json(
        { error: 'OpenRouter API key is not configured. Please check your environment variables.' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json() as ProcessFileRequest;
    console.log('Request body:', body);
    
    const { fileId, action, fileContent, fileUrl } = body;

    // Validate required fields
    if (!fileId || !action || (!fileContent && !fileUrl)) {
      return NextResponse.json(
        { error: 'يجب توفير معرف الملف ونوع المعالجة ومحتوى الملف أو رابط الملف' },
        { status: 400 }
      );
    }

    if (!['quiz', 'summary', 'flashcards'].includes(action)) {
      return NextResponse.json(
        { error: 'نوع المعالجة غير صالح' },
        { status: 400 }
      );
    }

    // Extract text from file if needed
    let content = fileContent;
    if (!content && fileUrl) {
      try {
        content = await extractTextFromFile(fileUrl);
      } catch (error) {
        console.error('Error extracting text from file:', error);
        return NextResponse.json(
          { error: 'فشل في استخراج محتوى الملف من الرابط' },
          { status: 400 }
        );
      }
    }

    // Process content based on action
    let result;
    switch (action) {
      case 'quiz':
        if (!content) {
          throw new Error('Content is required for quiz generation');
        }
        result = await generateQuiz(content, fileId);
        break;
      case 'summary':
        if (!content) {
          throw new Error('Content is required for summary generation');
        }
        result = await generateSummary(content, fileId);
        break;
      case 'flashcards':
        if (!content) {
          throw new Error('Content is required for flashcards generation');
        }
        result = await generateFlashcards(content, fileId);
        break;
      default:
        return NextResponse.json(
          { error: 'نوع المعالجة غير مدعوم حاليًا' },
          { status: 400 }
        );
    }

    console.log('Processing successful:', action);
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in POST handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const statusCode = errorMessage.includes('authentication failed') ? 401 : 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

// Helper function to extract text content from file
async function extractTextFromFile(fileUrl: string): Promise<string> {
  try {
    console.log('Extracting text from file:', fileUrl);
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`فشل في جلب الملف: ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type') || '';
    let text = '';

    if (contentType.includes('text/') || contentType.includes('application/json')) {
      text = await response.text();
    } else if (contentType.includes('application/pdf')) {
      const buffer = Buffer.from(await response.arrayBuffer());
      const result = await extractTextFromPDF(buffer);
      
      if (result.error) {
        throw new Error(`فشل في استخراج النص من ملف PDF: ${result.error}`);
      }
      
      if (!result.text || !isValidArabicText(result.text)) {
        throw new Error('لم يتم العثور على نص عربي صالح في الملف');
      }
      
      text = result.text;
      console.log(`PDF processed successfully${result.isOCR ? ' (using OCR)' : ''}`);
    } else if (contentType.includes('application/msword')) {
      await response.blob();
      text = `محتوى مستخرج من ملف ${contentType}\n`;
      text += 'هذا محتوى تجريبي لغرض العرض.';
    } else if (contentType.includes('image/')) {
      text = 'محتوى مستخرج من صورة.';
    } else {
      throw new Error(`نوع الملف غير مدعوم: ${contentType}`);
    }

    if (!text || text.trim().length === 0) {
      throw new Error('لم يتم العثور على محتوى نصي في الملف');
    }
    return text;
  } catch (error) {
    console.error('خطأ في استخراج النص من الملف:', error);
    throw error;
  }
}

// Generate quiz questions from text content
async function generateQuiz(content: string, fileId: string, difficulty: string = 'medium') {
  try {
    console.log('Generating quiz for file:', fileId);
    const quizId = uuidv4();

    // Validate content is in Arabic
    if (!isValidArabicText(content)) {
      throw new Error('المحتوى يجب أن يكون باللغة العربية');
    }

    // Call OpenRouter API to generate quiz content
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': APP_URL,
        'X-Title': 'Lammah AI',
      },
      body: JSON.stringify({
        model: 'mistralai/mixtral-8x7b-instruct',
        messages: [{
          role: 'system',
          content: `أنت مساعد ذكي متخصص في إنشاء اختبارات تعليمية باللغة العربية. قم بإنشاء اختبار بناءً على المحتوى المقدم.
          اتبع هذه القواعد:
          1. يجب أن تكون الأسئلة مستمدة حصراً من المحتوى المقدم
          2. بالنسبة لمستوى ${difficulty}:
             - سهل: 10 أسئلة فهم أساسية
             - متوسط: 10 أسئلة متوسطة التعقيد
             - صعب: 10 أسئلة تتطلب فهماً عميقاً
          3. كل سؤال يجب أن يحتوي على 4 خيارات
          4. قم بتنسيق الإجابة كـ JSON بهذا الشكل:
          {
            "questions": [
              {
                "text": "نص السؤال",
                "choices": ["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"],
                "correctAnswer": "الإجابة الصحيحة"
              }
            ]
          }`
        }, {
          role: 'user',
          content: `قم بإنشاء اختبار بمستوى ${difficulty} باللغة العربية من هذا المحتوى:\n${content}`
        }],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!openRouterResponse.ok) {
      const errorBody = await openRouterResponse.text();
      console.error('OpenRouter API Error:', {
        status: openRouterResponse.status,
        headers: Object.fromEntries(openRouterResponse.headers.entries()),
        error: errorBody
      });
      
      if (openRouterResponse.status === 401) {
        throw new Error('فشل في التحقق من مفتاح API');
      }
      throw new Error(`خطأ في توليد الأسئلة: ${openRouterResponse.status}`);
    }

    const aiResponse = await openRouterResponse.json();
    const generatedContent = aiResponse.choices[0].message.content;

    // Parse and validate questions
    let questions;
    try {
      const parsed = JSON.parse(generatedContent);
      questions = parsed.questions;

      // Validate questions format
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('تنسيق الأسئلة غير صالح');
      }

      // Validate each question
      questions = questions.map((q, index) => {
        if (!q.text || !Array.isArray(q.choices) || q.choices.length !== 4 || !q.correctAnswer) {
          throw new Error(`السؤال رقم ${index + 1} غير مكتمل`);
        }
        if (!q.choices.includes(q.correctAnswer)) {
          throw new Error(`الإجابة الصحيحة للسؤال رقم ${index + 1} غير موجودة في الخيارات`);
        }
        return {
          text: q.text,
          choices: q.choices,
          correctAnswer: q.correctAnswer
        };
      });
    } catch (parseError) {
      console.error('Error parsing questions:', parseError);
      throw new Error('فشل في تحليل الأسئلة المولدة');
    }

    // Create quiz record in database
    const { error: quizError } = await supabase
      .from('quizzes')
      .insert([{
        id: quizId,
        file_id: fileId,
        title: `اختبار ${difficulty === 'easy' ? 'سهل' : difficulty === 'medium' ? 'متوسط' : 'صعب'}`,
        difficulty: difficulty,
        questions: questions
      }]);

    if (quizError) {
      console.error('Error saving quiz:', quizError);
      throw new Error('فشل في حفظ الاختبار في قاعدة البيانات');
    }

    return { 
      quizId, 
      questions,
      totalQuestions: questions.length
    };
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
}

// Generate summary from text content
async function generateSummary(content: string, fileId: string) {
  try {
    console.log('Generating summary for file:', fileId);
    // Call OpenRouter API to generate summary
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': APP_URL,
        'X-Title': 'Lammah AI',
      },
      body: JSON.stringify({
        model: 'mistralai/mixtral-8x7b-instruct',
        messages: [{
          role: 'system',
          content: 'You are a helpful AI that generates concise summaries in Arabic. Create a summary of the given content.'
        }, {
          role: 'user',
          content: `Generate a summary in Arabic for this content:\n${content}`
        }]
      })
    });

    if (!openRouterResponse.ok) {
      const errorBody = await openRouterResponse.text();
      console.error('OpenRouter API Error:', {
        status: openRouterResponse.status,
        headers: Object.fromEntries(openRouterResponse.headers.entries()),
        error: errorBody
      });
      throw new Error(`OpenRouter API Error: ${openRouterResponse.status} - ${errorBody.substring(0, 200)}`);
    }

    const aiResponse = await openRouterResponse.json();
    const summaryContent = aiResponse.choices[0].message.content;

    // Create summary record
    const { error: summaryError } = await supabase
      .from('summaries')
      .insert([{
        file_id: fileId,
        content: summaryContent
      }]);

    if (summaryError) throw summaryError;

    return { summary: summaryContent };
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
}

// Generate flashcards from text content
async function generateFlashcards(content: string, fileId: string) {
  try {
    console.log('Generating flashcards for file:', fileId);
    // Call OpenRouter API to generate flashcards
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': APP_URL,
        'X-Title': 'Lammah AI',
      },
      body: JSON.stringify({
        model: 'mistralai/mixtral-8x7b-instruct',
        messages: [{
          role: 'system',
          content: 'You are a helpful AI that generates educational flashcards in Arabic. Create 5-10 flashcards with question/answer pairs based on the given content.'
        }, {
          role: 'user',
          content: `Generate flashcards in Arabic about this content:\n${content}`
        }]
      })
    });

    if (!openRouterResponse.ok) {
      const errorBody = await openRouterResponse.text();
      console.error('OpenRouter API Error:', {
        status: openRouterResponse.status,
        headers: Object.fromEntries(openRouterResponse.headers.entries()),
        error: errorBody
      });
      throw new Error(`OpenRouter API Error: ${openRouterResponse.status} - ${errorBody.substring(0, 200)}`);
    }

    const aiResponse = await openRouterResponse.json();
    const generatedContent = aiResponse.choices[0].message.content;

    // Parse flashcards from AI response
    let flashcards;
    try {
      // First attempt to parse as JSON
      flashcards = JSON.parse(generatedContent).flashcards;
    } catch (parseError) {
      // If JSON parsing fails, parse the text format
      flashcards = parseFlashcardsText(generatedContent);
    }

    if (!flashcards || !Array.isArray(flashcards)) {
      throw new Error('Invalid flashcards format received from AI');
    }

    // Create flashcards record
    const { error: flashcardsError } = await supabase
      .from('flashcards')
      .insert([{
        file_id: fileId,
        cards: flashcards
      }]);

    if (flashcardsError) throw flashcardsError;

    return { flashcards };
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error;
  }
}

// Helper function to parse quiz text format
function parseQuizText(text: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const lines = text.split('\n').filter(line => line.trim());
  let currentQuestion: QuizQuestion | null = null;

  for (const line of lines) {
    if (/^\d+\./.test(line)) {
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        text: line.replace(/^\d+\.\s*/, '').trim(),
        choices: [],
        correctAnswer: ''
      };
    } else if (line.startsWith('-') && currentQuestion) {
      // Ensure choices array exists before pushing
      if (!currentQuestion.choices) {
        currentQuestion.choices = [];
      }
      currentQuestion.choices.push(line.replace(/^-\s*/, '').trim());
    } else if ((line.includes('✓') || line.includes('✅')) && currentQuestion) {
      currentQuestion.correctAnswer = line.replace(/^[✓✅]\s*/, '').trim();
    }
  }

  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  return questions;
}

// Helper function to parse flashcards text format
function parseFlashcardsText(text: string): Array<{ question: string; answer: string }> {
  const flashcards: Array<{ question: string; answer: string }> = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  let currentQuestion = '';
  let currentAnswer = '';
  let isQuestion = true;

  for (const line of lines) {
    if (/^\d+\./.test(line)) {
      if (currentQuestion && currentAnswer) {
        flashcards.push({
          question: currentQuestion,
          answer: currentAnswer
        });
      }
      currentQuestion = line.replace(/^\d+\.\s*/, '').trim();
      currentAnswer = '';
      isQuestion = false;
    } else if (line.startsWith('س:') || line.startsWith('سؤال:')) {
      if (currentQuestion && currentAnswer) {
        flashcards.push({
          question: currentQuestion,
          answer: currentAnswer
        });
      }
      currentQuestion = line.replace(/^(س:|سؤال:)\s*/, '').trim();
      currentAnswer = '';
      isQuestion = false;
    } else if (line.startsWith('ج:') || line.startsWith('جواب:')) {
      currentAnswer = line.replace(/^(ج:|جواب:)\s*/, '').trim();
      isQuestion = true;
    } else if (!isQuestion) {
      currentAnswer += ' ' + line.trim();
    } else {
      currentQuestion += ' ' + line.trim();
    }
  }

  if (currentQuestion && currentAnswer) {
    flashcards.push({
      question: currentQuestion,
      answer: currentAnswer
    });
  }

  return flashcards;
}