import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function View() {
    const { setId } = useParams();
    const [flashcardSet, setFlashcardSet] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/flashcard_sets/${setId}`);
                setFlashcardSet(response.data);
            } catch (error) {
                console.error('Error fetching set data:', error);
            }
        };
        fetchData();
    }, [setId]);

    const handleInputChange = async (card, field, value) => {
        const updatedCard = { ...card, [field]: value };
        try {
            await axios.patch(`http://localhost:5000/flashcard_sets/${setId}/cards/${card._id}`, updatedCard);
            setFlashcardSet({
                ...flashcardSet,
                cards: flashcardSet.cards.map(c => c._id === card._id ? { ...c, [field]: value } : c)
            });
        } catch (error) {
            console.error('Failed to update card:', error);
        }
    };

    const toggleStarred = async (card) => {
        const updatedCard = { ...card, starred: !card.starred };
        try {
            await axios.patch(`http://localhost:5000/flashcard_sets/${setId}/cards/${card._id}`, updatedCard);
            setFlashcardSet({
                ...flashcardSet,
                cards: flashcardSet.cards.map(c => c._id === card._id ? { ...c, starred: !c.starred } : c)
            });
        } catch (error) {
            console.error('Failed to toggle starred status:', error);
        }
    };

    const handleAddCard = async () => {
        const newCard = { term: 'New Term', definition: 'New Definition', starred: false };
        try {
            const response = await axios.post(`http://localhost:5000/flashcard_sets/${setId}/cards`, newCard);
            setFlashcardSet({
                ...flashcardSet,
                cards: [...flashcardSet.cards, response.data]
            });
        } catch (error) {
            console.error('Failed to add new card:', error);
        }
    };

    const handleDeleteCard = async (cardId) => {
        try {
            await axios.delete(`http://localhost:5000/flashcard_sets/${setId}/cards/${cardId}`);
            setFlashcardSet({
                ...flashcardSet,
                cards: flashcardSet.cards.filter(c => c._id !== cardId)
            });
        } catch (error) {
            console.error('Failed to delete card:', error);
        }
    };

    if (!flashcardSet) {
        return <div>Loading... or flashcard set not found</div>;
    }

    return (
        <div>
            <h1>Viewing {flashcardSet.title}</h1>
            <ul>
                {flashcardSet.cards.map((card, index) => (
                    <li key={card._id || index}>
                        <div>
                            <label>Term:</label>
                            <input 
                                type="text" 
                                value={card.term} 
                                onChange={(e) => handleInputChange(card, 'term', e.target.value)} 
                                placeholder="Enter term"
                            />
                        </div>
                        <div>
                            <label>Definition:</label>
                            <input 
                                type="text" 
                                value={card.definition} 
                                onChange={(e) => handleInputChange(card, 'definition', e.target.value)} 
                                placeholder="Enter definition"
                            />
                        </div>
                        <div>
                            <label>Starred:</label>
                            <input 
                                type="checkbox" 
                                checked={card.starred} 
                                onChange={() => toggleStarred(card)} 
                            />
                        </div>
                        <button onClick={() => handleDeleteCard(card._id)}>Delete Card</button>
                    </li>
                ))}
            </ul>
            <button onClick={handleAddCard}>Add New Card</button>
        </div>
    );
}

export default View;
