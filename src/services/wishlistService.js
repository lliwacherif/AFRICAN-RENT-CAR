import api from './api';

export const wishlistService = {
  /**
   * Fetches the user's wishlist from MongoDB.
   */
  getWishlist: async () => {
    const res = await api.get('/users/wishlist');
    return Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
  },

  /**
   * Toggles an item (add if not present, remove if present) in the user's MongoDB wishlist.
   */
  toggleItem: async (itemData) => {
    const res = await api.post('/users/wishlist', itemData);
    return Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
  },

  /**
   * Removes an item from the user's MongoDB wishlist.
   */
  removeItem: async (targetId) => {
    const res = await api.delete(`/users/wishlist/${encodeURIComponent(targetId)}`);
    return Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
  },

  /**
   * Clears all items from the user's MongoDB wishlist.
   */
  clearAll: async () => {
    const res = await api.delete('/users/wishlist');
    return Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
  },
};
