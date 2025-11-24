import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
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

    let formId = null;
    let alreadySubmitted = false;
    const eventId = '246';

    console.log('=== GET Status Request Debug ===');
    console.log('Session token:', sessionToken ? `present (${sessionToken.substring(0, 20)}...)` : 'MISSING');
    console.log('Event ID:', eventId);
    console.log('Target URL:', `http://API_ENDPOINT_IP/events/${eventId}/form`);

    try {
      console.log('Attempting GET request to external API...');
      
      // Call the forms API with eventId to get form details
      const formResponse = await fetch(`http://API_ENDPOINT_IP/events/${eventId}/form`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      console.log('Forms API response status:', formResponse.status);

      if (formResponse.ok) {
        const formData = await formResponse.json();
        console.log('Forms API response data:', formData);
        // Extract formId from the response
        formId = formData.id || formData.formId;
        
        if (!formId) {
          throw new Error('FormId not found in API response');
        }
      } else {
        const errorText = await formResponse.text();
        console.error('Forms API returned non-OK status:', formResponse.status, errorText);
        throw new Error(`API returned status ${formResponse.status}: ${errorText}`);
      }
    } catch (fetchError: any) {
      // External API failed
      console.error('Forms API unavailable:');
      console.error('Error type:', fetchError.constructor.name);
      console.error('Error message:', fetchError.message);
      console.error('Error cause:', fetchError.cause);
      
      return NextResponse.json(
        { error: 'فشل في الاتصال بخادم النماذج. يرجى المحاولة مرة أخرى لاحقاً.' },
        { status: 503 }
      );
    }

    // TODO: Check if user has already submitted
    // You can check against your database or via another API endpoint
    // For now, always return false to allow submissions

    return NextResponse.json({
      formId,
      alreadySubmitted,
      eventId,
    });
  } catch (error) {
    console.error('Error checking invitation status:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التحقق من حالة الطلب.' },
      { status: 500 }
    );
  }
}
