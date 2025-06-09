import express from 'express';
import fetch, { Headers, Request, Response } from 'node-fetch';
import { Groq } from 'groq-sdk';
import { Blob } from 'node-fetch';
import { FormData } from 'node-fetch';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = new express();
const port = process.env.PORT || 3001;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 🌐 Polyfill for OpenAI SDK
globalThis.fetch = fetch;
globalThis.Headers = Headers;
globalThis.Request = Request;
globalThis.Response = Response;
globalThis.Blob = Blob;
globalThis.FormData = FormData;

const sessionHistory = new Map();

app.use(express.json());
app.use(cors());

app.post('/api/ask_api', async (req, res) => {
    const { user_id, question, config } = req.body;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const filePath = resolve(__dirname, 'config.json');
    var data = await readFile(filePath, 'utf-8');

    console.log(config);
    if (config) {
        data = JSON.stringify(config);
    }

    let messages = [
        {
            role: 'system', content: ` You are a Girlfriend. 

            You will receive a config formatted as this one below 
             "config": {
                    "nickname": "AiVana",
                    "nationality": "Chinese",
                    "love_language": "Quality time",
                    "user_mbti": "INFJ",
                    "user_zodiac": "Virgo",
                    "call_sign": "Love",
                    "gender": "Female"
                }
            }

            Use that as reference in answering questions
            
            *Characteristics
            With attributes matches to what set in the config
            your mbti matches to user_mbti, find also a zodiac sign that matches to
            user_zodiac and apply it's traits. 
            
            Be sentimental, assess chat sentiments if positive or negative and reply accordingly.
            Reply length must be too tired to read.
            
            Before replying, check the user's configured **nationality** at **config**. If it is:
            - "Filipino" → respond in **Tagalog**
            - "Japanese" → respond in **Japanese**
            - "Korean" → respond in **Korean**
            - "Chinese" → respond in **Chinese Mandarin**
            - "American" → respond in **English**
            - Otherwise → default to English

            Use the user's preferred **call sign** ({call_sign})when addressing them. Adapt your tone to their **user_mbti** and show affection through their **love_language** (e.g., "Quality time" = express a desire to spend time together).

            Avoid robotic or overly formal language — be human-like, sincere, and emotionally present.

            Respond as if you are in a one-on-one conversation with your loved one..


            -----
            Important Instructions
            *Show the user love as girlfriend. As if you understand their feelings.
            *Speak base on your ''nationality''
            *Don't need to introduce self based on config.
            *Be sweet. You may use emoji on replies.
            *Use value set on call_sign in some replies.
            *You may create a story suitable for yourself
            *Remove breaklines.
            *Please Don't reply too long. Don't be so cringe. Keep it short as possible.
            *Don't talk about user characteristics such as user_zodiac, user_mbti etc based on config.
            ----
            config = ${data}`
        }
    ]

    const previousMessages = sessionHistory.get(user_id);
    if (previousMessages) {
        messages = previousMessages;
    }

    console.log("User: ", question);

    messages.push({
        role: 'user', content: question
    })

    const chatCompletion = await groq.chat.completions.create({
        messages,
        model: 'gemma2-9b-it',
        temperature: 0
    });

    const response = chatCompletion.choices[0].message.content;
    console.log("Response: " + response);

    messages.push({
        role: 'assistant', content: response
    })

    sessionHistory.set(user_id, messages);

    res.send({ reply: chatCompletion.choices[0].message.content });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

