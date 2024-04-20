import React from 'react';

const Question = ({ question, onChange, response }) => {
    return (
        <div>
            <h4>{question.term}</h4>
            {question.options.map(option => (
                <label key={option}>
                    <input
                        type="radio"
                        name={question.term}
                        value={option}
                        checked={response === option}
                        onChange={() => onChange(question.term, option)}
                    />
                    {option}
                </label>
            ))}
        </div>
    );
};

export default Question;
