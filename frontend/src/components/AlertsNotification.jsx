import { useState, useEffect, useRef } from "react";
import { alertsAPI } from "../services/api";
import { Bell, AlertCircle, AlertTriangle, Info, X, Check } from "lucide-react";

export default function AlertsNotification() {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const fetchAlerts = async () => {
    try {
      const unreadAlerts = await alertsAPI.getUnreadAlerts(10);
      setAlerts(unreadAlerts);
      setUnreadCount(unreadAlerts.length);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const handleMarkAsRead = async (alertId) => {
    try {
      await alertsAPI.markAsRead(alertId);
      setAlerts(alerts.filter((a) => a.id !== alertId));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  const handleDismiss = async (alertId) => {
    try {
      await alertsAPI.dismissAlert(alertId);
      setAlerts(alerts.filter((a) => a.id !== alertId));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error("Error dismissing alert:", error);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
      case "high":
        return (
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        );
      case "medium":
        return (
          <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        );
      default:
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
      case "high":
        return "border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20";
      case "medium":
        return "border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20";
      default:
        return "border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20";
    }
  };

  const getAlertTypeLabel = (type) => {
    const labels = {
      cost_spike: "Cost Spike",
      missing_data: "Missing Data",
      duplicate_invoice: "Duplicate",
      payment_due: "Payment Due",
      unusual_charge: "Unusual Charge",
      validation_error: "Validation Error"
    };
    return labels[type] || type;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                  ({unreadCount} unread)
                </span>
              )}
            </h3>
            <button
              onClick={() => setShowDropdown(false)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Alerts List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
                  Loading...
                </p>
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-3 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${getSeverityColor(
                      alert.severity
                    )}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getSeverityIcon(alert.severity)}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Alert Type Badge */}
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-white dark:bg-gray-700 dark:text-gray-200 rounded mb-2">
                          {getAlertTypeLabel(alert.alert_type)}
                        </span>

                        {/* Title */}
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          {alert.title}
                        </h4>

                        {/* Message */}
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {alert.message}
                        </p>

                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {alert.batch_name && (
                            <span>Batch: {alert.batch_name}</span>
                          )}
                          {alert.bill_number && (
                            <span>Invoice: {alert.bill_number}</span>
                          )}
                          <span>
                            {new Date(alert.created_at).toLocaleString()}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleMarkAsRead(alert.id)}
                            className="flex items-center gap-1 px-3 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            Mark Read
                          </button>
                          <button
                            onClick={() => handleDismiss(alert.id)}
                            className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {alerts.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-center">
              <button
                onClick={async () => {
                  try {
                    const allAlerts = await alertsAPI.getUnreadAlerts(50);
                    setAlerts(allAlerts);
                  } catch (error) {
                    console.error("Error loading more:", error);
                  }
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
