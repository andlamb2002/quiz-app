import React from 'react';
import { Link } from 'react-router-dom';

function Home({ flashcardSets, onEdit, onDelete }) {
  return (
    <div>
      <h1>Study Sets</h1>
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
