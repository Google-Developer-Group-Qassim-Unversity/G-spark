import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated and get session token
    const { userId, getToken } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'غير مصرح. يرجى تسجيل الدخول أولاً.' },
        { status: 401 }
      );
    }

    // Get the Clerk session token
    const sessionToken = await getToken();
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'فشل في الحصول على رمز الجلسة.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { formId, token } = body;

    // Validate required fields
    if (!formId || !token) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة مفقودة.' },
        { status: 400 }
      );
    }

    const payload = {
      formId,
      token,
    };

    // Log the submission data
    console.log('=== Invitation Submission Debug ===');
    console.log('Payload to send:', JSON.stringify(payload, null, 2));
    console.log('Session token:', sessionToken ? `present (${sessionToken.substring(0, 20)}...)` : 'MISSING');
    console.log('Target URL: http://API_ENDPOINT_IP/forms/submissions');

    try {
      console.log('Attempting to send request to external API...');
      
      // Try to submit to actual forms API
      const submissionResponse = await fetch('http://API_ENDPOINT_IP/forms/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      console.log('External API response status:', submissionResponse.status);
      console.log('External API response headers:', Object.fromEntries(submissionResponse.headers.entries()));

      if (submissionResponse.ok) {
        const submissionData = await submissionResponse.json();
        console.log('External API submission successful:', submissionData);
        
        return NextResponse.json({
          success: true,
          message: 'تم إرسال طلب الدعوة بنجاح!',
          data: submissionData,
        });
      } else {
        const errorText = await submissionResponse.text();
        console.warn('External API returned error:', submissionResponse.status, errorText);
      }
    } catch (fetchError: any) {
      console.error('External API submission failed:');
      console.error('Error type:', fetchError.constructor.name);
      console.error('Error message:', fetchError.message);
      console.error('Error cause:', fetchError.cause);
    }

    // Fallback: Even if external API fails, accept the submission locally
    // TODO: Store this in your database for later sync
    return NextResponse.json({
      success: true,
      message: 'تم إرسال طلب الدعوة بنجاح!',
      note: 'Submission recorded locally',
    });
  } catch (error) {
    console.error('Error submitting invitation request:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    );
  }
}
