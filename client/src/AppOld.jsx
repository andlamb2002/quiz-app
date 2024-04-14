import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [newSet, setNewSet] = useState({
    title: '',
    description: '',
    cards: [{ term: '', definition: '', starred: false }]
  });

  useEffect(() => {
    fetchSets();
  }, []);

  const fetchSets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/flashcard_sets');
      setFlashcardSets(response.data);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  const handleInputChange = (e) => {
    setNewSet({ ...newSet, [e.target.name]: e.target.value });
  };

  const handleCardChange = (index, event) => {
    const updatedCards = newSet.cards.map((card, i) => {
      if (i === index) {
        return { ...card, [event.target.name]: event.target.value };
      }
      return card;
    });
    setNewSet({ ...newSet, cards: updatedCards });
  };

  const handleExistingCardChange = (setIndex, cardIndex, field, value) => {
    const updatedSets = [...flashcardSets];
    updatedSets[setIndex].cards[cardIndex][field] = value;
    setFlashcardSets(updatedSets);
  };

  const addCard = () => {
    const newCard = { term: '', definition: '', starred: false };
    setNewSet({ ...newSet, cards: [...newSet.cards, newCard] });
  };

  const removeCard = index => {
    const filteredCards = newSet.cards.filter((_, i) => i !== index);
    setNewSet({ ...newSet, cards: filteredCards });
  };

  const deleteSet = async (setId) => {
    try {
      await axios.delete(`http://localhost:5000/flashcard_sets/${setId}`);
      setFlashcardSets(flashcardSets.filter(set => set._id !== setId));
    } catch (error) {
      console.error('Failed to delete set: ', error);
    }
  };

  const updateSet = async (setId, index) => {
    const setToUpdate = flashcardSets[index];
    try {
      const response = await axios.patch(`http://localhost:5000/flashcard_sets/${setId}`, setToUpdate);
      const updatedSets = [...flashcardSets];
      updatedSets[index] = response.data;
      setFlashcardSets(updatedSets);
    } catch (error) {
      console.error('Failed to update set: ', error);
    }
  };

  const addNewCardToSet = async (setId) => {
    const newCard = { term: 'New Term', definition: 'New Definition', starred: false };
    try {
        const response = await axios.post(`http://localhost:5000/flashcard_sets/${setId}/cards`, newCard);
        const updatedSets = flashcardSets.map(set => {
            if (set._id === setId) {
                return { ...set, cards: [...set.cards, response.data] };  // response.data includes the _id
            }
            return set;
        });
        setFlashcardSets(updatedSets);
    } catch (error) {
        console.error('Failed to add new card: ', error);
    }
};

  const updateCard = async (setId, cardId, cardIndex, setIndex) => {
    if (!cardId) {
      console.error("Card ID is undefined, cannot update.");
      return;
    }
    const cardToUpdate = flashcardSets[setIndex].cards[cardIndex];
    try {
      const response = await axios.patch(`http://localhost:5000/flashcard_sets/${setId}/cards/${cardId}`, cardToUpdate);
      const updatedSets = [...flashcardSets];
      updatedSets[setIndex].cards[cardIndex] = response.data;
      setFlashcardSets(updatedSets);
    } catch (error) {
      console.error('Failed to update card: ', error);
    }
  };

  const deleteCard = async (setId, cardId, setIndex, cardIndex) => {
    try {
        // Ensure both setId and cardId are available
        if (!setId || !cardId) {
            console.error("Missing set ID or card ID.");
            return;  // Exit the function if no setId or cardId
        }

        const response = await axios.delete(`http://localhost:5000/flashcard_sets/${setId}/cards/${cardId}`);

        if (response.status === 204) {  // Check if the delete operation was successful
            const updatedSets = [...flashcardSets];
            if (updatedSets[setIndex] && updatedSets[setIndex].cards && updatedSets[setIndex].cards.length > cardIndex) {
                updatedSets[setIndex].cards.splice(cardIndex, 1);
                setFlashcardSets(updatedSets);
            } else {
                console.error("Card or set index out of bounds."); // Log if indices are incorrect
            }
        } else {
            console.error("Failed to delete card on the server, status code:", response.status);
        }
    } catch (error) {
        console.error('Failed to delete card: ', error);
    }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/flashcard_sets', newSet);
      setFlashcardSets([...flashcardSets, response.data]);
      setNewSet({ title: '', description: '', cards: [{ term: '', definition: '', starred: false }] }); // Reset form
    } catch (error) {
      console.error('Failed to add new set: ', error);
    }
  };

  return (
    <div>
      <h1>Flashcard Sets</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          value={newSet.title}
          onChange={handleInputChange}
          placeholder="Title"
          required
        />
        <input
          type="text"
          name="description"
          value={newSet.description}
          onChange={handleInputChange}
          placeholder="Description"
          required
        />
        {newSet.cards.map((card, index) => (
          <div key={index}>
            <input
              type="text"
              name="term"
              value={card.term}
              onChange={(e) => handleCardChange(index, e)}
              placeholder="Term"
              required
            />
            <input
              type="text"
              name="definition"
              value={card.definition}
              onChange={(e) => handleCardChange(index, e)}
              placeholder="Definition"
              required
            />
            <button type="button" onClick={() => removeCard(index)}>Remove Card</button>
          </div>
        ))}
        <button type="button" onClick={addCard}>Add Card</button>
        <button type="submit">Add Set</button>
      </form>
      <ul>
        {flashcardSets.map((set, index) => (
          <li key={set._id}>
            <strong>{set.title}</strong> - {set.description}
            <button onClick={() => deleteSet(set._id)}>Delete Set</button>
            <button onClick={() => updateSet(set._id, index)}>Save Changes</button>
            <button onClick={() => addNewCardToSet(set._id)}>Add New Card</button>
            {set.cards && set.cards.length > 0 && (
              <ul>
                {set.cards.map((card, cardIndex) => (
                  <li key={card._id || cardIndex}>
                    <input
                      type="text"
                      value={card.term}
                      onChange={(e) => handleExistingCardChange(index, cardIndex, 'term', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      value={card.definition}
                      onChange={(e) => handleExistingCardChange(index, cardIndex, 'definition', e.target.value)}
                      required
                    />
                    <button onClick={() => updateCard(set._id, card._id, cardIndex, index)}>Save Card</button>
                    <button onClick={() => deleteCard(set._id, card._id, index, cardIndex)}>Remove Card</button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
