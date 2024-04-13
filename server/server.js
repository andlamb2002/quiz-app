const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Middleware to parse JSON bodies

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

app.get('/flashcard_sets', async (req, res) => {
    try {
        const flashcardSets = await FlashcardSet.find();
        res.send(flashcardSets);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.patch('/flashcard_sets/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'cards'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const flashcardSet = await FlashcardSet.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!flashcardSet) {
            return res.status(404).send();
        }
        res.send(flashcardSet);
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

app.get('/api', (req, res) => {
    res.send({"message": "Hello world!"});
});

app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});