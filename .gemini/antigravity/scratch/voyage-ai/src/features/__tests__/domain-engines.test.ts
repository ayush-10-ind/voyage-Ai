import { BudgetEngine } from "../finance/domain/budget-engine";
import { RouteEngine } from "../map/domain/route-engine";
import { CurrencyEngine } from "../finance/domain/currency-engine";
import { ForecastEngine } from "../finance/domain/forecast-engine";
import { TravelIntelligenceEngine } from "../travel-intelligence/domain/travel-intelligence-engine";
import { TravelBrain } from "../kernel/domain/travel-brain";
import { Activity, Trip } from "../timeline/types";

// Zero-dependency Test Runner Assertions
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

const mockActivities: Activity[] = [
  {
    id: "act-1",
    time: "09:00 AM",
    title: "Senso-ji Temple Tour",
    description: "Sightseeing at temple.",
    cost: "Free",
    category: "sightseeing",
    plannedCost: 0,
    actualCost: 0,
    paymentStatus: "paid",
    coordinates: { lat: 35.6762, lng: 139.6503 },
    travelToNext: {
      mode: "transit",
      duration: "20m",
      distance: "2.5 km",
    },
  },
  {
    id: "act-2",
    time: "01:00 PM",
    title: "Lunch at Sukiyaki",
    description: "Dining experience.",
    cost: "$50",
    category: "dining",
    plannedCost: 50,
    actualCost: 60,
    paymentStatus: "partially_paid",
    coordinates: { lat: 35.6862, lng: 139.6603 },
    travelToNext: {
      mode: "driving",
      duration: "15m",
      distance: "4.0 km",
    },
  },
  {
    id: "act-3",
    time: "04:00 PM",
    title: "Akihabara Shopping",
    description: "Shopping electronics.",
    cost: "$100",
    category: "other",
    plannedCost: 100,
    actualCost: 80,
    paymentStatus: "unpaid",
    coordinates: { lat: 35.6962, lng: 139.6703 },
  },
];

const mockTrip: Trip = {
  id: "trip-1",
  name: "Tokyo Adventure",
  destination: "Tokyo",
  startDate: "Oct 12, 2026",
  endDate: "Oct 15, 2026",
  travelerCount: 2,
  totalBudget: 500,
  currency: "USD",
  days: [
    {
      dayNumber: 1,
      title: "Day 1",
      activities: mockActivities,
    },
  ],
  manualExpenses: [
    {
      id: "exp-1",
      title: "Suica Card Recharge",
      amount: 20,
      category: "transport",
      date: "Oct 12, 2026",
    },
  ],
};

// 1. CurrencyEngine Tests
function testCurrencyEngine() {
  console.log("▶ Running CurrencyEngine Tests...");
  
  // Test conversion
  const eurVal = CurrencyEngine.convert(100, "USD", "EUR");
  const roundedEur = Math.round(eurVal * 100) / 100;
  assert(roundedEur === 92.59, `Expected 92.59 EUR for 100 USD, got ${roundedEur}`);
  
  const jpyVal = CurrencyEngine.convert(100, "USD", "JPY");
  assert(jpyVal === 15625, `Expected 15625 JPY for 100 USD, got ${jpyVal}`);

  // Test formatting
  const formattedUsd = CurrencyEngine.format(120.5, "USD");
  assert(formattedUsd === "$120.50", `Expected $120.50, got ${formattedUsd}`);

  const formattedEur = CurrencyEngine.format(120.5, "EUR");
  assert(formattedEur === "€120.50", `Expected €120.50, got ${formattedEur}`);
  
  console.log("✓ CurrencyEngine Tests Passed!");
}

// 2. BudgetEngine Tests
function testBudgetEngine() {
  console.log("▶ Running BudgetEngine Tests...");
  
  // Base metrics
  const metrics = BudgetEngine.calculateMetrics(500, 3, mockActivities, mockTrip.manualExpenses || []);
  
  // Total Planned: 150 (activities) + 20 (manual) = 170
  assert(metrics.totalPlannedSpend === 170, `Expected 170 planned, got ${metrics.totalPlannedSpend}`);
  
  // Total Actual: 0 (act-1 paid, actualCost=0) + 60 (act-2 part, actualCost=60) + 20 (manual) = 80
  assert(metrics.totalActualSpend === 80, `Expected 80 actual, got ${metrics.totalActualSpend}`);
  
  // Remaining: 500 - 80 = 420
  assert(metrics.remainingBudget === 420, `Expected 420 remaining, got ${metrics.remainingBudget}`);

  // Daily budget: 420 / 3 = 140
  assert(metrics.dailyBudget === 140, `Expected 140 daily budget, got ${metrics.dailyBudget}`);

  // Health score calculation
  assert(metrics.healthScore > 0 && metrics.healthScore <= 100, `Health score should be between 0 and 100, got ${metrics.healthScore}`);
  
  console.log("✓ BudgetEngine Tests Passed!");
}

