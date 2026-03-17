import QuizzComponent from "./components/Quizz";

function App() {
  return (
    <div style={{ textAlign: "center" }}>
      <h1>Quizz des régions</h1>
      <QuizzComponent />

      <footer>
        <p>
          <small>Développé sur React avec D3 et PicoCSS</small>
        </p>
      </footer>
    </div>
  );
}

export default App;
