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
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px' }}>
            <Link to="/">
                <img src={logo} alt="Home" style={{ width: '100px' }} /> 
            </Link>
            <h1>{getTitle()}</h1>
            <button onClick={() => window.location.href = '/edit/new'}>Create Set</button>
        </nav>
    );
};

export default Header;
