import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Don't forget to install axios

function App() {
  const [flashcardSets, setFlashcardSets] = useState([]); // State to store fetched flashcard sets
  const [newSet, setNewSet] = useState({
    title: '',
    description: '',
    cards: [{ term: '', definition: '', starred: false }]
  }); // State for the new flashcard set form

  useEffect(() => {
    fetchSets();
  }, []);

  // Function to fetch flashcard sets from the server
  const fetchSets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/flashcard_sets');
      setFlashcardSets(response.data);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  // Function to handle input changes for set title and description
  const handleInputChange = (e) => {
    setNewSet({ ...newSet, [e.target.name]: e.target.value });
  };

  // Function to handle card changes within a new set
  const handleCardChange = (index, event) => {
    const updatedCards = newSet.cards.map((card, i) => {
      if (i === index) {
        return { ...card, [event.target.name]: event.target.value };
      }
      return card;
    });

    setNewSet({ ...newSet, cards: updatedCards });
  };

  // Function to handle changes to cards in existing sets
  const handleExistingCardChange = (setIndex, cardIndex, field, value) => {
    const updatedSets = [...flashcardSets];
    updatedSets[setIndex].cards[cardIndex][field] = value;
    setFlashcardSets(updatedSets);
  };

  // Function to add a new card to the current set form
  const addCard = () => {
    const newCard = { term: '', definition: '', starred: false };
    setNewSet({ ...newSet, cards: [...newSet.cards, newCard] });
  };

  // Function to remove a card from the new set form
  const removeCard = index => {
    const filteredCards = newSet.cards.filter((_, i) => i !== index);
    setNewSet({ ...newSet, cards: filteredCards });
  };

  // Function to remove a card from an existing set
  const removeExistingCard = (setIndex, cardIndex) => {
    const updatedSets = [...flashcardSets];
    updatedSets[setIndex].cards.splice(cardIndex, 1);
    setFlashcardSets(updatedSets);
  };

  // Function to delete a flashcard set
  const deleteSet = async (setId) => {
    try {
      await axios.delete(`http://localhost:5000/flashcard_sets/${setId}`);
      setFlashcardSets(flashcardSets.filter(set => set._id !== setId));
    } catch (error) {
      console.error('Failed to delete set: ', error);
    }
  };

  // Function to update a flashcard set
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

  // Function to handle form submission for new sets
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
            {set.cards && set.cards.length > 0 && (
              <ul>
                {set.cards.map((card, cardIndex) => (
                  <li key={card._id}>
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
                    <button type="button" onClick={() => removeExistingCard(index, cardIndex)}>Remove Card</button>
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
