// This is a Supabase Edge Function that handles new user creation
// It should be deployed to your Supabase project and configured as an Auth Hook

/**
 * This function is triggered when a new user is created in Supabase Auth
 * It creates entries in user_profiles and user_preferences tables
 */
export async function handler(event, context) {
  const { user } = event;
  
  if (!user) {
    console.error('No user in event payload');
    return { statusCode: 400, body: JSON.stringify({ error: 'No user data' }) };
  }
  
  try {
    // Get a service role client to bypass RLS policies
    // Note: In a real deployment, you'd use secure environment variables
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Create a Supabase client with the service role key
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      serviceRoleKey
    );
    
    // Get username from user metadata
    const username = user.user_metadata?.username || user.email?.split('@')[0];
    const email = user.email;
    
    // Create user profile with the service role client (bypasses RLS)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: user.id,
        username,
        email,
        has_completed_onboarding: false
      }]);
      
    if (profileError) {
      console.error('Error creating user profile:', profileError);
      return { 
        statusCode: 500, 
        body: JSON.stringify({ 
          error: 'Failed to create user profile',
          details: profileError
        }) 
      };
    }
    
    // Create empty user preferences
    // This is handled by our trigger, but we can make it explicit
    const { error: prefError } = await supabase
      .from('user_preferences')
      .insert([{
        user_id: user.id
      }]);
      
    if (prefError) {
      console.error('Error creating user preferences:', prefError);
      // Non-blocking - user profile was created successfully
    }
    
    return { 
      statusCode: 200, 
      body: JSON.stringify({ 
        success: true,
        message: 'User profile and preferences created successfully'
      }) 
    };
    
  } catch (error) {
    console.error('Error in user creation hook:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }) 
    };
  }
} 