// gallery.js
// Fetch and display all FSBO listings

fetch('/api/listings')
  .then(res => res.json())
  .then(listings => {
    const container = document.getElementById('gallery-list');
    if (!container) return;
    container.innerHTML = listings.map(listing => {
      const photos = Array.isArray(listing.photos) ? listing.photos : [];
      const imagesHtml = photos.map(photoUrl =>
        `<img src="${photoUrl}" alt="Home photo" style="max-width:100%;max-height:180px;border-radius:0.5rem;margin-bottom:0.5rem;" />`
      ).join('');
      return `
        <div class="gallery-card">
          ${imagesHtml}
          <h3>${listing.address}</h3>
          <p>${listing.bedrooms} bd | ${listing.bathrooms} ba | ${listing.sqft} sqft</p>
          <p><strong>$${listing.price.toLocaleString()}</strong></p>
          <p>Owner: ${listing.ownerName}</p>
        </div>
      `;
    }).join('');
  });