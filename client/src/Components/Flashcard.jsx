import React, { useState } from 'react';

function Flashcard({ cards }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showTerm, setShowTerm] = useState(true); 

    const handleCardClick = () => {
        setShowTerm(!showTerm); 
    };

    const handleNext = () => {
        if (currentIndex < cards.length - 1) {
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

    if (!cards.length) {
        return <div>No cards available</div>;
    }

    const card = cards[currentIndex];
    return (
        <div>
            <div onClick={handleCardClick}>
                {showTerm ? card.term : card.definition}
            </div>
            <button onClick={handlePrev} disabled={currentIndex === 0}>Prev</button>
            <button onClick={handleNext} disabled={currentIndex === cards.length - 1}>Next</button>
        </div>
    );
}

export default Flashcard;
