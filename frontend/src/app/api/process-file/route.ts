import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

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

// Helper function to extract text content from file
async function extractTextFromFile(fileUrl: string): Promise<string> {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`فشل في جلب الملف: ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type') || '';
    let text = '';

    if (contentType.includes('text/') || contentType.includes('application/json')) {
      text = await response.text();
    } else if (contentType.includes('application/pdf') || contentType.includes('application/msword')) {
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
async function generateQuiz(content: string, fileId: string) {
  try {
    const quizId = uuidv4();

    // Call OpenRouter API to generate quiz content
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      },
      body: JSON.stringify({
        model: 'mistralai/mixtral-8x7b-instruct',
        messages: [{
          role: 'system',
          content: 'You are a helpful AI that generates educational quizzes in Arabic. Create a quiz with 5 multiple choice questions based on the given content.'
        }, {
          role: 'user',
          content: `Generate a quiz in Arabic about this content:\n${content}`
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

    // Format the AI response into a structured quiz format
    let questions;
    try {
        // First attempt to parse as JSON
        questions = JSON.parse(generatedContent).questions;
    } catch (parseError) {
        // If JSON parsing fails, parse the text format
        questions = parseQuizText(generatedContent);
    }

    if (!questions || !Array.isArray(questions)) {
        throw new Error('Invalid quiz format received from AI');
    }

    const formattedQuestions = questions.map(q => ({
        question: typeof q.text === 'string' ? q.text : q.question,
        options: Array.isArray(q.choices) ? q.choices : q.options || [],
        correct_answer: q.correctAnswer || q.correct_answer
    }));

    // Validate questions format
    if (!formattedQuestions.every(q => 
        q.question && 
        Array.isArray(q.options) && 
        q.options.length > 0 && 
        q.correct_answer
    )) {
        throw new Error('Invalid question format in AI response');
    }

    // Create quiz record
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert([{
        id: quizId,
        title: `اختبار: ${content.substring(0, 50)}...`,
        difficulty: 'متوسط',
        file_id: fileId
      }])
      .select()
      .single();

    if (quizError) throw quizError;

    // Insert questions
    const { error: questionsError } = await supabase
      .from('quiz_questions')
      .insert(
        questions.map((q: { question: string; options: string[]; correct_answer: string }) => ({
          quiz_id: quizId,
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer
        }))
      );

    if (questionsError) throw questionsError;

    return { quizId, title: quizData.title };
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
}

// Generate summary from text content
async function generateSummary(content: string, fileId: string) {
  try {
    // Call OpenRouter API to generate summary
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
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
    // Call OpenRouter API to generate flashcards
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
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

    // Format and validate flashcards
    const formattedFlashcards = flashcards.map(f => ({
      question: f.question,
      answer: f.answer
    }));

    if (!formattedFlashcards.every(f => f.question && f.answer)) {
      throw new Error('Invalid flashcard format in AI response');
    }

    // Insert flashcards
    const { error: flashcardsError } = await supabase
      .from('flashcards')
      .insert(
        formattedFlashcards.map(f => ({
          file_id: fileId,
          question: f.question,
          answer: f.answer
        }))
      );

    if (flashcardsError) throw flashcardsError;

    return { flashcards: formattedFlashcards };
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as ProcessFileRequest;
    const { fileId, action, fileContent, fileUrl } = body;

    // Check if either fileContent or fileUrl is provided
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

    let result;

    // If fileUrl is provided but fileContent is not, extract text from the file URL
    let content = fileContent;
    if (!content && fileUrl) {
      try {
        content = await extractTextFromFile(fileUrl);
      } catch (error) {
        return NextResponse.json(
          { error: 'فشل في استخراج محتوى الملف من الرابط' },
          { status: 400 }
        );
      }
    }

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

    return NextResponse.json({ result });
  } catch (error) {
    console.error('خطأ في معالجة الملف:', error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء معالجة الملف';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (/^\d+\./.test(line) || line.startsWith('س:') || line.startsWith('سؤال:')) {
      // If we already have a question and answer pair, add it to flashcards
      if (currentQuestion && currentAnswer) {
        flashcards.push({
          question: currentQuestion,
          answer: currentAnswer
        });
      }
      
      // Start a new question
      currentQuestion = line.replace(/^\d+\.\s*|^س:\s*|^سؤال:\s*/, '').trim();
      currentAnswer = '';
    } else if (line.startsWith('ج:') || line.startsWith('جواب:') || line.startsWith('الإجابة:')) {
      // This is an answer line
      currentAnswer = line.replace(/^ج:\s*|^جواب:\s*|^الإجابة:\s*/, '').trim();
    } else if (currentQuestion && !currentAnswer) {
      // If we have a question but no answer yet, this might be the answer
      currentAnswer = line;
    } else if (currentAnswer) {
      // If we already have an answer, this might be a continuation
      currentAnswer += '\n' + line;
    }
  }

  // Add the last flashcard if there is one
  if (currentQuestion && currentAnswer) {
    flashcards.push({
      question: currentQuestion,
      answer: currentAnswer
    });
  }

  return flashcards;
}