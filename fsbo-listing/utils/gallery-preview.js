// gallery-preview.js
// Fetch and display a few featured listings for the landing page
fetch('/api/listings?featured=true')
  .then(res => res.json())
  .then(listings => {
    const container = document.getElementById('gallery-preview-list');
    if (!container) return;
    container.innerHTML = listings.map(listing => `
      <div class="gallery-card">
        <img src="${listing.photos[0]}" alt="Home photo" />
        <h3>${listing.address}</h3>
        <p>${listing.bedrooms} bd | ${listing.bathrooms} ba | ${listing.sqft} sqft</p>
        <p><strong>$${listing.price.toLocaleString()}</strong></p>
      </div>
    `).join('');
  });