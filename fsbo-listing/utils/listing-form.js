// listing-form.js
// Handle FSBO listing form submission and photo upload
const form = document.getElementById('listing-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const res = await fetch('/api/listings', {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      alert('Listing added!');
      form.reset();
      location.reload();
    } else {
      alert('Error adding listing.');
    }
  });
}