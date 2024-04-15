import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Edit({ onSave }) {
  const [data, setData] = useState({ title: '', description: '', cards: [] });
  const { setId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (setId !== 'new') {
        try {
          const response = await axios.get(`http://localhost:5000/flashcard_sets/${setId}`);
          setData(response.data);
        } catch (error) {
          console.error('Error fetching set data:', error);
        }
      }
    };
    fetchData();
  }, [setId]);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleCardChange = (index, e) => {
    const newCards = data.cards.map((card, i) => {
      if (i === index) {
        return { ...card, [e.target.name]: e.target.value };
      }
      return card;
    });
    setData({ ...data, cards: newCards });
  };

  const handleToggleStar = (index) => {
    const newCards = data.cards.map((card, i) => {
      if (i === index) {
        return { ...card, starred: !card.starred };  
      }
      return card;
    });
    setData({ ...data, cards: newCards });
  };

  const addCard = () => {
    const newCards = [...data.cards, { term: '', definition: '', starred: false }];
    setData({ ...data, cards: newCards });
  };

  const removeCard = index => {
    const newCards = data.cards.filter((_, i) => i !== index);
    setData({ ...data, cards: newCards });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = setId !== 'new';
    const method = isEdit ? axios.patch : axios.post;
    const url = isEdit ? `http://localhost:5000/flashcard_sets/${setId}` : 'http://localhost:5000/flashcard_sets';
  
    try {
      const response = await method(url, data);
      onSave(response.data, isEdit);
      navigate('/');  
    } catch (error) {
      console.error('Failed to save the set:', error);
    }
  };

  return (
    <div>
      <h1>{setId === 'new' ? 'New Flashcard Set' : 'Edit Flashcard Set'}</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" value={data.title} onChange={handleChange} placeholder="Title" required />
        <input type="text" name="description" value={data.description} onChange={handleChange} placeholder="Description" required />
        {data.cards.map((card, index) => (
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
            <label>
              Starred:
              <input
                type="checkbox"
                checked={card.starred}
                onChange={() => handleToggleStar(index)}  
              />
            </label>
            <button type="button" onClick={() => removeCard(index)}>Delete Card</button>
          </div>
        ))}
        <button type="button" onClick={addCard}>Add Card</button>
        <button type="submit">Save</button>
        <button type="button" onClick={() => navigate('/')}>Cancel</button>  
      </form>
    </div>
  );
}

export default Edit;
