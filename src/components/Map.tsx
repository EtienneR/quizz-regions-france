import { geoMercator, geoPath } from "d3-geo";
import { select } from "d3-selection";
import type { FeatureCollection, Geometry } from "geojson";
import { useEffect, useMemo, useRef } from "react";
import type { RegionProps, RegionsFC } from "../types/regions.type";

type MapProps = {
  geo?: RegionsFC;
  onRegionSelect: (payload: RegionProps) => void;
  width?: number;
  height?: number;
  primaryColor?: string;
  hoverColor?: string;
};

export default function MapComponent({
  geo,
  onRegionSelect,
  width = 800,
  height = 600,
  primaryColor = "#03224c",
  hoverColor = "#0172ad",
}: MapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const projection = useMemo(() => {
    if (!geo) return null;
    return geoMercator().fitSize([width, height], geo);
  }, [geo, width, height]);

  const path = useMemo(() => {
    if (!projection) return null;
    return geoPath().projection(projection);
  }, [projection]);

  useEffect(() => {
    if (!svgRef.current || !geo || !projection || !path) return;

    const svg = select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
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
    width,
    height,
    primaryColor,
    hoverColor,
    projection,
    path,
  ]);

  return (
    <svg
      ref={svgRef}
      role="img"
      aria-label="Carte interactive des régions"
    ></svg>
  );
}
