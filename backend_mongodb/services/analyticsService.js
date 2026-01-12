/**
 * Analytics Service
 * Provides sales analytics with various time-based aggregations
 * Optimized for large datasets using MongoDB aggregation pipelines
 */

import Store from '../schema/store/index.js';
import logger from '../utils/logger.js';

// Simple in-memory cache
const analyticsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(email, startDate, endDate) {
  return `${email}:${startDate.toISOString()}:${endDate.toISOString()}`;
}

function getFromCache(key) {
  const cached = analyticsCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  analyticsCache.delete(key);
  return null;
}

function setCache(key, data) {
  analyticsCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Get sales data using MongoDB aggregation pipeline
 */
async function getSalesForPeriodAggregated(email, startDate, endDate) {
  const result = await Store.aggregate([
    { $match: { storeEmail: email } },
    { $unwind: { path: "$billingHistory", preserveNullAndEmptyArrays: true } },
    {
      $match: {
        "billingHistory.createdAt": { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$billingHistory.totalAmount" },
        transactionCount: { $sum: 1 },
        itemsSold: {
          $sum: {
            $reduce: {
              input: { $ifNull: ["$billingHistory.productList", []] },
              initialValue: 0,
              in: { $add: ["$$value", { $ifNull: ["$$this.quantity", 0] }] }
            }
          }
        }
      }
    }
  ]);

  if (result.length === 0) {
    return { totalSales: 0, transactionCount: 0, itemsSold: 0, averageTransaction: 0 };
  }

  const data = result[0];
  return {
    totalSales: Math.round((data.totalSales || 0) * 100) / 100,
    transactionCount: data.transactionCount || 0,
    itemsSold: data.itemsSold || 0,
    averageTransaction: data.transactionCount > 0
      ? Math.round((data.totalSales / data.transactionCount) * 100) / 100
      : 0,
  };
}

/**
 * Get hourly breakdown using aggregation (max 24 points)
 */
async function getHourlyBreakdownAggregated(email, date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const result = await Store.aggregate([
    { $match: { storeEmail: email } },
    { $unwind: { path: "$billingHistory", preserveNullAndEmptyArrays: true } },
    {
      $match: {
        "billingHistory.createdAt": { $gte: dayStart, $lte: dayEnd }
      }
    },
    {
      $group: {
        _id: { $hour: "$billingHistory.createdAt" },
        sales: { $sum: "$billingHistory.totalAmount" },
        transactions: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Fill in all 24 hours
  const hourlyData = [];
  for (let hour = 0; hour < 24; hour++) {
    const found = result.find(r => r._id === hour);
    hourlyData.push({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      sales: found ? Math.round(found.sales * 100) / 100 : 0,
      transactions: found ? found.transactions : 0,
    });
  }

  return hourlyData;
}

/**
 * Get daily breakdown using aggregation (max 31 points)
 */
async function getDailyBreakdownAggregated(email, startDate, endDate) {
  const result = await Store.aggregate([
    { $match: { storeEmail: email } },
    { $unwind: { path: "$billingHistory", preserveNullAndEmptyArrays: true } },
    {
      $match: {
        "billingHistory.createdAt": { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$billingHistory.createdAt" },
          month: { $month: "$billingHistory.createdAt" },
          day: { $dayOfMonth: "$billingHistory.createdAt" }
        },
        sales: { $sum: "$billingHistory.totalAmount" },
        transactions: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
  ]);

  // Fill in all days in range
  const dailyData = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    const found = result.find(r =>
      r._id.year === current.getFullYear() &&
      r._id.month === current.getMonth() + 1 &&
      r._id.day === current.getDate()
    );

    dailyData.push({
      date: current.toISOString().split('T')[0],
      label: current.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      sales: found ? Math.round(found.sales * 100) / 100 : 0,
      transactions: found ? found.transactions : 0,
    });

    current.setDate(current.getDate() + 1);
  }

  return dailyData;
}

/**
 * Get monthly breakdown using aggregation (max 12 points)
 */
async function getMonthlyBreakdownAggregated(email, startDate, endDate) {
  const result = await Store.aggregate([
    { $match: { storeEmail: email } },
    { $unwind: { path: "$billingHistory", preserveNullAndEmptyArrays: true } },
    {
      $match: {
        "billingHistory.createdAt": { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$billingHistory.createdAt" },
          month: { $month: "$billingHistory.createdAt" }
        },
        sales: { $sum: "$billingHistory.totalAmount" },
        transactions: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  // Fill in all months in range
  const monthlyData = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  while (current <= endMonth) {
    const found = result.find(r =>
      r._id.year === current.getFullYear() &&
      r._id.month === current.getMonth() + 1
    );

    monthlyData.push({
      month: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      sales: found ? Math.round(found.sales * 100) / 100 : 0,
      transactions: found ? found.transactions : 0,
    });

    current.setMonth(current.getMonth() + 1);
  }

  return monthlyData;
}

/**
 * Get analytics data with custom date range
 */
export async function getSalesAnalytics(email, period = 'today', customStart = null, customEnd = null) {
  const now = new Date();
  let startDate, endDate, comparisonStart, comparisonEnd;
  let chartType = 'hourly';

  // Handle custom period with explicit dates
  if (period === 'custom' && customStart && customEnd) {
    startDate = new Date(customStart);
    endDate = new Date(customEnd);

    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 1) {
      chartType = 'hourly';
    } else if (daysDiff <= 31) {
      chartType = 'daily';
    } else {
      chartType = 'monthly';
    }

    // Comparison period: same duration before
    comparisonStart = new Date(startDate);
    comparisonStart.setDate(comparisonStart.getDate() - daysDiff);
    comparisonEnd = new Date(endDate);
    comparisonEnd.setDate(comparisonEnd.getDate() - daysDiff);
  } else {
    // Legacy period handling
    switch (period) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        comparisonStart = new Date(startDate);
        comparisonStart.setDate(comparisonStart.getDate() - 1);
        comparisonEnd = new Date(endDate);
        comparisonEnd.setDate(comparisonEnd.getDate() - 1);
        chartType = 'hourly';
        break;

      case 'yesterday':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        comparisonStart = new Date(startDate);
        comparisonStart.setDate(comparisonStart.getDate() - 1);
        comparisonEnd = new Date(endDate);
        comparisonEnd.setDate(comparisonEnd.getDate() - 1);
        chartType = 'hourly';
        break;

      case 'thisWeek':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        comparisonStart = new Date(startDate);
        comparisonStart.setDate(comparisonStart.getDate() - 7);
        comparisonEnd = new Date(endDate);
        comparisonEnd.setDate(comparisonEnd.getDate() - 7);
        chartType = 'daily';
        break;

      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        comparisonStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        comparisonEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        comparisonEnd.setHours(23, 59, 59, 999);
        chartType = 'daily';
        break;

      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        comparisonStart = new Date(now.getFullYear() - 1, 0, 1);
        comparisonEnd = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        comparisonEnd.setHours(23, 59, 59, 999);
        chartType = 'monthly';
        break;

      default:
        throw new Error('INVALID_PERIOD');
    }
  }

  // Check cache
  const cacheKey = getCacheKey(email, startDate, endDate);
  const cached = getFromCache(cacheKey);
  if (cached) {
    logger.info('Analytics served from cache', { email, period });
    return cached;
  }

  // Get current period data using aggregation
  const currentPeriod = await getSalesForPeriodAggregated(email, startDate, endDate);

  // Get comparison period data
  const comparisonPeriod = comparisonStart && comparisonEnd
    ? await getSalesForPeriodAggregated(email, comparisonStart, comparisonEnd)
    : null;

  // Get chart data using aggregation
  let chartData;
  if (chartType === 'hourly') {
    chartData = await getHourlyBreakdownAggregated(email, startDate);
  } else if (chartType === 'daily') {
    chartData = await getDailyBreakdownAggregated(email, startDate, endDate);
  } else {
    chartData = await getMonthlyBreakdownAggregated(email, startDate, endDate);
  }

  // Calculate growth percentage
  let growthPercentage = 0;
  if (comparisonPeriod && comparisonPeriod.totalSales > 0) {
    growthPercentage = Math.round(
      ((currentPeriod.totalSales - comparisonPeriod.totalSales) / comparisonPeriod.totalSales) * 100
    );
  }

  const result = {
    period: {
      name: period,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    current: currentPeriod,
    comparison: comparisonPeriod,
    growth: {
      percentage: growthPercentage,
      isPositive: growthPercentage >= 0,
    },
    chartType,
    chartData,
  };

  // Cache the result
  setCache(cacheKey, result);

  logger.info('Sales analytics generated', { email, period, totalSales: currentPeriod.totalSales });

  return result;
}

/**
 * Get top selling medicines using aggregation
 */
export async function getTopSellingMedicines(email, period = 'thisMonth', limit = 10) {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'today':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'thisWeek':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'thisYear':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const result = await Store.aggregate([
    { $match: { storeEmail: email } },
    { $unwind: { path: "$billingHistory", preserveNullAndEmptyArrays: true } },
    { $match: { "billingHistory.createdAt": { $gte: startDate } } },
    { $unwind: { path: "$billingHistory.productList", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$billingHistory.productList.medData.medID",
        name: { $first: "$billingHistory.productList.medData.name" },
        quantity: { $sum: "$billingHistory.productList.quantity" },
        revenue: {
          $sum: {
            $multiply: [
              { $ifNull: ["$billingHistory.productList.quantity", 0] },
              { $ifNull: ["$billingHistory.productList.medData.pricePerTab", 0] }
            ]
          }
        }
      }
    },
    { $match: { _id: { $ne: null } } },
    { $sort: { revenue: -1 } },
    { $limit: limit },
    {
      $project: {
        medID: "$_id",
        name: 1,
        quantity: 1,
        revenue: { $round: ["$revenue", 2] }
      }
    }
  ]);

  return result;
}

export default {
  getSalesAnalytics,
  getTopSellingMedicines,
};
