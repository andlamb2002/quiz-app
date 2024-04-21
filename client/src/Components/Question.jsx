

const Question = ({ question, onChange, response, showResults }) => {

    return (
        <div className={`bg-bg2 text-white p-4 rounded-lg mb-4 shadow-lg mx-auto py-6`}>
            <h4 className="text-3xl font-bold mb-2 pb-4">{question.term}</h4>
            <div className="flex flex-col text-xl space-y-2">
                {question.options.map((option, index) => (
                    <label key={option} className={`flex items-center ${showResults && option === question.correct ? 'text-green-500' : ''} ${showResults && response === option && option !== question.correct ? 'text-red-500' : ''}`}>
                        <input
                            type="radio"
                            name={question.term}
                            value={option}
                            checked={response === option}
                            onChange={() => onChange(question.term, option)}
                            disabled={showResults} 
                            className="text-primary focus:ring-primary h-4 w-4"
                        />
                        <span className="ml-2 flex-grow">{option}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default Question;