import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

// Configure route options
export const dynamic = 'force-dynamic';

// Simple test endpoint
export async function GET() {
  return NextResponse.json({ status: 'API is working' });
}

// Main handler
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    console.log('Request received:', body);
    
    const { fileId, action, fileContent, fileUrl } = body;
    
    if (!fileId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: fileId and action' },
        { status: 400 }
      );
    }

    // Get Supabase configuration with enhanced logging
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    
    // Log environment variable status (without exposing sensitive values)
    console.log('Environment Configuration Status:', {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? '✓ Present' : '✗ Missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey ? '✓ Present' : '✗ Missing',
      SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey ? '✓ Present' : '✗ Missing',
      OPENROUTER_API_KEY: openRouterKey ? '✓ Present' : '✗ Missing',
      NODE_ENV: process.env.NODE_ENV || 'not set'
    });

    // Validate all required environment variables
    const missingVars = [];
    if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    if (!serviceRoleKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
    if (!openRouterKey) missingVars.push('OPENROUTER_API_KEY');

    if (missingVars.length > 0) {
      const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
      console.error('Configuration Error:', errorMessage);
      return NextResponse.json(
        { error: 'Server configuration error', details: errorMessage },
        { status: 500 }
      );
    }

    // At this point, we know all environment variables exist
    const validSupabaseUrl = supabaseUrl as string;
    const validServiceRoleKey = serviceRoleKey as string;
    const validSupabaseKey = supabaseKey as string;

    // Test Supabase connection
    try {
      // Create a Supabase client with the service role key to bypass RLS
      const adminSupabase = createClient(validSupabaseUrl, validServiceRoleKey);
      
      // Test the connection
      const { data, error } = await adminSupabase.auth.getSession();
      if (error) {
        console.error('Supabase Connection Error:', error);
        return NextResponse.json(
          { error: 'Database connection error', details: error.message },
          { status: 500 }
        );
      }
      console.log('Supabase connection test successful');
    } catch (error) {
      console.error('Supabase Client Creation Error:', error);
      return NextResponse.json(
        { error: 'Failed to initialize database connection', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Create a Supabase client with the service role key to bypass RLS
    const adminSupabase = createClient(validSupabaseUrl, validServiceRoleKey);
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    let userId = null;
    
    console.log('Auth debug:', {
      hasAuthHeader: !!authHeader,
      headerPreview: authHeader ? `${authHeader.substring(0, 20)}...` : null,
      supabaseUrl: validSupabaseUrl ? '✓ Present' : '✗ Missing',
      supabaseKey: validSupabaseKey ? '✓ Present' : '✗ Missing',
      serviceRoleKey: validServiceRoleKey ? '✓ Present' : '✗ Missing'
    });

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Verify the token and get the user
      const { data: { user }, error } = await adminSupabase.auth.getUser(token);
      
      if (error || !user) {
        console.error('Error verifying token:', error);
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        );
      }
      
      userId = user.id;
      console.log('Authenticated user ID:', userId);
    } else {
      // Try to get user from cookies as fallback
      const cookieStore = cookies();
      const supabaseClient = createClient(validSupabaseUrl, validSupabaseKey, {
        auth: {
          persistSession: false
        }
      });
      
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (session?.user) {
        userId = session.user.id;
        console.log('User ID from cookie:', userId);
      } else {
        console.error('No authentication found');
        return NextResponse.json(
          { error: 'Authentication required. Please log in.' },
          { status: 401 }
        );
      }
    }
    
    // Check if tables exist and have correct structure
    const checkTables = async () => {
      // Check quizzes table
      const { error: quizzesError } = await adminSupabase
        .from('quizzes')
        .select('id')
        .limit(1);

      if (quizzesError && quizzesError.code === '42P01') {
        console.error('Quizzes table does not exist:', quizzesError);
        return NextResponse.json(
          { error: 'Database setup required. Please contact administrator.' },
          { status: 500 }
        );
      }

      // Check summaries table
      const { error: summariesError } = await adminSupabase
        .from('summaries')
        .select('id')
        .limit(1);

      if (summariesError && summariesError.code === '42P01') {
        console.error('Summaries table does not exist:', summariesError);
        return NextResponse.json(
          { error: 'Database setup required. Please contact administrator.' },
          { status: 500 }
        );
      }

      // Check flashcards table
      const { error: flashcardsError } = await adminSupabase
        .from('flashcards')
        .select('id')
        .limit(1);

      if (flashcardsError && flashcardsError.code === '42P01') {
        console.error('Flashcards table does not exist:', flashcardsError);
        return NextResponse.json(
          { error: 'Database setup required. Please contact administrator.' },
          { status: 500 }
        );
      }
    };

    // Check tables before proceeding
    const tableCheckResult = await checkTables();
    if (tableCheckResult instanceof NextResponse) {
      return tableCheckResult;
    }

    // Generate a proper UUID for database operations
    const realUuid = uuidv4();
    
    // Process based on action type
    let result;
    
    switch (action) {
      case 'quiz':
        // Create a real quiz record in the database
        console.log('Attempting to create quiz with:', {
          id: realUuid,
          file_id: fileId,
          user_id: userId,
          serviceRoleKeyPresent: !!serviceRoleKey
        });
        
        const { data: quizData, error: quizError } = await adminSupabase
          .from('quizzes')
          .insert([{
            id: realUuid,
            file_id: fileId,
            user_id: userId,
            title: 'Generated Quiz',
            questions: JSON.stringify([
              {
                question: 'Sample question from the file content?',
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correct_answer: 'Option A'
              }
            ]),
            difficulty: 'medium'
          }])
          .select();
          
        if (quizError) {
          console.error('Error creating quiz:', {
            error: quizError,
            errorMessage: quizError.message,
            errorCode: quizError.code,
            details: quizError.details,
            hint: quizError.hint
          });
          return NextResponse.json(
            { error: `Database error: ${quizError.message}` },
            { status: 500 }
          );
        }
        
        result = {
          quizId: realUuid,
          title: 'Generated Quiz'
        };
        break;
        
      case 'summary':
        console.log('Attempting to create summary with:', {
          id: realUuid,
          file_id: fileId,
          user_id: userId,
          serviceRoleKeyPresent: !!serviceRoleKey
        });
        
        const { error: summaryError } = await adminSupabase
          .from('summaries')
          .insert([{
            id: realUuid,
            file_id: fileId,
            user_id: userId,
            content: 'This is a sample summary generated from the file content.'
          }]);
          
        if (summaryError) {
          console.error('Error creating summary:', {
            error: summaryError,
            errorMessage: summaryError.message,
            errorCode: summaryError.code,
            details: summaryError.details,
            hint: summaryError.hint
          });
          return NextResponse.json(
            { error: `Database error: ${summaryError.message}` },
            { status: 500 }
          );
        }
        
        result = {
          summary: 'This is a sample summary generated from the file content.'
        };
        break;
        
      case 'flashcards':
        console.log('Attempting to create flashcards with:', {
          id: realUuid,
          file_id: fileId,
          user_id: userId,
          serviceRoleKeyPresent: !!serviceRoleKey
        });
        
        const { error: flashcardsError } = await adminSupabase
          .from('flashcards')
          .insert([{
            id: realUuid,
            file_id: fileId,
            user_id: userId,
            cards: JSON.stringify([
              { question: 'Sample question from the content?', answer: 'Sample answer' }
            ])
          }]);
          
        if (flashcardsError) {
          console.error('Error creating flashcards:', {
            error: flashcardsError,
            errorMessage: flashcardsError.message,
            errorCode: flashcardsError.code,
            details: flashcardsError.details,
            hint: flashcardsError.hint
          });
          return NextResponse.json(
            { error: `Database error: ${flashcardsError.message}` },
            { status: 500 }
          );
        }
        
        result = {
          flashcards: [
            { question: 'Sample question from the content?', answer: 'Sample answer' }
          ]
        };
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action type' },
          { status: 400 }
        );
    }
    
    // Create a processing record to track this operation
    await adminSupabase
      .from('file_processing')
      .insert([{
        file_id: fileId,
        user_id: userId,
        action,
        status: 'completed',
        completed_at: new Date().toISOString()
      }]);
    
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 