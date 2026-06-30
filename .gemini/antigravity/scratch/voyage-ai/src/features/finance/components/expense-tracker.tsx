import React, { useState } from "react";
import { useTimelineStore } from "../../timeline/store/use-timeline-store";
import { CurrencyEngine } from "../domain/currency-engine";
import { Typography } from "@/components/ui/typography";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExpenseItem } from "../../timeline/types";

export function ExpenseTracker() {
  const { trip, addManualExpense, deleteManualExpense, selectActivity, selectedActivityId } = useTimelineStore();
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Add Expense Form State
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<"food" | "lodging" | "transport" | "entertainment" | "shopping" | "other">("food");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");

  if (!trip) return null;

  const currency = trip.currency || "USD";

  // 1. Compile all expenses
  // Map activities to a unified expense ledger shape
  const activityExpenses = trip.days.flatMap((day) =>
    day.activities
      .filter((act) => (act.plannedCost || 0) > 0 || (act.actualCost || 0) > 0)
      .map((act) => ({
        id: act.id,
        title: act.title,
        amount: act.paymentStatus === "paid" ? (act.actualCost ?? act.plannedCost ?? 0) : (act.plannedCost || 0),
        category: act.category === "sightseeing" ? "entertainment" : act.category === "dining" ? "food" : act.category === "transit" ? "transport" : act.category === "accommodation" ? "lodging" : "other",
        date: `Day ${day.dayNumber}`,
        isTimeline: true,
        paymentStatus: act.paymentStatus || "unpaid",
      }))
  );

  const manualExpenses = (trip.manualExpenses || []).map((exp) => ({
    id: exp.id,
    title: exp.title,
    amount: exp.amount,
    category: exp.category,
    date: exp.date,
    isTimeline: false,
    paymentStatus: "paid",
  }));

  const allExpenses = [...activityExpenses, ...manualExpenses];

  // 2. Filter expenses
  const filteredExpenses = allExpenses.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || exp.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handle Form Submit
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title || isNaN(parsedAmount) || parsedAmount <= 0) return;

    addManualExpense({
      title,
      amount: parsedAmount,
      category,
      date: "Oct 12, 2026", // Mock current date matching trip
      paymentMethod,
    });

    // Reset Form
    setTitle("");
    setAmount("");
    setCategory("food");
    setIsAdding(false);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "food":
        return <Icons.themeLight className="h-3.5 w-3.5 text-purple-400" />; // Mock dining/food
      case "lodging":
        return <Icons.hotel className="h-3.5 w-3.5 text-amber-400" />;
      case "transport":
        return <Icons.flight className="h-3.5 w-3.5 text-emerald-400" />;
      case "shopping":
        return <Icons.packing className="h-3.5 w-3.5 text-pink-400" />;
      default:
        return <Icons.explore className="h-3.5 w-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-4 text-left">
      {/* Header with Quick Add Button */}
      <div className="flex items-center justify-between">
        <Typography variant="caption" className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
          Expense Ledger
        </Typography>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          className="h-6 px-2 bg-white/5 border border-white/5 hover:bg-white/10 text-muted-foreground hover:text-white rounded-lg text-[9px] pointer-events-auto"
        >
          {isAdding ? "Cancel" : "Log Expense"}
        </Button>
      </div>

      {/* Quick Add Form */}
      {isAdding && (
        <form onSubmit={handleAddExpense} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3 pointer-events-auto">
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase font-semibold text-muted-foreground">Description</label>
            <Input
              type="text"
              placeholder="e.g., Starbucks Coffee"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 bg-white/5 border-white/10 text-xs focus:border-primary/50"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-semibold text-muted-foreground">Amount ($)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="12.50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-8 bg-white/5 border-white/10 text-xs focus:border-primary/50"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-semibold text-muted-foreground">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-8 bg-white/5 border border-white/10 text-xs rounded-xl p-1.5 text-white focus:outline-none focus:border-primary/50"
              >
                <option value="food" className="bg-background text-foreground">Food</option>
                <option value="lodging" className="bg-background text-foreground">Lodging</option>
                <option value="transport" className="bg-background text-foreground">Transport</option>
                <option value="entertainment" className="bg-background text-foreground">Entertainment</option>
                <option value="shopping" className="bg-background text-foreground">Shopping</option>
                <option value="other" className="bg-background text-foreground">Other</option>
              </select>
            </div>
          </div>
          <Button type="submit" size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold py-1.5">
            Record Expense
          </Button>
        </form>
      )}

      {/* Filters Row */}
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-8 relative">
          <Input
            type="text"
            placeholder="Search ledger..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 pl-7 bg-white/5 border-white/5 text-[11px] focus:border-primary/40 rounded-lg placeholder:text-muted-foreground/50"
          />
          <Icons.search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground/40" />
        </div>
        <div className="col-span-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full h-7 bg-white/5 border border-white/5 text-[10px] rounded-lg px-1.5 text-muted-foreground hover:text-white focus:outline-none"
          >
            <option value="all" className="bg-background text-foreground">All</option>
            <option value="food" className="bg-background text-foreground">Food</option>
            <option value="lodging" className="bg-background text-foreground">Lodging</option>
            <option value="transport" className="bg-background text-foreground">Transport</option>
            <option value="entertainment" className="bg-background text-foreground">Entertainment</option>
            <option value="shopping" className="bg-background text-foreground">Shopping</option>
            <option value="other" className="bg-background text-foreground">Other</option>
          </select>
        </div>
      </div>

      {/* Scrollable Ledger List */}
      <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((exp) => (
            <div
              key={exp.id}
              onClick={() => exp.isTimeline && selectActivity(exp.id)}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition-all duration-300 pointer-events-auto cursor-pointer ${
                exp.isTimeline && selectedActivityId === exp.id
                  ? "bg-primary/10 border-primary/40 ring-1 ring-primary/30"
                  : "bg-white/5 border-white/5 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                  {getCategoryIcon(exp.category)}
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-xs font-bold text-white truncate leading-tight">{exp.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] text-muted-foreground font-semibold uppercase">{exp.date}</span>
                    <span className={`text-[8px] px-1 rounded-md uppercase font-bold tracking-wide border ${
                      exp.isTimeline
                        ? "bg-primary/10 border-primary/20 text-primary-light"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    }`}>
                      {exp.isTimeline ? "Timeline" : "Manual"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-bold ${
                  exp.paymentStatus === "unpaid" ? "text-muted-foreground/60 line-through" : "text-white"
                }`}>
                  {CurrencyEngine.format(exp.amount, currency)}
                </span>
                {!exp.isTimeline && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteManualExpense(exp.id);
                    }}
                    className="text-muted-foreground/40 hover:text-rose-400 p-1 rounded transition-colors"
                    aria-label="Delete expense"
                  >
                    <Icons.trash className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 px-4 text-center text-xs text-muted-foreground/40 border border-dashed border-white/5 rounded-2xl flex flex-col items-center gap-3">
            <Icons.budget className="h-6 w-6 text-muted-foreground/20 animate-pulse" />
            <div className="space-y-1">
              <p className="font-semibold text-white/80">No expenses logged</p>
              <p className="text-[10px] text-muted-foreground/70">
                {allExpenses.length === 0 
                  ? "Track your trip finances by logging your first manual expense." 
                  : "No expenses match your active search or filters."}
              </p>
            </div>
            {allExpenses.length === 0 && !isAdding && (
              <Button
                onClick={() => setIsAdding(true)}
                className="h-7 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg text-[10px] pointer-events-auto"
              >
                Log First Expense
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
