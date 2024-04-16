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
        <nav className="flex items-center justify-between bg-bg">
            <Link to="/" className="shrink-0">
                <img src={logo} alt="Home" className="w-24" /> 
            </Link>
            <h1 className="text-white text-xl">{getTitle()}</h1> 
            <button 
                className="bg-button text-white rounded" 
                onClick={() => window.location.href = '/edit/new'}
            >
                Create Set
            </button>
        </nav>
    );
};

export default Header;
