import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { PlanManager } from "./PlanManager";
import { SubscriptionList } from "./SubscriptionList";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "plans" | "subscriptions" | "analytics">("overview");
  
  const stats = useQuery(api.analytics.getDashboardStats);
  const topPlans = useQuery(api.analytics.getTopPlans);
  const trends = useQuery(api.analytics.getSubscriptionTrends);

  if (stats === undefined || topPlans === undefined || trends === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "plans", label: "Plans" },
            { id: "subscriptions", label: "Subscriptions" },
            { id: "analytics", label: "Analytics" },
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
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Active Subscriptions</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalActiveSubscriptions}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Plans</h3>
              <p className="text-3xl font-bold text-green-600">{stats.totalPlans}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Monthly Revenue</h3>
              <p className="text-3xl font-bold text-purple-600">${stats.monthlyRevenue}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Churn Rate</h3>
              <p className="text-3xl font-bold text-red-600">{stats.churnRate.toFixed(1)}%</p>
            </div>
          </div>

          {/* Top Plans */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Plans</h3>
            <div className="space-y-3">
              {topPlans.slice(0, 5).map((planStat, index) => (
                <div key={planStat.plan?._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{(planStat.plan as any)?.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({(planStat.plan as any)?.productType})</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{planStat.subscriptionCount} subscribers</div>
                    <div className="text-sm text-gray-500">${planStat.revenue} revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "plans" && <PlanManager />}
      {activeTab === "subscriptions" && <SubscriptionList />}
      
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Subscription Trends */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Trends (Last 6 Months)</h3>
            <div className="space-y-3">
              {trends.map((trend) => (
                <div key={trend.month} className="flex justify-between items-center p-3 border-b">
                  <span className="font-medium">{trend.month}</span>
                  <div className="flex space-x-6 text-sm">
                    <span className="text-green-600">+{trend.newSubscriptions} new</span>
                    <span className="text-red-600">-{trend.cancelledSubscriptions} cancelled</span>
                    <span className={`font-semibold ${trend.netGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trend.netGrowth >= 0 ? '+' : ''}{trend.netGrowth} net
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Plan Analytics */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Performance Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscribers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topPlans.map((planStat) => (
                    <tr key={planStat.plan?._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {(planStat.plan as any)?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(planStat.plan as any)?.productType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${(planStat.plan as any)?.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {planStat.subscriptionCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${planStat.revenue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
