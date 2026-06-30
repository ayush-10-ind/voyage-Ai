export interface ExchangeRate {
  code: string;
  rateToUSD: number; // 1 Unit of Currency = X USD
  symbol: string;
  name: string;
}

export class CurrencyEngine {
  private static rates: Record<string, ExchangeRate> = {
    USD: { code: "USD", rateToUSD: 1.0, symbol: "$", name: "US Dollar" },
    EUR: { code: "EUR", rateToUSD: 1.08, symbol: "€", name: "Euro" },
    JPY: { code: "JPY", rateToUSD: 0.0064, symbol: "¥", name: "Japanese Yen" },
    GBP: { code: "GBP", rateToUSD: 1.27, symbol: "£", name: "British Pound" },
  };

  /**
   * Converts an amount from one currency to another.
   */
  static convert(amount: number, from: string, to: string): number {
    const fromRate = this.rates[from]?.rateToUSD;
    const toRate = this.rates[to]?.rateToUSD;

    if (!fromRate || !toRate) return amount;

    // Convert to USD first, then to target currency
    const amountInUSD = amount * fromRate;
    return amountInUSD / toRate;
  }

  /**
   * Formats an amount in a specific currency.
   */
  static format(amount: number, currencyCode: string): string {
    const currency = this.rates[currencyCode] || this.rates.USD;
    
    // For JPY, usually no decimals
    if (currencyCode === "JPY") {
      return `${currency.symbol}${Math.round(amount).toLocaleString()}`;
    }

    return `${currency.symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  /**
   * Get all supported currencies.
   */
  static getSupportedCurrencies(): ExchangeRate[] {
    return Object.values(this.rates);
  }
}
