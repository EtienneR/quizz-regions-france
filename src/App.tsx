import QuizzComponent from "./components/Quizz";

function App() {
  return (
    <div style={{ textAlign: "center" }}>
      <h1>Quizz des régions</h1>
      <QuizzComponent />

      <footer style={{marginTop: "2rem"}}>
        <p>
          <small>
            Développé sur React avec D3 et PicoCSS -{" "}
            <a
              href="https://github.com/EtienneR/quizz-regions-france"
              target="_blank"
            >
              Github
            </a>
          </small>
        </p>
      </footer>
    </div>
  );
}

export default App;
