const StockService = {
  // Mock data for stock updates (replace with actual API calls)
  async updateStock(bookId, stockQuantity) {
    try {
      // Simulate API call to update stock
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ bookId, stockQuantity });
        }, 500);
      });
      return response;
    } catch (error) {
      throw new Error('Failed to update stock');
    }
  },

  // Simulate order fulfillment by reducing stock
  async fulfillOrder(orderId, books) {
    try {
      // Simulate API call to reduce stock for each book in the order
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve(books.map((book) => ({
            bookId: book.bookId,
            quantity: book.quantity,
            newStock: book.stockQuantity - book.quantity
          })));
        }, 500);
      });
      return response;
    } catch (error) {
      throw new Error('Failed to fulfill order');
    }
  },

  // Simulate stock replenishment
  async replenishStock(bookId, quantity) {
    try {
      // Simulate API call to add stock
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ bookId, quantityAdded: quantity });
        }, 500);
      });
      return response;
    } catch (error) {
      throw new Error('Failed to replenish stock');
    }
  }
};

export default StockService;