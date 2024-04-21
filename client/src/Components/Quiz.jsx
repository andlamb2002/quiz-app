import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Question from './Question';
import axios from 'axios';

const Quiz = () => {
    const { setId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [score, setScore] = useState(0);
    const [responses, setResponses] = useState({});
    const [submitted, setSubmitted] = useState(false); 
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        let mounted = true;  
        const fetchQuestions = async () => {
            setLoading(true); 
            try {
                const { data } = await axios.get(`http://localhost:5000/generate-quiz/${setId}`);
                const shuffledQuestions = data.map(card => {
                    const shuffledOptions = shuffleOptions([card.correctDefinition, ...card.incorrectAnswers]);
                    return {
                        term: card.term,
                        options: shuffledOptions,
                        correct: card.correctDefinition
                    };
                });

                if (mounted) {
                    setQuestions(shuffledQuestions); 
                    setLoading(false); 
                }
            } catch (error) {
                if (mounted) {
                    console.error('Failed to fetch questions:', error);
                    setLoading(false);
                }
            }
        };
        fetchQuestions();

        return () => {
            mounted = false; 
        };
    }, [setId]);

    const shuffleOptions = options => {
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        return options;
    };

    const handleSubmit = () => {
        let newScore = 0;
        questions.forEach(q => {
            if (responses[q.term] === q.correct) {
                newScore++;
            }
        });
        setScore(newScore);
        setSubmitted(true); 
    };

    const handleOptionChange = (term, option) => {
        setResponses({
            ...responses,
            [term]: option
        });
    };

    return (
        <div className="flex flex-col items-center py-6">
            <div className="w-3/5 space-y-6">
                {loading ? ( 
                    <div className="text-white text-xl">Loading...</div> 
                ) : (
                    questions.map(question => (
                        <Question
                            key={question.term}
                            question={question}
                            onChange={handleOptionChange}
                            response={responses[question.term]}
                            showResults={submitted}
                        />
                    ))
                )}
                {!loading && ( 
                    <>
                        <button
                            onClick={handleSubmit}
                            disabled={submitted}
                            className="bg-button text-white text-xl px-6 py-2 rounded shadow hover:bg-button-dark transition duration-300"
                        >
                            Submit
                        </button>
                        {submitted && (
                            <p className="text-white text-xl pt-4">Score: {score}/{questions.length}</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Quiz;
