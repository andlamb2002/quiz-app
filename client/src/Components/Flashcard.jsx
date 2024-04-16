import React, { useState, useEffect } from 'react';
import { MdArrowBack, MdArrowForward, MdShuffle } from 'react-icons/md'; 

function Flashcard({ cards }) {
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
        <div className="bg-bg1 flex flex-col items-center pt-10">
            <div className="w-3/5 bg-bg2 p-8 rounded-lg shadow-lg relative cursor-pointer" onClick={handleCardClick}>
                <div className="text-white text-center text-2xl my-20">
                    {showTerm ? card.term : card.definition}
                </div>
            </div>
            <div className="flex items-center space-x-4 my-4">
                <button onClick={handlePrev} disabled={currentIndex === 0} className="text-white">
                    <MdArrowBack className="h-8 w-8" />
                </button>
                <span className="text-white text-lg">{currentIndex + 1}/{shuffledCards.length}</span>
                <button onClick={handleNext} disabled={currentIndex === shuffledCards.length - 1} className="text-white">
                    <MdArrowForward className="h-8 w-8" />
                </button>
            </div>
            <button onClick={handleShuffle} className="bg-button text-white py-2 px-4 rounded flex items-center mb-4">
                <MdShuffle className="h-8 w-8 mr-2" /> Shuffle
            </button>
        </div>
    );
}

export default Flashcard;
