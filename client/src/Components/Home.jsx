import React from 'react';
import { Link } from 'react-router-dom';
import { MdEdit, MdDelete } from 'react-icons/md';

function Home({ flashcardSets, onEdit, onDelete }) {
  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...'; 
    }
    return text;
  };

  return (
    <div className="flex justify-center items-start pt-10">
      <ul className="space-y-4 w-3/5">
          {flashcardSets.map(set => (
              <li key={set._id} className="flex justify-between items-center bg-bg2 p-4 rounded-lg shadow-lg cursor-pointer">
                  <Link to={`/view/${set._id}`} className="flex items-center space-x-4 flex-grow">
                      <strong className="text-white text-3xl mr-2 w-1/3 overflow-hidden text-overflow-ellipsis break-all">
                        {truncateText(set.title, 30)}
                      </strong>
                      <span className="text-white text-xl w-3/5 overflow-hidden text-overflow-ellipsis break-all">
                        {truncateText(set.description, 100)}
                      </span>
                  </Link>
                  <div className="flex space-x-2">
                      <button onClick={(e) => {e.stopPropagation(); onEdit(set._id);}} className="p-2 rounded text-white bg-button hover:bg-opacity-75">
                          <MdEdit className="h-8 w-8" />
                      </button>
                      <button onClick={(e) => {e.stopPropagation(); onDelete(set._id);}} className="p-2 rounded text-white bg-red-button hover:bg-opacity-75">
                          <MdDelete className="h-8 w-8" />
                      </button>
                  </div>
              </li>
          ))}
      </ul>
    </div>
  );
}

export default Home;
