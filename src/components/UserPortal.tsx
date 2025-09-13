import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export function UserPortal() {
  const [activeTab, setActiveTab] = useState<"subscription" | "plans" | "notifications" | "recommendations">("subscription");
  
  const userProfile = useQuery(api.users.getCurrentUserProfile);
  const subscription = useQuery(api.subscriptions.getUserSubscription);
  const allPlans = useQuery(api.plans.getAllPlans);
  const notifications = useQuery(api.notifications.getUserNotifications);
  const unreadCount = useQuery(api.notifications.getUnreadCount);
  
  const subscribe = useMutation(api.subscriptions.subscribe);
  const upgradeSubscription = useMutation(api.subscriptions.upgradeSubscription);
  const downgradeSubscription = useMutation(api.subscriptions.downgradeSubscription);
  const cancelSubscription = useMutation(api.subscriptions.cancelSubscription);
  const renewSubscription = useMutation(api.subscriptions.renewSubscription);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const generateRecommendations = useAction(api.analytics.generateRecommendations);

  const [recommendations, setRecommendations] = useState<any>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const handleSubscribe = async (planId: string) => {
    try {
      await subscribe({ planId: planId as any });
      toast.success("Successfully subscribed to plan!");
    } catch (error: any) {
      toast.error(error.message || "Failed to subscribe");
    }
  };

  const handleUpgrade = async (newPlanId: string) => {
    try {
      await upgradeSubscription({ newPlanId: newPlanId as any });
      toast.success("Successfully upgraded subscription!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upgrade");
    }
  };

  const handleDowngrade = async (newPlanId: string) => {
    try {
      await downgradeSubscription({ newPlanId: newPlanId as any });
      toast.success("Successfully downgraded subscription!");
    } catch (error: any) {
      toast.error(error.message || "Failed to downgrade");
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
    
    try {
      await cancelSubscription();
      toast.success("Subscription cancelled successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel subscription");
    }
  };

  const handleRenew = async () => {
    try {
      await renewSubscription();
      toast.success("Subscription renewed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to renew subscription");
    }
  };

  const handleGetRecommendations = async () => {
    if (!userProfile) return;
    
    setLoadingRecommendations(true);
    try {
      const result = await generateRecommendations({ userId: userProfile.userId });
      setRecommendations(result);
    } catch (error) {
      toast.error("Failed to generate recommendations");
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({ notificationId: notificationId as any });
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    }
  };

  if (!userProfile || allPlans === undefined || notifications === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {userProfile.name}!</h1>
          <p className="text-gray-600">Manage your subscription and explore our plans</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "subscription", label: "My Subscription" },
            { id: "plans", label: "Available Plans" },
            { id: "notifications", label: `Notifications ${unreadCount ? `(${unreadCount})` : ''}` },
            { id: "recommendations", label: "Recommendations" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "subscription" && (
        <div className="space-y-6">
          {subscription ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Subscription</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900">{subscription.plan?.name}</h4>
                  <p className="text-gray-600">{subscription.plan?.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {subscription.plan?.productType} - ${subscription.plan?.price}/month
                  </p>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm">
                      <span>Data Usage</span>
                      <span>{subscription.dataUsed} GB / {subscription.plan?.dataQuota} GB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min((subscription.dataUsed / (subscription.plan?.dataQuota || 1)) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={`font-medium ${
                        subscription.status === 'active' ? 'text-green-600' : 
                        subscription.status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {subscription.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Start Date:</span>
                      <span>{new Date(subscription.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>End Date:</span>
                      <span>{new Date(subscription.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto Renew:</span>
                      <span className={subscription.autoRenew ? 'text-green-600' : 'text-red-600'}>
                        {subscription.autoRenew ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {subscription.status === 'active' && (
                      <button
                        onClick={handleCancel}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                      >
                        Cancel Subscription
                      </button>
                    )}
                    {(subscription.status === 'cancelled' || subscription.status === 'expired') && (
                      <button
                        onClick={handleRenew}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                      >
                        Renew Subscription
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {subscription.plan?.features && (
                <div className="mt-6">
                  <h5 className="font-medium text-gray-900 mb-2">Plan Features:</h5>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {subscription.plan.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
              <p className="text-gray-600 mb-4">You don't have an active subscription. Browse our plans to get started!</p>
              <button
                onClick={() => setActiveTab("plans")}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                View Plans
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "plans" && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Available Plans</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPlans.map((plan) => (
              <div key={plan._id} className="bg-white p-6 rounded-lg shadow border">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                    <p className="text-sm text-gray-500">{plan.productType}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-600">${plan.price}</span>
                    <span className="text-sm text-gray-500">/month</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700">Data Quota: </span>
                  <span className="text-sm text-gray-600">{plan.dataQuota} GB</span>
                </div>

                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>

                <div className="space-y-2">
                  {!subscription && (
                    <button
                      onClick={() => handleSubscribe(plan._id)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    >
                      Subscribe
                    </button>
                  )}
                  
                  {subscription && subscription.status === 'active' && subscription.planId !== plan._id && (
                    <>
                      {plan.price > (subscription.plan?.price || 0) && (
                        <button
                          onClick={() => handleUpgrade(plan._id)}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                        >
                          Upgrade to This Plan
                        </button>
                      )}
                      {plan.price < (subscription.plan?.price || 0) && (
                        <button
                          onClick={() => handleDowngrade(plan._id)}
                          className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700"
                        >
                          Downgrade to This Plan
                        </button>
                      )}
                    </>
                  )}
                  
                  {subscription && subscription.planId === plan._id && (
                    <div className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-md text-center">
                      Current Plan
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {unreadCount && unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Mark All as Read
              </button>
            )}
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-600">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`bg-white p-4 rounded-lg shadow border-l-4 ${
                    notification.isRead ? 'border-gray-300' : 'border-blue-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className={`font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </h4>
                      <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="text-blue-600 hover:text-blue-800 text-sm ml-4"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "recommendations" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Personalized Recommendations</h3>
            <button
              onClick={handleGetRecommendations}
              disabled={loadingRecommendations}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingRecommendations ? "Generating..." : "Get Recommendations"}
            </button>
          </div>

          {recommendations ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-medium text-gray-900 mb-2">AI-Powered Recommendations</h4>
              <p className="text-sm text-gray-600 mb-4">{recommendations.reasoning}</p>
              
              <div className="space-y-3">
                {recommendations.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-gray-600">Click "Get Recommendations" to receive personalized suggestions based on your usage patterns and subscription history.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
