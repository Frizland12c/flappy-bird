import FlappyBird from '../game/FlappyBird'

function Home({ onSettings, selectedBird }) {
    return (
        <div className="home">
            <button
                className="settingsButton"
                onClick={onSettings}
            >
                ⚙️
            </button>
            <FlappyBird selectedBird={selectedBird} />
        </div>
    )
}

export default Home