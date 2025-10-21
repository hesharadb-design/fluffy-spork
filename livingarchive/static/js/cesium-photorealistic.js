(function(){
  const container = document.getElementById('cesiumContainer');
  if (!container) return;

  const GOOGLE_KEY = window.GOOGLE_MAPS_API_KEY || 'AIzaSyD-ydwvOMijcOTBSMWs0-UGfP_4R-hVOos';
  if (!GOOGLE_KEY) console.warn('AIzaSyD-ydwvOMijcOTBSMWs0-UGfP_4R-hVOos');

 const viewer = new Cesium.Viewer('cesiumContainer', {
  animation: false,
  timeline: false,
  baseLayerPicker: false,
  geocoder: false,
  homeButton: false,
  sceneModePicker: false,
  navigationHelpButton: false,
  fullscreenButton: false,

  // ✅ Avoid Cesium ion: no world terrain, no world imagery
  terrain: undefined, // or: terrainProvider: new Cesium.EllipsoidTerrainProvider()

  // ✅ Give the globe some imagery without Ion
  imageryProvider: new Cesium.UrlTemplateImageryProvider({
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    credit: '© OpenStreetMap contributors'
  })
});
  window.cesiumViewer = viewer;

  (async () => {
    try {
      const GOOGLE_KEY = window.GOOGLE_MAPS_API_KEY || 'AIzaSyD-ydwvOMijcOTBSMWs0-UGfP_4R-hVOos'; // set this on the page
      const url = `https://tile.googleapis.com/v1/3dtiles/root.json?key=${encodeURIComponent(window.AIzaSyD-ydwvOMijcOTBSMWs0-UGfP_4R-hVOos)}`;
      const tileset = await Cesium.Cesium3DTileset.fromUrl(url, { maximumScreenSpaceError: 2.0 });
      viewer.scene.primitives.add(tileset);
      await tileset.readyPromise;
      viewer.scene.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(134.3, -12.4, 2500.0),
        duration: 2.0
      });
    } catch (err) {
      console.error('Failed to load 3D Tiles:', err);
    }
  })();

  // Mirror annotations
  const Store = window.AnnotationStore || { data:{type:'FeatureCollection',features:[]}, onChange(){}, add(){} };
  const idToEntity = new Map();

  function rebuild(fc){
    viewer.entities.removeAll();
    idToEntity.clear();
    (fc.features || []).forEach(f => {
      const [lng, lat] = f.geometry.coordinates;
      const title = f.properties.title || 'Annotation';
      const desc = f.properties.notes || '';
      const ent = viewer.entities.add({
        id: f.id || undefined,
        name: title,
        description: `<h3>${title}</h3><p>${desc}</p>`,
        position: Cesium.Cartesian3.fromDegrees(lng, lat, 0),
        point: { pixelSize: 10 },
        label: {
          text: title,
          pixelOffset: new Cesium.Cartesian2(0, -20),
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });
      idToEntity.set(ent.id, ent);
    });
  }

  if (Store.data) rebuild(Store.data);
  Store.onChange && Store.onChange(geojson => rebuild(geojson));

  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((click) => {
    let pos = viewer.scene.pickPosition(click.position);
    if (!pos) return;
    const carto = Cesium.Cartographic.fromCartesian(pos);
    const lat = Cesium.Math.toDegrees(carto.latitude);
    const lng = Cesium.Math.toDegrees(carto.longitude);
    const title = prompt('Pin title:');
    if (!title) return;
    const notes = prompt('Notes (optional):') || '';

    const feature = {
      type: 'Feature',
      id: crypto.randomUUID(),
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: { title, notes }
    };
    Store.add && Store.add(feature);
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
})();
