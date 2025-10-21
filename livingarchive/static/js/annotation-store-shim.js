(function(){
  if (window.AnnotationStore) return;

  const listeners = new Set();
  const Store = {
    data: { type: 'FeatureCollection', features: [] },
    set(geojson) {
      Store.data = geojson || { type:'FeatureCollection', features: [] };
      listeners.forEach(fn => fn(Store.data));
    },
    add(feature) {
      Store.data.features.push(feature);
      listeners.forEach(fn => fn(Store.data, { type:'add', feature }));
    },
    remove(id) {
      const i = Store.data.features.findIndex(f => f.id === id);
      if (i >= 0) {
        const [feature] = Store.data.features.splice(i, 1);
        listeners.forEach(fn => fn(Store.data, { type:'remove', feature }));
      }
    },
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  };

  window.AnnotationStore = Store;
})();
