function Birds({ onBack, selectedBird, onSelectBird }) {
    return (
        <div className="birdsPage">

            <h1>SELECT BIRD</h1>
            <p>Selected: {selectedBird}</p>

            <button onClick={() => onSelectBird('normal')}>
                🐤 Normal Bird
            </button>

            <button onClick={() => onSelectBird('crow')}>
                🐦‍⬛ Crow
            </button>

            <button onClick={() => onSelectBird('eagle')}>
                🦅 Eagle
            </button>

            <button onClick={() => onSelectBird('pigeon')}>
                🕊️ Pigeon
            </button>

            <button
                className="backButton"
                onClick={onBack}
            >
                ← Back
            </button>

        </div>
    )
}

export default Birds