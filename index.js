import express from "express"
import multer from "multer"
import path from "path"
import { marked } from "marked";
import dotenv from "dotenv";
import extractTextFromDocuments from "./utils/extract.js";
import { generateFromPrompt, generatePdfSummary } from "./utils/gemini.js";
dotenv.config();



const port = process.env.PORT || 4000
const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');


// Configure multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // File naming
    }
});

const upload = multer({ storage: storage });



app.get('/', (req, res) => {
    res.render('home');
});

app.get('/chat', (req, res) => {
    res.render('conversation');
});

app.post('/chat', upload.single('document'), async (req, res) => {
    try {
        let { prompt, url } = req.body
        let result = ""

        if (url) {
            let text = await extractTextFromDocuments(url);
            text += prompt || "Can you summarize this document as a bulleted list."
            result = await generateFromPrompt(text)
            prompt = url + " - " + (prompt || "Summarizing the document ...")

        } else if (req.file) {
            let { filename, originalname } = req.file
            result = await generatePdfSummary(filename, prompt)
            prompt = originalname + " - " + (prompt || "Summarizing the document ...")

        } else {
            result = await generateFromPrompt(prompt)
        }
        const htmlContent = marked(result);

        res.render('chat', { question: prompt, answer: htmlContent });
    } catch (error) {
        res.render('error', { message: "Error occured while reading the file buffers" })
    }
});

app.get('*', (req, res) => {
    res.render('error', { message: "Page not found" })
});


app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`)
})