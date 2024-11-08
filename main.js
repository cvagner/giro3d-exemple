import { Vector3 } from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls.js";

import TileWMS from "ol/source/TileWMS.js";

import Instance from "@giro3d/giro3d/core/Instance.js";
import Extent from "@giro3d/giro3d/core/geographic/Extent.js";
import Map from "@giro3d/giro3d/entities/Map.js";
import ColorLayer from "@giro3d/giro3d/core/layer/ColorLayer.js";
import ElevationLayer from "@giro3d/giro3d/core/layer/ElevationLayer.js";
import BilFormat from "@giro3d/giro3d/formats/BilFormat.js";
import TiledImageSource from "@giro3d/giro3d/sources/TiledImageSource.js";

// Non nécessaire pour 3857
// Instance.registerCRS(
//   "EPSG:3857",
//   "+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs",
// );

const instance = new Instance({
  target: "view",
  crs: "EPSG:3857",
});

// Saint-Claude
const margin_m = 10*1000;
const xmin = 637267.571998511 - margin_m;
const xmax = 637267.571998511 + margin_m;
const ymin = 5848334.480386668 - margin_m;
const ymax = 5848334.480386668 + margin_m;

const extent = new Extent("EPSG:3857", xmin, xmax, ymin, ymax);

const map = new Map({
  extent
});
instance.add(map);

const satelliteSource = new TiledImageSource({
  source: new TileWMS({
    url: "https://data.geopf.fr/wms-r",
    projection: "EPSG:3857",
    params: {
      LAYERS: ["HR.ORTHOIMAGERY.ORTHOPHOTOS"],
      FORMAT: "image/jpeg",
    },
  }),
});
const colorLayer = new ColorLayer({
  name: "satellite",
  source: satelliteSource,
  extent: map.extent,
});
map.addLayer(colorLayer);

const demSource = new TiledImageSource({
  source: new TileWMS({
    url: "https://data.geopf.fr/wms-r",
    projection: "EPSG:3857",
    crossOrigin: "anonymous",
    params: {
      // ELEVATION.ELEVATIONGRIDCOVERAGE.HIGHRES.MNS : MNS
      // ELEVATION.ELEVATIONGRIDCOVERAGE.HIGHRES : MNT
      // ELEVATION.ELEVATIONGRIDCOVERAGE.SRTM3 : MNT SRTM3 construit par la NASA et le NGA.
      LAYERS: ["ELEVATION.ELEVATIONGRIDCOVERAGE.HIGHRES.MNS"],
      FORMAT: "image/x-bil;bits=32",
    },
  }),
  format: new BilFormat(),
  noDataValue: -1000,
});
const elevationLayer = new ElevationLayer({
  name: "dem",
  extent: map.extent,
  source: demSource,
});
map.addLayer(elevationLayer);

const camera = instance.view.camera;
const cameraAltitude = 2000;
const cameraPosition = new Vector3(extent.west, extent.south, cameraAltitude);
camera.position.copy(cameraPosition);

const controls = new MapControls(camera, instance.domElement);

controls.target = extent.centerAsVector3();
controls.enableDamping = true;
controls.dampingFactor = 0.2;
controls.maxPolarAngle = Math.PI / 2.3;

controls.saveState();

instance.view.setControls(controls);

