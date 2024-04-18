import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Flashcard from './Flashcard';
import { MdStarBorder, MdStar, MdEdit } from 'react-icons/md';

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

    const handleInputChange = async (cardId, field, value) => {
        const originalValue = flashcardSet.cards.find(c => c._id === cardId)[field];
    
        setFlashcardSet(prev => ({
            ...prev,
            cards: prev.cards.map(c => c._id === cardId ? { ...c, [field]: value } : c)
        }));
    
        try {
            await axios.patch(`http://localhost:5000/flashcard_sets/${setId}/cards/${cardId}`, {
                [field]: value
            });
        } catch (error) {
            console.error('Failed to update card:', error);
            setFlashcardSet(prev => ({
                ...prev,
                cards: prev.cards.map(c => c._id === cardId ? { ...c, [field]: originalValue } : c)
            }));
        }
    };

    const toggleStarred = async (card) => {
        setFlashcardSet(prev => ({
            ...prev,
            cards: prev.cards.map(c => c._id === card._id ? { ...c, starred: !c.starred } : c)
        }));

        try {
            await axios.patch(`http://localhost:5000/flashcard_sets/${setId}/cards/${card._id}`, {
                starred: !card.starred
            });
        } catch (error) {
            console.error('Failed to toggle starred status:', error);
            setFlashcardSet(prev => ({
                ...prev,
                cards: prev.cards.map(c => c._id === card._id ? { ...c, starred: card.starred } : c)
            }));
        }
    };

    const handleAddCard = async () => {
        const newCard = { term: 'New Term', definition: 'New Definition', starred: false };
        try {
            const response = await axios.post(`http://localhost:5000/flashcard_sets/${setId}/cards`, newCard);
            setFlashcardSet(prev => ({
                ...prev,
                cards: [...prev.cards, response.data]
            }));
        } catch (error) {
            console.error('Failed to add new card:', error);
        }
    };

    if (!flashcardSet) {
        return <div className="text-white">Loading...</div>;
    }

    return (
        <div className="flex flex-col">
            <div className="flex-grow">
                <Flashcard cards={flashcardSet.cards} />
            </div>
            <div className="w-3/5 mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white text-3xl">{flashcardSet.title}</h2>
                    <Link to={`/edit/${setId}`} className="bg-button text-white text-xl py-2 px-4 rounded flex items-center shadow-lg">
                        <MdEdit className="h-8 w-8 mr-2" /> Edit Set
                    </Link>
                </div>
                <p className="text-white text-xl">{flashcardSet.description}</p>
            </div>
            <ul className="divide-y divide-bg w-3/5 mx-auto shadow-lg">
                {flashcardSet.cards.map((card) => (
                    <li key={card._id} className="bg-bg2 p-4 flex justify-between items-center">
                        <div className="flex-grow">
                            <input 
                                className="w-1/3 text-white text-xl bg-transparent p-1 mr-2"
                                type="text" 
                                value={card.term} 
                                onChange={(e) => handleInputChange(card._id, 'term', e.target.value)} 
                                placeholder="Enter term"
                            />
                            <input 
                                className="w-3/5 text-white text-xl bg-transparent p-1"
                                type="text" 
                                value={card.definition} 
                                onChange={(e) => handleInputChange(card._id, 'definition', e.target.value)} 
                                placeholder="Enter definition"
                            />
                        </div>
                        <button onClick={() => toggleStarred(card)} className="text-button">
                            {card.starred ? <MdStar className="h-8 w-8" /> : <MdStarBorder className="h-8 w-8" />}
                        </button>
                    </li>
                ))}
            </ul>
            <div className="mx-auto">
                <button onClick={handleAddCard} className="bg-button text-white text-3xl py-2 px-4 rounded m-4 shadow-lg">
                    Add Card
                </button>
            </div>
        </div>
    );
}

export default View;
