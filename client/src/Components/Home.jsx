import React from 'react';
import { Link } from 'react-router-dom';

function Home({ flashcardSets, onAddNew, onEdit, onDelete }) {
  return (
    <div>
      <h1>Flashcard Sets</h1>
      <button onClick={onAddNew}>Add New Set</button>
      <ul>
        {flashcardSets.map(set => (
          <li key={set._id}>
            <strong>
              <Link to={`/view/${set._id}`}>{set.title}</Link>
            </strong> - {set.description}
            <button onClick={() => onEdit(set._id)}>Edit</button>
            <button onClick={() => onDelete(set._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
