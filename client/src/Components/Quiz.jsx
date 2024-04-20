import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Question from './Question';
import axios from 'axios';

const Quiz = () => {
    const { setId } = useParams();  
    const [questions, setQuestions] = useState([]);
    const [score, setScore] = useState(0);
    const [responses, setResponses] = useState({});

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                console.log(setId);
                const { data } = await axios.get(`http://localhost:5000//generate-quiz/${setId}`); 
                setQuestions(data.cards.map(card => ({
                    term: card.term,
                    options: [card.definition, ...card.incorrectAnswers],
                    correct: card.definition
                })));
            } catch (error) {
                console.error('Failed to fetch questions:', error);
            }
        };
        fetchQuestions();
    }, [setId]);

    const handleSubmit = () => {
        let newScore = 0;
        questions.forEach(q => {
            if (responses[q.term] === q.correct) {
                newScore++;
            }
        });
        setScore(newScore);
    };

    const handleOptionChange = (term, option) => {
        setResponses({
            ...responses,
            [term]: option
        });
    };

    return (
        <div>
            {questions.map(question => (
                <Question key={question.term} question={question} onChange={handleOptionChange} response={responses[question.term]} />
            ))}
            <button onClick={handleSubmit}>Submit</button>
            <p>Score: {score}/{questions.length}</p>
        </div>
    );
};

export default Quiz;
