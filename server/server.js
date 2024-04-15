require('dotenv').config();  // This line loads the environment variables from your .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Middleware to parse JSON bodies

// const configuration = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY
// });
// const openai = new OpenAIApi(configuration);

app.post('/test', async (req, res) => {
    try {
        const response = await openai.createCompletion({
            model: "text-ada-001",
            prompt: "Hello, world!",
            max_tokens: 5
        });
        res.json(response.data.choices[0].text);
    } catch (error) {
        console.error("Failed to communicate with OpenAI:", error);
        res.status(500).send("Error communicating with OpenAI.");
    }
});

// async function generateDistractors(text) {
//     const response = await openai.createCompletion({
//         model: "text-ada-001",
//         prompt: `Generate three plausible distractors for the following definition:\n${text}`,
//         max_tokens: 150,
//         n: 3,
//         stop: ["\n"],
//         temperature: 0.7
//     });

//     return response.data.choices.map(choice => choice.text.trim());
// }

// app.post('/generate-distractors', async (req, res) => {
//     const { text } = req.body;
//     if (!text) {
//         return res.status(400).send('Text definition is required.');
//     }

//     try {
//         const distractors = await generateDistractors(text);
//         res.json({ distractors });
//     } catch (error) {
//         console.error("Error generating distractors:", error);
//         res.status(500).send('Failed to generate distractors.');
//     }
// });

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
        const savedCard = flashcardSet.cards[flashcardSet.cards.length - 1]; // Get the newly added card with _id
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
    const { id } = req.params;  // Extract the ID from the URL parameter
    try {
        const flashcardSet = await FlashcardSet.findById(id);  // Use mongoose to find by ID
        if (!flashcardSet) {
            return res.status(404).send('Flashcard set not found');  // Return 404 if no set is found
        }
        res.send(flashcardSet);  // Send the found flashcard set
    } catch (error) {
        console.error('Failed to fetch flashcard set:', error);
        res.status(500).send('Internal Server Error');  // Handle possible errors
    }
});

app.patch('/flashcard_sets/:id', async (req, res) => {
    const updates = req.body; // the updates could include any combination of title, description, and cards
    try {
        const flashcardSet = await FlashcardSet.findByIdAndUpdate(
            req.params.id, 
            { $set: updates }, // Apply only the changes specified in the request body
            { new: true, runValidators: true }
        );
        if (!flashcardSet) {
            return res.status(404).send(); // If no flashcard set is found, send a 404 response
        }
        res.send(flashcardSet); // Send back the updated flashcard set
    } catch (error) {
        res.status(400).send(error); // If an error occurs, send a 400 response with the error
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

        // Filter out the card that needs to be deleted instead of trying to remove it directly
        flashcardSet.cards = flashcardSet.cards.filter(card => card._id.toString() !== req.params.cardId);
        
        // Save the modified document
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