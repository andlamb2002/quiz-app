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
    const query = `${term}\n${definition}`;

    try {
        const apiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [
                {"role": "system", "content": "With the given term and a definition, create 3 fake multiple choice answers based off of the definition:"},
                {"role": "user", "content": query}
            ],
            temperature: 0.5,
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

        const choices = apiResponse.data.choices;
        const message = choices[0].message;
        if (!message) {
            throw new Error("Message object is undefined");
        }

        const answers = message.content;
        res.json({question: query, answers: answers});
    } catch (error) {
        console.error("OpenAI API Error", error.response ? error.response.data : error.message);
        res.status(500).send("Error processing your request with OpenAI API: " + (error.response ? error.response.data.error : error.message));
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