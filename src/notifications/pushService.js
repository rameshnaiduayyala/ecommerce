import OneSignal from './onesignal';

/**
 * High-level Push Notification Service for Ecommerce Scenarios
 */
export const pushService = {
  /**
   * Request push notification permission from the user
   * Typically called when a user finishes onboarding or shows high intent.
   */
  requestPermission: async () => {
    try {
      await OneSignal.Slidedown.promptPush();
    } catch (error) {
      console.error('Failed to request push permission:', error);
    }
  },

  /**
   * Associate the current push subscription with a specific user ID
   * @param {string} userId - The user's unique ID (e.g., from Supabase)
   */
  loginUser: async (userId) => {
    try {
      if (userId) {
        await OneSignal.login(userId);
      }
    } catch (error) {
      console.error('Failed to login to OneSignal:', error);
    }
  },

  /**
   * Remove the association when the user logs out
   */
  logoutUser: async () => {
    try {
      await OneSignal.logout();
    } catch (error) {
      console.error('Failed to logout from OneSignal:', error);
    }
  },

  /**
   * Add tags to the user for segmented marketing
   * @param {Object} tags - Key-value pairs of tags
   */
  addTags: (tags) => {
    try {
      OneSignal.User.addTags(tags);
    } catch (error) {
      console.error('Error adding OneSignal tags:', error);
    }
  },

  /**
   * Remove specific tags
   * @param {Array<string>} keys - Tag keys to remove
   */
  removeTags: (keys) => {
    try {
      OneSignal.User.removeTags(keys);
    } catch (error) {
      console.error('Error removing OneSignal tags:', error);
    }
  },

  /**
   * E-commerce specific tag helpers
   */
  tagAbandonedCart: (hasAbandonedCart) => {
    pushService.addTags({ abandoned_cart: hasAbandonedCart ? 'true' : 'false' });
  },

  tagVIPCustomer: () => {
    pushService.addTags({ customer_tier: 'VIP' });
  },

  tagInterestedCategories: (categories) => {
    // E.g. categories = ['cakes', 'chocolates']
    pushService.addTags({ interests: categories.join(',') });
  }
};
