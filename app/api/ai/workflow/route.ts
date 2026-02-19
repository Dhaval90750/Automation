
import { NextResponse } from 'next/server';
import { model } from '@/lib/ai';

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
        }


        const systemInstruction = `
            You are an AI that generates automation workflows for a React Flow based builder.
            User will describe a task. You must output a valid JSON object with "nodes" and "edges".
            
            Available Node Types:
            - testNode: { id, type: 'testNode', position, data: { label, testId? } }
                - testId should be null or a placeholder string if not specified.
            - conditionNode: { id, type: 'conditionNode', position, data: { label, condition? } }
            - loopNode: { id, type: 'loopNode', position, data: { label, variable?, sourceType? } }
            - delayNode: { id, type: 'delayNode', position, data: { label, duration? } }
            - functionNode: { id, type: 'functionNode', position, data: { label, functionId? } }
            - endNode: { id, type: 'endNode', position, data: { label } }

            Rules:
            1. Start with an Input node (type: 'input') at {x:0, y:0}.
            2. Connect nodes logically.
            3. Position nodes with y-increments of 100 to visualize flow top-down.
            4. Output ONLY the JSON object. No markdown.
        `;

        let result;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                result = await model.generateContent([
                    systemInstruction,
                    `Task: ${prompt}`
                ]);
                break; // Success
            } catch (e: any) {
                attempts++;
                console.warn(`Gemini API Error (Attempt ${attempts}):`, e.message);
                if (attempts >= maxAttempts) throw e;
                // Exponential backoff: 1s, 2s, 4s
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
            }
        }

        if (!result) throw new Error("Failed to generate content after retries.");

        const response = result.response;
        let text = response.text();
        
        // Clean markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Safe Parse
        let workflow;
        try {
            workflow = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse AI response:", text);
            throw new Error("AI returned invalid JSON.");
        }

        return NextResponse.json({ success: true, workflow });
    } catch (error: any) {
        console.error("AI Generation Failed:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
