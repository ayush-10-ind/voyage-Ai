export interface MapWaypoint {
  id: string;
  title: string;
  lat: number;
  lng: number;
  sequence: number;
  category?: string;
  time?: string;
}

export interface MapProvider {
  id: string;
  name: string;
  /**
   * Initializes and renders the map on the given container.
   * Returns a cleanup function.
   */
  renderMap(
    container: HTMLDivElement,
    waypoints: MapWaypoint[],
    activeWaypointId: string | null,
    onSelectWaypoint?: (id: string) => void
  ): () => void;
}
