import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdAdd, MdDelete, MdSave, MdCancel } from 'react-icons/md'; 
import axios from 'axios';

function Edit({ onSave }) {
  const [data, setData] = useState({ title: '', description: '', cards: [] });
  const [error, setError] = useState(false);  
  const { setId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (setId !== 'new') {
        try {
          const response = await axios.get(`http://localhost:5000/flashcard_sets/${setId}`);
          if (response.data) {
            setData(response.data);
            setError(false);  
          } else {
            setError(true); 
          }
        } catch (error) {
          console.error('Error fetching set data:', error);
          setError(true);  
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

  if (error) {
    return <div className="text-white">Set not found</div>;
  }

  return (
    <div className="bg-bg1 flex justify-center items-start pt-10 pb-4">
      <div className="w-3/5">
        <h1 className="text-white text-2xl mb-4">{setId === 'new' ? 'New Flashcard Set' : 'Edit Flashcard Set'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="text" name="title" value={data.title} onChange={handleChange} placeholder="Title" required className="w-full p-2 bg-bg2 text-white rounded" />
          <input type="text" name="description" value={data.description} onChange={handleChange} placeholder="Description" required className="w-full p-2 bg-bg2 text-white rounded" />
          
          <div className="space-y-4">
            <div className="text-white text-lg mb-2">Terms</div>
            {data.cards.map((card, index) => (
              <div key={index} className="bg-bg2 rounded p-4 relative">
                <input
                  type="text"
                  name="term"
                  value={card.term}
                  onChange={(e) => handleCardChange(index, e)}
                  placeholder="Term"
                  required
                  className="w-2/5 p-2 bg-bg2 text-white rounded mr-2"
                />
                <input
                  type="text"
                  name="definition"
                  value={card.definition}
                  onChange={(e) => handleCardChange(index, e)}
                  placeholder="Definition"
                  required
                  className="w-2/5 p-2 bg-bg2 text-white rounded"
                />
                <button type="button" onClick={() => removeCard(index)} className="absolute right-0 top-0 text-white p-2">
                  <MdDelete className="h-8 w-8" />
                </button>
              </div>
            ))}
            <button type="button" onClick={addCard} className="w-full py-2 bg-button text-white rounded flex justify-center items-center">
              <MdAdd className="h-8 w-8 mr-2" /> Add Card
            </button>
          </div>
          <div className="flex justify-between">
            <button type="button" onClick={() => navigate('/')} className="bg-red-button text-white py-2 px-4 rounded flex items-center">
              <MdCancel className="h-8 w-8 mr-2" /> Cancel
            </button>
            <button type="submit" className="bg-button text-white py-2 px-4 rounded flex items-center">
              <MdSave className="h-8 w-8 mr-2" /> Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Edit;
