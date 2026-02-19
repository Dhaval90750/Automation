import { NextResponse } from 'next/server';
import { model } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
        return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
    }
    
    const systemPrompt = `You are a Playwright automation expert. Convert the following user request into a JSON object containing both automation steps and a Python Playwright script.
    
    The output MUST be a valid JSON object with the following structure:
    {
        "steps": [
            {
                "id": "1", 
                "action": "goto" | "click" | "type" | "assertion" | "waitFor", 
                "selector": "string (optional)", 
                "value": "string (optional)",
                "description": "string"
            }
        ],
        "pythonCode": "string containing the full python playwright script"
    }
    
    Python Code Rules:
    - Use 'playwright.sync_api'.
    - Include full script with imports.
    - Wrap in a 'run(playwright)' function.
    
    User Request: ${prompt}
    
    Return ONLY the JSON object. Do not include markdown formatting.`;

    const result = await model.generateContent(systemPrompt);
    const textResponse = result.response.text();
    
    if (!textResponse) {
        throw new Error('No response from Gemini');
    }

    const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
        const parsedData = JSON.parse(cleanJson);
        return NextResponse.json({ 
            success: true, 
            steps: parsedData.steps || [], 
            pythonCode: parsedData.pythonCode || '', 
            message: "Generated automation steps." 
        });
    } catch (e) {
        console.error('Failed to parse Gemini response:', textResponse);
        return NextResponse.json({ success: false, error: 'Failed to parse AI response', raw: textResponse }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error in POST handler:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
