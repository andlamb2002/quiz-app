require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const OpenAI = require('openai');

const app = express();
app.use(cors()); 
app.use(express.json()); 

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post('/generate-answers', async (req, res) => {
    const { term, definition } = req.body;
    if (!term || !definition) {
        return res.status(400).send("Please provide both term and definition.");
    }

    const formattedDefinition = definition.trim().endsWith('.') ? definition.trim() : definition.trim() + '.';

    try {
        const apiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [
                {"role": "system", "content": "With the given definition, create 3 incorrect multiple choice answers labeled A) B) C) based off of the definition, similar length of definition."},
                {"role": "user", "content": formattedDefinition}
            ],
            temperature: 1,  
            max_tokens: 128,   
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!apiResponse || !apiResponse.data || !apiResponse.data.choices || !apiResponse.data.choices.length) {
            throw new Error("Invalid or empty API response");
        }

        const generatedAnswers = apiResponse.data.choices[0].message.content;
        const wrongAnswers = generatedAnswers.split('\n').map(answer => {
            let trimmedAnswer = answer.trim().replace(/^[a-z]\) /i, '');
            return trimmedAnswer.endsWith('.') ? trimmedAnswer : trimmedAnswer + '.';
        });

        res.json({
            term: term,
            correctDefinition: formattedDefinition,
            incorrectAnswers: wrongAnswers
        });

    } catch (error) {
        console.error("OpenAI API Error", error);
        res.status(500).send("Error processing your request with OpenAI API: " + (error.response ? error.response.data.error : error.message));
    }
});

app.post('/generate-quiz/:setId', async (req, res) => {
    try {
        const setId = req.params.setId;
        const flashcardSet = await FlashcardSet.findById(setId);
        if (!flashcardSet) {
            return res.status(404).send('Flashcard set not found');
        }

        const quizQuestions = await Promise.all(flashcardSet.cards.map(async (card) => {
            const formattedDefinition = card.definition.trim().endsWith('.') ? card.definition.trim() : card.definition.trim() + '.';
            const apiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-3.5-turbo",
                messages: [
                    {"role": "system", "content": "With the given definition, create 3 incorrect multiple choice answers labeled A) B) C) based off of the definition, similar length of definition."},
                    {"role": "user", "content": formattedDefinition}
                ],
                temperature: 1,
                max_tokens: 128,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!apiResponse || !apiResponse.data || !apiResponse.data.choices || !apiResponse.data.choices.length) {
                throw new Error("Invalid or empty API response for term: " + card.term);
            }

            const generatedAnswers = apiResponse.data.choices[0].message.content;
            const wrongAnswers = generatedAnswers.split('\n').map(answer => {
                let trimmedAnswer = answer.trim().replace(/^[a-z]\) /i, '');
                return trimmedAnswer.endsWith('.') ? trimmedAnswer : trimmedAnswer + '.';
            });

            return {
                term: card.term,
                correctDefinition: formattedDefinition,
                incorrectAnswers: wrongAnswers
            };
        }));

        res.json(quizQuestions);
    } catch (error) {
        console.error("OpenAI API Error", error);
        res.status(500).send("Error processing your request: " + (error.response ? error.response.data.error : error.message));
    }
});


const flashcardSchema = new mongoose.Schema({
    term: { type: String, required: true },
    definition: { type: String, required: true },
    starred: { type: Boolean, default: false }
});

const flashcardSetSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    cards: [flashcardSchema]
});

const FlashcardSet = mongoose.model('FlashcardSet', flashcardSetSchema);

mongoose.connect('mongodb://localhost:27017/quiz_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected successfully to MongoDB');
});

app.post('/flashcard_sets', async (req, res) => {
    const { title, description, cards } = req.body;
    try {
        const flashcardSet = new FlashcardSet({ title, description, cards });
        await flashcardSet.save();
        res.status(201).send(flashcardSet);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.post('/flashcard_sets/:setId/cards', async (req, res) => {
    const { term, definition, starred } = req.body;
    try {
        const flashcardSet = await FlashcardSet.findById(req.params.setId);
        if (!flashcardSet) {
            return res.status(404).send('Flashcard set not found');
        }
        const newCard = {
            term,
            definition,
            starred
        };
        flashcardSet.cards.push(newCard);
        await flashcardSet.save();
        const savedCard = flashcardSet.cards[flashcardSet.cards.length - 1]; 
        res.status(201).send(savedCard);
    } catch (error) {
        res.status(400).send(error);
    }
});


app.get('/flashcard_sets', async (req, res) => {
    try {
        const flashcardSets = await FlashcardSet.find();
        res.send(flashcardSets);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/flashcard_sets/:id', async (req, res) => {
    const { id } = req.params; 
    try {
        const flashcardSet = await FlashcardSet.findById(id); 
        if (!flashcardSet) {
            return res.status(404).send('Flashcard set not found'); 
        }
        res.send(flashcardSet); 
    } catch (error) {
        console.error('Failed to fetch flashcard set:', error);
        res.status(500).send('Internal Server Error');  
    }
});

app.patch('/flashcard_sets/:id', async (req, res) => {
    const updates = req.body;
    try {
        const flashcardSet = await FlashcardSet.findByIdAndUpdate(
            req.params.id, 
            { $set: updates },
            { new: true, runValidators: true }
        );
        if (!flashcardSet) {
            return res.status(404).send(); 
        }
        res.send(flashcardSet); 
    } catch (error) {
        res.status(400).send(error); 
    }
});

app.patch('/flashcard_sets/:setId/cards/:cardId', async (req, res) => {
    const { term, definition, starred } = req.body;
    try {
        const flashcardSet = await FlashcardSet.findById(req.params.setId);
        if (!flashcardSet) {
            return res.status(404).send('Flashcard set not found');
        }
        const card = flashcardSet.cards.id(req.params.cardId);
        if (!card) {
            return res.status(404).send('Card not found');
        }
        card.term = term ?? card.term;
        card.definition = definition ?? card.definition;
        card.starred = starred ?? card.starred;
        await flashcardSet.save();
        res.send(card);
    } catch (error) {
        res.status(400).send(error);
    }
});


app.delete('/flashcard_sets/:id', async (req, res) => {
    try {
        const flashcardSet = await FlashcardSet.findByIdAndDelete(req.params.id);
        if (!flashcardSet) {
            return res.status(404).send();
        }
        res.send(flashcardSet);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.delete('/flashcard_sets/:setId/cards/:cardId', async (req, res) => {
    try {
        const flashcardSet = await FlashcardSet.findById(req.params.setId);
        if (!flashcardSet) {
            return res.status(404).send('Flashcard set not found');
        }

        flashcardSet.cards = flashcardSet.cards.filter(card => card._id.toString() !== req.params.cardId);
        
        await flashcardSet.save();
        res.status(204).send();
    } catch (error) {
        console.error("Error in deleting card:", error);
        res.status(500).send(error.message);
    }
});

app.get('/api', (req, res) => {
    res.send({"message": "Hello world!"});
});

app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});