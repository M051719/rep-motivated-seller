// dappier-search-client.js
// Client-side logic for Dappier search widget
const form = document.getElementById('dappier-search-form');
const resultDiv = document.getElementById('dappier-search-result');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = document.getElementById('dappier-query').value;
    resultDiv.textContent = 'Searching...';
    try {
      const res = await fetch('/api/dappier-search.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      if (res.ok) {
        resultDiv.textContent = data.response;
      } else {
        resultDiv.textContent = data.error || 'Error occurred.';
      }
    } catch (err) {
      resultDiv.textContent = 'Network error.';
    }
  });
}
