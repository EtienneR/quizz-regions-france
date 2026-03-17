import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
} from "geojson";

type RegionGeom = Polygon | MultiPolygon;
export type RegionProps = { code: string; nom: string };
export type RegionFeature = Feature<RegionGeom, RegionProps>;
export type RegionsFC = FeatureCollection<RegionGeom, RegionProps>;