import type { CurrencyCode, OrderLine, Product } from "../types";
import { formatMoney } from "../lib/money";
import { availableOf, qtyOf } from "../lib/order";
import { CATEGORY_COLOR } from "../data/catalog";

interface Props {
  products: Product[];
  order: OrderLine[];
  currency: CurrencyCode;
  onAdd: (product: Product) => void;
}

export function ProductGrid({ products, order, currency, onAdd }: Props) {
  if (products.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <p className="px-1 py-9 text-muted">Nothing matches that scan or search.</p>
      </div>
    );
  }

  return (
    <div className="grid flex-1 auto-rows-min grid-cols-[repeat(auto-fill,minmax(158px,1fr))] gap-3 overflow-y-auto pb-1.5">
      {products.map((product) => {
        const inOrder = qtyOf(order, product.sku);
        const left = availableOf(product, order);
        const soldOut = left <= 0;
        return (
          <button
            key={product.sku}
            type="button"
            disabled={soldOut}
            onClick={() => onAdd(product)}
            className={
              "relative flex min-h-[116px] flex-col gap-[3px] rounded-[15px] border border-line bg-surface p-[13px] pt-[13px] text-left shadow-soft transition duration-150 " +
              (soldOut
                ? "cursor-not-allowed opacity-50"
                : "hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0")
            }
          >
            <span className="flex items-center gap-[7px]">
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-[3px]"
                style={{ backgroundColor: CATEGORY_COLOR[product.category] }}
              />
              <span className="text-[11.5px] text-muted">{product.category}</span>
            </span>
            <span className="mt-0.5 text-[14.5px] font-semibold leading-snug">
              {product.name}
            </span>
            <span className="font-mono text-[11px] text-muted-soft">{product.sku}</span>
            <span className="mt-auto text-[17px] font-bold tracking-[-0.01em] tnum">
              {formatMoney(product.price, currency)}
            </span>
            <span
              className={
                "text-[11.5px] " + (soldOut ? "font-semibold text-danger" : "text-muted")
              }
            >
              {soldOut ? "Out of stock" : left + " in stock"}
            </span>
            {inOrder > 0 && (
              <span className="absolute right-2 top-2 grid h-[21px] min-w-[21px] place-items-center rounded-full bg-em px-1.5 text-xs font-bold text-white tnum">
                {inOrder}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
