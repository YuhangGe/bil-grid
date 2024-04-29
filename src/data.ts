import type { GridConfig, GridData, GridSelection, Selection } from './common';
import { getGridSelection } from './util';

class DataFetcher<T extends GridData> {
  /** fetch data fn */
  #fd: GridConfig<T>['fetchDataFn'];
  /** fetch queue */
  #fq: {
    row: number;
    resolve: (data: T) => void;
    reject: (err: Error) => void;
  }[];
  #tm?: number;
  /** is busy */
  #ib?: boolean;
  /** on updated */
  #op: () => void;
  #opTm: number;
  constructor(fetchDataFn: GridConfig<T>['fetchDataFn'], onUpdated: () => void) {
    this.#fd = fetchDataFn;
    this.#fq = [];
    this.#ib = false;
    this.#tm = 0;
    this.#op = onUpdated;
    this.#opTm = 0;
  }
  fetch(rowAt: number) {
    return new Promise<T>((resolve, reject) => {
      this.#fq.push({
        row: rowAt,
        resolve,
        reject,
      });
      if (!this.#ib && !this.#tm) {
        this.#tm = window.setTimeout(() => this.#sch(), 150);
      }
    });
  }
  /** schedule */
  async #sch() {
    clearTimeout(this.#tm);
    this.#tm = 0;
    if (this.#ib) return;
    if (!this.#fq.length) return;
    const items = this.#fq.slice();
    this.#fq.length = 0;
    this.#ib = true;
    try {
      const rows = items.map((item) => item.row);
      const list = await this.#fd(rows);
      items.forEach((item, i) => {
        item.resolve(list[i]);
      });
      clearTimeout(this.#opTm);
      this.#opTm = window.setTimeout(() => this.#op());
    } catch (ex) {
      console.error(ex);
      items.forEach((item) => {
        item.reject(ex as Error);
      });
    }
    this.#ib = false;
    if (this.#fq.length > 0) {
      this.#tm = window.setTimeout(() => this.#sch(), 50);
    }
  }
}
export class DataStore<T extends GridData> {
  #exp: Set<string | number>;
  #sel: Selection;
  /** data store map，行号到数据的映射 */
  #ds: Map<number, T>;
  /** data fetcher */
  #df: DataFetcher<T>;
  /** watchers */
  #ws: Set<() => void>;
  constructor(config: GridConfig<T>) {
    this.#ds = new Map();
    this.#exp = new Set();
    this.#df = new DataFetcher(config.fetchDataFn, () => {
      this.#ws.forEach((watchFn) => watchFn());
    });
    this.#sel = { all: false, exclude: new Set(), include: new Set() };
    this.#ws = new Set();
  }

  onUpdated(watchFn: () => void) {
    this.#ws.add(watchFn);
  }

  fetchAt(rowAt: number) {
    // console.log('fetchAt', rowAt);
    this.#df.fetch(rowAt).then(
      (d) => {
        this.#ds.set(rowAt, d);
      },
      (err) => {
        console.error(err);
      },
    );
  }

  getAt(rowAt: number) {
    return this.#ds.get(rowAt);
  }

  checkSelected(d: T) {
    const sel = this.#sel;
    return sel.all ? !sel.exclude.has(d.id) : sel.include.has(d.id);
  }

  get selection(): GridSelection {
    return getGridSelection(this.#sel);
  }
  expand(id: string | number, expand: boolean) {
    if (expand) {
      this.#exp.add(id);
    } else {
      this.#exp.delete(id);
    }
  }
  selectAll(selected: boolean) {
    if (selected) {
      this.#sel.all = true;
      this.#sel.exclude.clear();
    } else {
      this.#sel.all = false;
      this.#sel.include.clear();
    }
  }
  select(id: string | number, selected: boolean) {
    if (this.#sel.all) {
      if (selected) {
        this.#sel.exclude.delete(id);
      } else {
        this.#sel.exclude.add(id);
      }
    } else {
      if (selected) {
        this.#sel.include.add(id);
      } else {
        this.#sel.include.delete(id);
      }
    }
  }
  clear() {
    this.#ds.clear();
  }

  fill(data: T[], startRow: number, endRow: number) {
    if (!data?.length) throw new Error('不能为空');
    if (data.length > 500) throw new Error('出于性能考虑，每次 fill 数据不能超过 500 条');
    if (endRow - startRow + 1 !== data.length)
      throw new Error('data 长度必须和 endRow - startRow + 1 一致');
    data.forEach((data, i) => {
      this.#ds.set(i + startRow, data);
    });
  }
}
