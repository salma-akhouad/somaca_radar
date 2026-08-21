import { MapControls } from './MapControls'
import { MapLegend } from './MapLegend'
export function MapStage() { return <section className="map-stage" aria-label="Zone de cartographie 3D Montage"><div className="map-stage__grid" aria-hidden="true" /><div className="map-stage__placeholder"><span>À VENIR</span><h2>3D Montage Map Stage</h2><p>La cartographie industrielle en temps réel sera intégrée ici.</p></div><MapLegend /><MapControls /></section> }
