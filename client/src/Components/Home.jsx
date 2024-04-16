import React from 'react';
import { Link } from 'react-router-dom';
import { MdEdit, MdDelete } from 'react-icons/md';

function Home({ flashcardSets, onEdit, onDelete }) {
  return (
    <div className="flex justify-center items-start pt-10">
      <ul className="space-y-4 w-3/5">
        {flashcardSets.map(set => (
          <li key={set._id} className="flex justify-between items-center bg-bg2 p-4 rounded-lg shadow cursor-pointer">
            <Link to={`/view/${set._id}`} className="flex items-center space-x-2 flex-grow">
              <span className="text-white font-semibold"></span>
              <strong className="text-white">{set.title}</strong>
              <span className="text-white">{set.description}</span>
            </Link>
            <div className="flex space-x-2">
              <button onClick={(e) => {e.stopPropagation(); onEdit(set._id);}} className="p-2 rounded text-white bg-button hover:bg-opacity-75">
                <MdEdit className="h-5 w-5" />
              </button>
              <button onClick={(e) => {e.stopPropagation(); onDelete(set._id);}} className="p-2 rounded text-white bg-red-button hover:bg-opacity-75">
                <MdDelete className="h-5 w-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
