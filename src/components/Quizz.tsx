import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RegionProps, RegionsFC } from "../types/regions.type";
import { getShuffledIndexArray } from "../utils/helper";
import MapComponent from "./Map";

export default function QuizzComponent() {
  const [geo, setGeo] = useState<RegionsFC>();
  const [regions, setRegions] = useState<RegionProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarted, setStarted] = useState(false);
  const [order, setOrder] = useState<number[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<null | "correct" | "wrong">(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}data/regions.geojson`);
        if (!res.ok) throw new Error("Échec du chargement");
        const data = (await res.json()) as RegionsFC;
        setGeo(data);
        const list: RegionProps[] = data.features
          .filter((f) => f?.properties?.code && f?.properties?.nom)
          .map((f) => ({ code: f.properties.code, nom: f.properties.nom }));
        setRegions(list);
      } catch (e) {
        setError("Impossible de charger les données. Veuillez réessayer.");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const total = regions.length;

  const currentQuestion = useMemo<RegionProps | null>(() => {
    if (!isStarted || isFinished || order.length === 0 || total === 0)
      return null;
    return regions[order[currentIdx]];
  }, [isStarted, isFinished, order, currentIdx, regions, total]);

  const currentQuestionRef = useRef<typeof currentQuestion>(currentQuestion);
  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  const start = () => {
    if (total === 0) return;
    setOrder(getShuffledIndexArray(total));
    setCurrentIdx(0);
    setScore(0);
    setFeedback(null);
    setFinished(false);
    setStarted(true);
  };

  const next = useCallback(
    (isCorrect: boolean) => {
      setFeedback(isCorrect ? "correct" : "wrong");
      if (isCorrect) setScore((s) => s + 1);
      setTimeout(() => {
        setFeedback(null);
        setCurrentIdx((idx) => {
          const n = idx + 1;
          if (n >= total) {
            setFinished(true);
            return idx;
          }
          return n;
        });
      }, 400);
    },
    [total],
  );

  const handleRegionSelect = useCallback(
    (payload: RegionProps) => {
      const target = currentQuestionRef.current;
      if (!isStarted || isFinished || !target) return;
      next(payload.code === target.code);
    },
    [isStarted, isFinished, next],
  );

  if (isLoading)
    return <button aria-busy="true" aria-label="Chargement des données…" />;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      {!isStarted && (
        <button onClick={start} disabled={total === 0}>
          Commencer
        </button>
      )}
      {isStarted && (
        <>
          {!isFinished && currentQuestion && (
            <p>
              <progress value={currentIdx} max={total} />
              Choisis : <strong>{currentQuestion.nom}</strong>
              {feedback === "correct"
                ? " ✓"
                : feedback === "wrong"
                  ? " ✗"
                  : " "}
              - Question {currentIdx + 1} / {total} - Score {score} / {total}
            </p>
          )}
          {isFinished && (
            <p>
              🎉 Terminé ! Score : {score} / {total}{" "}
              <button onClick={start}>Rejouer</button>
            </p>
          )}
          {geo && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <MapComponent geo={geo} onRegionSelect={handleRegionSelect} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
