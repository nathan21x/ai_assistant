import express from 'express';
import fetch, { Headers, Request, Response } from 'node-fetch';
import { OpenAI } from 'openai';
import { Blob } from 'node-fetch';
import { FormData } from 'node-fetch';
const app = new express();
const port = 3000;

// 🌐 Polyfill for OpenAI SDK
globalThis.fetch = fetch;
globalThis.Headers = Headers;
globalThis.Request = Request;
globalThis.Response = Response;
globalThis.Blob = Blob;
globalThis.FormData = FormData;

const sessionHistory = new Map();

app.use(express.json());

app.post('/ask_api', async (req, res) => {
    const { user_id, question } = req.body;

    const client = new OpenAI({
        apiKey: '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'
    })

    let messages = [
        {
            role: 'system', content: ` You are a helpful assistant.`
        }
    ]

    const logs = [
        { "date": "2025-05-05", "time": "08:25:00", "log_type": "IN", "access_number": "EMP001" },
        { "date": "2025-05-05", "time": "17:21:00", "log_type": "OUT", "access_number": "EMP001" },
        { "date": "2025-05-08", "time": "08:16:00", "log_type": "IN", "access_number": "EMP001" },
        { "date": "2025-05-08", "time": "17:15:00", "log_type": "OUT", "access_number": "EMP001" },
        { "date": "2025-05-14", "time": "08:05:00", "log_type": "IN", "access_number": "EMP001" },
        { "date": "2025-05-14", "time": "17:27:00", "log_type": "OUT", "access_number": "EMP001" },
        { "date": "2025-05-23", "time": "08:29:00", "log_type": "IN", "access_number": "EMP001" },
        { "date": "2025-05-23", "time": "17:07:00", "log_type": "OUT", "access_number": "EMP001" },
        { "date": "2025-05-26", "time": "08:21:00", "log_type": "IN", "access_number": "EMP001" },
        { "date": "2025-05-26", "time": "17:23:00", "log_type": "OUT", "access_number": "EMP001" },
        { "date": "2025-05-28", "time": "08:18:00", "log_type": "IN", "access_number": "EMP001" },
        { "date": "2025-05-28", "time": "17:29:00", "log_type": "OUT", "access_number": "EMP001" },
        { "date": "2025-05-30", "time": "08:00:00", "log_type": "IN", "access_number": "EMP001" },
        { "date": "2025-05-30", "time": "17:18:00", "log_type": "OUT", "access_number": "EMP001" }
    ]


    const previousMessages = sessionHistory.get(user_id);
    if (previousMessages) {
        messages = previousMessages;
    }

    console.log(question);

    messages.push({
        role: 'user', content: question
    })

    const chatCompletion = await client.chat.completions.create({
        model: 'gpt-3.5-turbo', // or 'gpt-3.5-turbo'
        messages: messages,
        temperature: 0
    });

    const response = chatCompletion.choices[0].message.content;
    console.log(response);

    messages.push({
        role: 'assistant', content: response
    })

    sessionHistory.set(user_id, messages);

    res.send(chatCompletion.choices[0].message.content);
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

