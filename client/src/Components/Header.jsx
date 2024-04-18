import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../Assets/Logo.jpg';  

const Header = ({ flashcardSets }) => {
    const location = useLocation();
    
    const getTitle = () => {
        if (location.pathname === "/") {
            return "Study Sets";
        } else if (location.pathname.startsWith("/view/")) {
            const setId = location.pathname.split("/")[2];
            const set = flashcardSets.find(set => set._id === setId);
            return set ? set.title : "View Set";  
        } else if (location.pathname.startsWith("/edit/")) {
            return location.pathname === "/edit/new" ? "Create Set" : "Edit Set";
        }
        return "";
    };

    return (
        <nav className="flex items-center justify-between bg-bg border-b-2">
            <div className="flex items-center">
                <Link to="/" className="shrink-0">
                    <img src={logo} alt="Home" className="w-48" /> 
                </Link>
                <h1 className="text-white text-4xl ml-8">{getTitle()}</h1> 
            </div>
            <div className="flex">
                <button 
                    className="bg-button text-white text-3xl rounded p-2 px-6 shadow-lg hover:bg-opacity-75" 
                    onClick={() => window.location.href = '/edit/new'}
                >
                    Create Set
                </button>
                <div className="w-48"></div>
            </div>
        </nav>
    );
};

export default Header;
