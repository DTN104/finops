import { fptOrderBook, formatMarketPrice } from "@/lib/market-data";

export function OrderBook() {
  return (
    <section className="hidden h-full rounded-[14px] border border-border-default bg-surface p-[18px] lg:block">
      <h2 className="type-heading-h3">Order book</h2>
      <table className="mt-0 w-full table-fixed type-data-s">
        <caption className="sr-only">FPT order book</caption>
        <thead className="text-muted"><tr className="h-[38px]"><th className="text-left font-normal">Price</th><th className="text-left font-normal">Qty</th><th className="text-left font-normal">Total</th></tr></thead>
        <tbody>
          {fptOrderBook.map((level) => (
            <tr key={level.price} className="h-9">
              <td className={level.side === "ask" ? "text-loss" : level.side === "bid" ? "text-profit" : "text-primary"}>{formatMarketPrice(level.price)}</td>
              <td className="text-secondary">{formatMarketPrice(level.quantity)}</td>
              <td className="text-secondary">{level.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
