import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { clerkMiddleware } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';

const app = express();

await connectCloudinary();

const PORT = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

//routes
app.get('/', (req, res) => res.send('Server is live!'));
app.use('/api/ai', aiRouter);
app.use('/api/user', userRouter);

app.listen(PORT, () => {
    console.log('Server is running on port', PORT);
}).on('error', (err) => {
    console.error('Server error:', err);
});