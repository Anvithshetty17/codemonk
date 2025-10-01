# Google Gemini API Setup for CodeMonk Chatbot

## Step 1: Get Your Gemini API Key

1. **Visit Google AI Studio**: Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

2. **Sign in**: Use your Google account (preferably your student account for better access)

3. **Create API Key**: 
   - Click "Create API Key"
   - Choose "Create API key in new project" (recommended)
   - Copy the generated API key

4. **Save Your Key**: Keep it safe and never share it publicly

## Step 2: Add API Key to Your Project

1. Open `/client/.env` file
2. Replace `VITE_GEMINI_API_KEY=` with your actual key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

## Step 3: Test the Chatbot

1. Start the development server: `npm run dev`
2. Open your CodeMonk app
3. Click the chatbot icon in the bottom right
4. Test with different types of questions:
   - **General**: "What is JavaScript?"
   - **Programming**: "How do arrays work in Python?"
   - **CodeMonk specific**: "What study materials do you have?"

## Gemini API Benefits

✅ **Free Tier**: Generous free usage limits  
✅ **Fast Responses**: Quick API response times  
✅ **Smart**: Advanced AI capabilities  
✅ **Reliable**: Google's robust infrastructure  
✅ **Student Friendly**: Great for educational projects  

## Chatbot Features

Your CodeMonk chatbot now has:

🤖 **General AI Assistant**: Answers any programming or general questions  
📚 **CodeMonk Knowledge**: Special responses for club-related queries  
🎯 **Smart Detection**: Automatically detects if questions are about CodeMonk  
💡 **Resource Suggestions**: Recommends relevant study materials  
🔄 **Fallback System**: Works even without API key using local responses  

## Sample Questions to Try

**General Programming:**
- "Explain React hooks"
- "What's the difference between SQL and NoSQL?"
- "How does machine learning work?"

**CodeMonk Specific:**
- "What is CodeMonk about?"
- "What study materials do you have?"
- "Tell me about the team"
- "What resources are available?"

## Troubleshooting

If the chatbot doesn't work:
1. Check if API key is correctly set in `.env`
2. Restart the development server
3. Check browser console for errors
4. The chatbot will use fallback responses if API fails

Your chatbot is now ready to handle both general questions like ChatGPT and provide enhanced responses for CodeMonk-related queries! 🚀