import React, { useState, useEffect } from 'react';
import { Settings2 } from 'lucide-react';
import { toast } from 'sonner';
// import SettingsService from '../../services/SettingsService';

const Settings = () => {
  const [settings, setSettings] = useState({
    storeName: '',
    contactEmail: '',
    notificationPreferences: { orderUpdates: false, lowStockAlerts: false }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await SettingsService.getSettings();
        setSettings(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load settings');
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setSettings((prev) => ({
        ...prev,
        notificationPreferences: { ...prev.notificationPreferences, [name]: checked }
      }));
    } else {
      setSettings((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!settings.storeName || !settings.contactEmail) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const updatedSettings = await SettingsService.updateSettings(settings);
      setSettings(updatedSettings);
      toast.success('Settings updated successfully!');
    } catch (err) {
      toast.error('Failed to update settings');
    }
  };

  if (loading) return <p className="text-center text-stone-500 mt-10">Loading settings...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
        <div className="flex items-center gap-2 mb-6">
          <Settings2 className="h-6 w-6 text-stone-800" />
          <h3 className="text-lg font-semibold text-stone-800">Settings</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-stone-700 font-medium mb-2">Store Name*</label>
            <input
              type="text"
              name="storeName"
              className="w-full max-w-md px-4 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={settings.storeName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label className="block text-stone-700 font-medium mb-2">Contact Email*</label>
            <input
              type="email"
              name="contactEmail"
              className="w-full max-w-md px-4 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={settings.contactEmail}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <h4 className="text-md font-semibold text-stone-800 mb-4">Notification Preferences</h4>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="orderUpdates"
                className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                checked={settings.notificationPreferences.orderUpdates}
                onChange={handleInputChange}
              />
              <span className="text-stone-600">Order Updates</span>
            </label>
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                name="lowStockAlerts"
                className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                checked={settings.notificationPreferences.lowStockAlerts}
                onChange={handleInputChange}
              />
              <span className="text-stone-600">Low Stock Alerts</span>
            </label>
          </div>
          <div>
            <button
              type="submit"
              className="px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;