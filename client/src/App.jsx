import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/Home';
import Edit from './Components/Edit';
import View from './Components/View';
import Header from './Components/Header';
import Quiz from './Components/Quiz';
import axios from 'axios';

function App() {
    const [flashcardSets, setFlashcardSets] = useState([]);

    useEffect(() => {
        const fetchSets = async () => {
            try {
                const response = await axios.get('http://localhost:5000/flashcard_sets');
                setFlashcardSets(response.data);
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };
        fetchSets();
    }, []);

    const handleAddNew = () => {
        window.location = '/edit/new';
    };

    const handleEdit = (id) => {
        window.location = `/edit/${id}`;
    };

    const handleSave = (newData, isEdit) => {
        const updatedSets = newData._id && isEdit
            ? flashcardSets.map(set => set._id === newData._id ? newData : set)
            : [...flashcardSets, newData];
        setFlashcardSets(updatedSets);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/flashcard_sets/${id}`);
            setFlashcardSets(flashcardSets.filter(set => set._id !== id));
        } catch (error) {
            console.error('Failed to delete set:', error);
        }
    };

    return (
        <Router>
            <div className="flex flex-col h-screen">
                <nav className="bg-bg1">
                    <Header flashcardSets={flashcardSets} />
                </nav>
                <div className="bg-bg1 flex-1 overflow-auto">
                    <Routes>
                        <Route path="/" element={<Home flashcardSets={flashcardSets} onAddNew={handleAddNew} onEdit={handleEdit} onDelete={handleDelete} />} exact />
                        <Route path="/edit/:setId" element={<Edit onSave={handleSave} />} />
                        <Route path="/view/:setId" element={<View />} />
                        <Route path="/quiz/:setId" element={<Quiz />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
