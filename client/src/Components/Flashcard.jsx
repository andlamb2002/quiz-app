import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdArrowForward, MdShuffle, MdStar, MdStarBorder } from 'react-icons/md'; 

function Flashcard({ cards, setId, toggleFilterStarred, showOnlyStarred, areStarredCardsAvailable }) {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showTerm, setShowTerm] = useState(true); 
    const [shuffledCards, setShuffledCards] = useState([...cards]);

    useEffect(() => {
        setShuffledCards([...cards]); 
    }, [cards]);

    const handleCardClick = () => {
        setShowTerm(!showTerm); 
    };

    const handleNext = () => {
        if (currentIndex < shuffledCards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowTerm(true); 
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setShowTerm(true);
        }
    };

    const shuffleCards = () => {
        let newShuffledCards = [...shuffledCards];
        for (let i = newShuffledCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newShuffledCards[i], newShuffledCards[j]] = [newShuffledCards[j], newShuffledCards[i]];
        }
        return newShuffledCards;
    };

    const handleShuffle = () => {
        setCurrentIndex(0); 
        setShuffledCards(shuffleCards());
    };

    if (!shuffledCards.length) {
        return <div className="text-white">This set has no cards</div>;
    }

    const card = shuffledCards[currentIndex];

    return (
        <div className="bg-bg1 flex flex-col items-center pt-10 mb-4">
            <div className="w-3/5 bg-bg2 p-8 rounded-lg shadow-xl relative items-center cursor-pointer" onClick={handleCardClick}>
                <div className={`text-white text-center ${showTerm ? 'text-5xl' : 'text-3xl'} h-80 flex justify-center items-center break-all overflow-auto mx-auto px-4 py-2`}>
                    {showTerm ? card.term : card.definition}
                </div>
            </div>

            <div className="flex items-center justify-between w-3/5 my-4">
                <div className="flex space-x-4">
                    <button onClick={handleShuffle} className="bg-button text-white text-3xl p-2 rounded flex items-center shadow-lg hover:bg-opacity-75">
                        <MdShuffle className="h-8 w-8" />
                    </button>
                    <button disabled={!areStarredCardsAvailable} onClick={toggleFilterStarred} className="bg-button text-white text-3xl p-2 rounded flex items-center shadow-lg hover:bg-opacity-75">
                        {showOnlyStarred ? <MdStar className="h-8 w-8" /> : <MdStarBorder className="h-8 w-8" />}
                    </button>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={handlePrev} disabled={currentIndex === 0} className="text-white">
                        <MdArrowBack className="h-8 w-8" />
                    </button>

                    <span className="text-white text-xl">{currentIndex + 1}/{shuffledCards.length}</span>
                    
                    <button onClick={handleNext} disabled={currentIndex === shuffledCards.length - 1} className="text-white">
                        <MdArrowForward className="h-8 w-8" />
                    </button>
                </div>
                <button
                    onClick={() => navigate(`/quiz/${setId}`)}
                    className="bg-button text-white text-3xl ml-2 py-2 px-6 rounded flex items-center shadow-lg hover:bg-opacity-75">
                    Test
                </button>
            </div>
        </div>
    );
}

export default Flashcard;
