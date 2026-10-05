function Settings({ onBack, onBirds, onMultiplayer }) {
    return (
        <div className="settingsPage">

            <h1>SETTINGS</h1>

            <button
                className="settingsOption"
                onClick={onBirds}
            >
                🐦 Birds
            </button>

            <button
                className="settingsOption"
                onClick={onMultiplayer}
            >
                👥 Multiplayer
            </button>

            <button className="settingsOption">
                🔊 Sound
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

export default Settings