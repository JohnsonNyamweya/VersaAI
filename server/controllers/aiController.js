import openai from "../configs/ai.js";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from 'axios'
import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs';
import {extractText} from 'unpdf'

const generateArticle = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { prompt, length } = req.body;
    const { plan, free_usage, user } = req;

    if (plan === "Free" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_completion_tokens: length,
    });

    const content = response.choices[0].message.content;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')
    `;

    if (plan === "Free") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          ...user.privateMetadata,
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan === "Free" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_completion_tokens: 100,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type) 
    VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

    if (plan === "Free") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          ...user.privateMetadata,
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const generateImage = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== "Premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions.",
      });
    }

    const formData = new FormData();
    formData.append('prompt', prompt);
    const {data} = await axios.post('https://clipdrop-api.co/text-to-image/v1', formData, 
      {headers: {'x-api-key': process.env.CLIPDROP_API_KEY}, responseType: "arraybuffer"})

    const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`

    const {secure_url} = await cloudinary.uploader.upload(base64Image);

    await sql`INSERT INTO creations (user_id, prompt, content, type, publish) 
    VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

    res.json({ success: true, secure_url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const removeImageBackground = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const image = req.file;
    const plan = req.plan;

    if (plan !== "Premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions.",
      });
    }

    const {secure_url} = await cloudinary.uploader.upload(image.path, {
      transformation: [
        { 
          effect: "background_removal",
          background_removal: "remove_the_background"
        }
      ],
    });

    await sql`INSERT INTO creations (user_id, prompt, content, type) 
    VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')`;

    res.json({ success: true, secure_url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const removeImageObject = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const {object} = req.body;
    const image = req.file;
    const plan = req.plan;

    if (plan !== "Premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions.",
      });
    }

    const {public_id} = await cloudinary.uploader.upload(image.path);
    const imageUrl = cloudinary.url(public_id, {
      transformation: [{effect: `gen_remove:${object}`}],
      resource_type: "image",
    })

    await sql`INSERT INTO creations (user_id, prompt, content, type) 
    VALUES (${userId}, ${`Remove ${object} from image`}, ${imageUrl}, 'image')`;

    res.json({ success: true, content: imageUrl });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const resumeReview = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const resume = req.file;
    const plan = req.plan;

    if (plan !== "Premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions.",
      });
    }

    if(resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume file size exceeds the allowed size (5MB).",
      });
    }

    // Extract text from PDF resume
    const dataBuffer = fs.readFileSync(resume.path);
    // Convert Buffer → Uint8Array
    const uint8Array = new Uint8Array(dataBuffer);
    const {text} = await extractText(uint8Array);

    const prompt = `Review the following resume and provide constructive feedback on it's 
    strengths, weaknesses, and areas for improvement. Resume content:\n\n${text}`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_completion_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type) 
    VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;

    res.json({ success: true, content});
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { generateArticle, generateBlogTitle, generateImage, removeImageBackground, removeImageObject, resumeReview };
