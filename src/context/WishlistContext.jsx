import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { wishlistService } from '../services/wishlistService';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user, openAuthModal } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch the user's wishlist directly from MongoDB when user logs in or switches account
  useEffect(() => {
    if (!user || (!user._id && !user.id)) {
      setWishlist([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    wishlistService
      .getWishlist()
      .then((items) => {
        if (isMounted) {
          setWishlist(items || []);
        }
      })
      .catch((err) => {
        console.error('Error fetching user wishlist from MongoDB:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const isFavorite = useCallback(
    (id) => {
      if (!user || !id) return false;
      const strId = String(id);
      return wishlist.some(
        (entry) =>
          String(entry.id) === strId ||
          String(entry.targetId) === strId ||
          String(entry._id) === strId
      );
    },
    [user, wishlist]
  );

  const toggleFavorite = useCallback(
    async (item, type = 'car') => {
      // If user is not authenticated, prompt them to log in to their account!
      if (!user) {
        if (openAuthModal) {
          openAuthModal('login');
        } else {
          alert('Veuillez vous connecter à votre compte pour ajouter des favoris.');
        }
        return false;
      }

      if (!item) return false;
      const id = String(item._id || item.id);
      if (!id) return false;

      // Optimistic update
      const exists = wishlist.some(
        (entry) =>
          String(entry.id) === id ||
          String(entry.targetId) === id ||
          String(entry._id) === id
      );

      let prevList = [...wishlist];
      if (exists) {
        setWishlist((prev) =>
          prev.filter(
            (entry) =>
              String(entry.id) !== id &&
              String(entry.targetId) !== id &&
              String(entry._id) !== id
          )
        );
      } else {
        const optimisticEntry = {
          id,
          type,
          item,
          savedAt: new Date().toISOString(),
        };
        setWishlist((prev) => [optimisticEntry, ...prev]);
      }

      // Persist directly to MongoDB
      try {
        const updatedList = await wishlistService.toggleItem({ id, type, item });
        setWishlist(updatedList || []);
        return !exists;
      } catch (err) {
        console.error('Failed to update wishlist in MongoDB:', err);
        // Rollback on error
        setWishlist(prevList);
        return exists;
      }
    },
    [user, wishlist, openAuthModal]
  );

  const removeFromWishlist = useCallback(
    async (id) => {
      if (!user || !id) return;
      const strId = String(id);

      // Optimistic update
      setWishlist((prev) =>
        prev.filter(
          (entry) =>
            String(entry.id) !== strId &&
            String(entry.targetId) !== strId &&
            String(entry._id) !== strId
        )
      );

      try {
        const updatedList = await wishlistService.removeItem(strId);
        setWishlist(updatedList || []);
      } catch (err) {
        console.error('Failed to remove item from MongoDB wishlist:', err);
      }
    },
    [user]
  );

  const clearWishlist = useCallback(async () => {
    if (!user) return;
    setWishlist([]);

    try {
      await wishlistService.clearAll();
    } catch (err) {
      console.error('Failed to clear wishlist in MongoDB:', err);
    }
  }, [user]);

  const cars = useMemo(
    () => wishlist.filter((w) => w.type === 'car').map((w) => w.item),
    [wishlist]
  );

  const apartments = useMemo(
    () => wishlist.filter((w) => w.type === 'apartment').map((w) => w.item),
    [wishlist]
  );

  const excursions = useMemo(
    () => wishlist.filter((w) => w.type === 'excursion').map((w) => w.item),
    [wishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        cars,
        apartments,
        excursions,
        count: wishlist.length,
        loading,
        isFavorite,
        toggleFavorite,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return ctx;
}
