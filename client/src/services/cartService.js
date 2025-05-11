// cartService.js
export async function addToCart(bookId, quantity, token) {
  const response = await fetch('http://localhost:5259/api/Cart/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({ bookId, quantity })
  });

  if (!response.ok) {
    // handle error, maybe throw or return error message
    const error = await response.text();
    throw new Error(error);
  }
  return await response.json(); 
}
