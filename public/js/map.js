mapboxgl.accessToken = maptoken;

const map = new mapboxgl.Map({
  container: 'map',
  center: listing.geometry.coordinates,
  zoom: 8,
  style: 'mapbox://styles/mapbox/streets-v11'
});

new mapboxgl.Marker({ color: 'red' })
  .setLngLat(listing.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h4>${listing.location}</h4><p>Exact Location will be Provided after Booking</p>`
    )
  )
  .addTo(map);

