import { geoMercator, geoPath } from "d3-geo";
import { select } from "d3-selection";
import type { FeatureCollection, Geometry } from "geojson";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RegionProps, RegionsFC } from "../types/regions.type";

type MapProps = {
  geo?: RegionsFC;
  onRegionSelect: (payload: RegionProps) => void;
  primaryColor?: string;
  hoverColor?: string;
};

export default function MapComponent({
  geo,
  onRegionSelect,
  primaryColor = "#03224c",
  hoverColor = "#0172ad",
}: MapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1450, height: 459.5 });

  // Met à jour les dimensions quand la fenêtre est redimensionnée
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const projection = useMemo(() => {
    if (!geo || !dimensions.width || !dimensions.height) return null;
    return geoMercator().fitSize([dimensions.width, dimensions.height], geo);
  }, [geo, dimensions.width, dimensions.height]);

  const path = useMemo(() => {
    if (!projection) return null;
    return geoPath().projection(projection);
  }, [projection]);

  useEffect(() => {
    if (
      !svgRef.current ||
      !geo ||
      !projection ||
      !path ||
      !dimensions.width ||
      !dimensions.height
    )
      return;

    const svg = select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .style("background-color", "#fff");
    svg.selectAll("*").remove();

    svg
      .selectAll<SVGPathElement, FeatureCollection<Geometry>>("path")
      .data(geo.features)
      .join("path")
      .attr("d", path)
      .attr("fill", primaryColor)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .on("mouseover", function () {
        select(this)
          .attr("fill", hoverColor)
          .attr("stroke-width", 2)
          .attr("cursor", "pointer");
      })
      .on("mouseout", function () {
        select(this).attr("fill", primaryColor).attr("stroke-width", 1);
      })
      .on("click", (_, d) => {
        onRegionSelect(d.properties);
      });
  }, [
    geo,
    onRegionSelect,
    primaryColor,
    hoverColor,
    projection,
    path,
    dimensions.width,
    dimensions.height,
  ]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <svg
        ref={svgRef}
        role="img"
        aria-label="Carte interactive des régions"
      ></svg>
    </div>
  );
}
