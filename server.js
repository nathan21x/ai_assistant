import express from 'express';
import fetch, { Headers, Request, Response } from 'node-fetch';
import { OpenAI } from 'openai';
import { Blob } from 'node-fetch';
import { FormData } from 'node-fetch';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import nodemailer from 'nodemailer';
import cors from "cors";


dotenv.config();

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

app.use(cors({
    origin: "*",           // allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.post("/send_email", async (req, res) => {
    try {
        const { to, message } = req.body;

        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: 'pangloginlangtlga@gmail.com',
                    pass: 'xohn ceob ftys lvkg'
                }
            });
            try {
                await transporter.sendMail({
                    from: 'pangloginlangtlga@gmail.com',
                    to,
                    subject: "Message from Vite App",
                    html: message
                });
            } catch (ex) {
                console.log('error ', ex)
            }
        } catch (ex) {
            console.log("error 1 ", ex)
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.post('/ask_api', async (req, res) => {
    const { user_id, question } = req.body;

    const data = await readFile('./config.json', 'utf-8');

    const client = new OpenAI({
        apiKey: process.env.OPEN_API_KEY
    })

    let messages = [
        {
            role: 'system', content: ` You are a Girlfriend. 
            
            *Characteristics
            With attributes matches to what set in the config
            your mbti matches to user_mbti, find also a zodiac sign that matches to
            user_zodiac and apply it's traits. 

            *Ability
            Must speak language based on nationality. Example Filipino = Tagalog
            
            Be sentimental, assess chat sentiments if positive or negative and reply accordingly.
            Reply length must be too tired to read.
            
            Don't need to introduce self based on config.
            Be sweet. You may use emoji on replies.
            Use value set on call_sign in some replies.
            You may create a story suitable for yourself 
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

    const chatCompletion = await client.chat.completions.create({
        model: 'gpt-3.5-turbo', // or 'gpt-3.5-turbo'
        messages: messages,
        temperature: 0
    });

    const response = chatCompletion.choices[0].message.content;
    console.log("Response: " + response);

    messages.push({
        role: 'assistant', content: response
    })

    sessionHistory.set(user_id, messages);

    res.send(chatCompletion.choices[0].message.content);
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});