// 3. RouteEngine Tests
function testRouteEngine() {
  console.log("▶ Running RouteEngine Tests...");
  
  const summary = RouteEngine.calculateRouteSummary(mockActivities);
  
  // Total duration: 20m + 15m = 35m
  assert(summary.totalDurationMin === 35, `Expected 35 mins duration, got ${summary.totalDurationMin}`);
  
  // Total distance: 2.5 + 4.0 = 6.5 km
  assert(summary.totalDistanceKm === 6.5, `Expected 6.5 km distance, got ${summary.totalDistanceKm}`);

  // Carbon footprint:
  // transit segment (2.5 km) -> 2.5 * 0.08 = 0.2 kg
  // driving segment (4.0 km) -> 4.0 * 0.22 = 0.88 kg
  // Total = 1.08 -> rounded to 1.1 kg
  assert(summary.carbonScoreKg === 1.1, `Expected 1.1 kg CO2, got ${summary.carbonScoreKg}`);

  // Scenic score: 1 sightseeing out of 3 activities -> ratio 1/3 = 0.33. Score should be ~7
  assert(summary.scenicScore === 7, `Expected scenic score 7, got ${summary.scenicScore}`);

  console.log("✓ RouteEngine Tests Passed!");
}

// 4. ForecastEngine Tests
function testForecastEngine() {
  console.log("▶ Running ForecastEngine Tests...");
  
  // Actual spent so far (80) + planned future spend (act-3 unpaid, plannedCost=100) = 180
  const forecast = ForecastEngine.generateForecast(
    500,
    3,
    1,
    mockActivities,
    mockTrip.manualExpenses || []
  );

  assert(forecast.projectedTotalSpend === 180, `Expected 180 projected total spend, got ${forecast.projectedTotalSpend}`);
  assert(!forecast.isOverBudget, "Should not be over budget");

  console.log("✓ ForecastEngine Tests Passed!");
}

// 5. TravelIntelligenceEngine Tests
function testTravelIntelligenceEngine() {
  console.log("▶ Running TravelIntelligenceEngine Tests...");
  
  const rawActs = [
    { id: "1", time: "10:00 AM", title: "Asakusa Temple", description: "Temple tour", cost: "Free", category: "sightseeing" as const },
  ];

  const enriched = TravelIntelligenceEngine.enrichActivities("Tokyo", rawActs);
  assert(enriched.length === 1, "Should enrich 1 activity");
  
  const act = enriched[0];
  assert(act.coordinates !== undefined, "Should generate coordinates");
  assert(act.safetyScore !== undefined, "Should generate safety score");
  assert(act.crowdLevel !== undefined, "Should generate crowd level");
  assert(act.nearbyPOIs !== undefined, "Should generate nearby POIs");
  assert(act.localEvents !== undefined, "Should generate local events");
  assert(act.accessibilityInfo !== undefined, "Should generate accessibility info");

  console.log("✓ TravelIntelligenceEngine Tests Passed!");
}

// 6. TravelBrain Tests
function testTravelBrain() {
  console.log("▶ Running TravelBrain Tests...");
  
  // Test general context aggregation
  const generalContext = TravelBrain.getContextForAI(mockTrip, { budgetStyle: "mid" });
  assert(generalContext.destination === "Tokyo", "Should aggregate destination");
  assert(generalContext.financials !== undefined, "Should aggregate financials");
  assert(generalContext.logistics !== undefined, "Should aggregate logistics");

  // Test reasoning filter: Finance
  const financeContext = TravelBrain.getContextForAI(mockTrip, { budgetStyle: "mid" }, "How is my budget?");
  assert(financeContext.focus === "finance", "Should focus on finance");
  assert(financeContext.financials !== undefined, "Should include financials");
  assert(financeContext.logistics === undefined, "Should filter out logistics");

  // Test reasoning filter: Logistics
  const logisticsContext = TravelBrain.getContextForAI(mockTrip, { budgetStyle: "mid" }, "Show me the map route");
  assert(logisticsContext.focus === "logistics", "Should focus on logistics");
  assert(logisticsContext.logistics !== undefined, "Should include logistics");
  assert(logisticsContext.financials === undefined, "Should filter out financials");

  console.log("✓ TravelBrain Tests Passed!");
}

// Execute All Tests
function runAllTests() {
  console.log("========================================");
  console.log("VOYAGE AI DOMAIN ENGINES TEST SUITE");
  console.log("========================================");
  
  try {
    testCurrencyEngine();
    testBudgetEngine();
    testRouteEngine();
    testForecastEngine();
    testTravelIntelligenceEngine();
    testTravelBrain();
    
    console.log("========================================");
    console.log("ALL TESTS COMPLETED SUCCESSFULLY! 🎉");
    console.log("========================================");
  } catch (err: any) {
    console.error("========================================");
    console.error("TEST SUITE FAILED! ❌");
    console.error(err.message);
    console.error("========================================");
    process.exit(1);
  }
}

runAllTests();
