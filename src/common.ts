export interface GridColumn<T extends GridData> {
  key: string;
  title: string;
  width: number;
  sortable?: boolean;
  render?: (ctx: CanvasRenderingContext2D, data: T) => void;
}
export interface GridData {
  __rowHeight?: number;
  id: string;
  [key: string]: unknown;
}
export interface GridConfig<T extends GridData> {
  width?: string;
  height?: string;

  backgroundColor: string;
  rowHeight: number;

  columns: GridColumn<T>[];
}

export interface RowRange {
  start: number;
  end: number;
}

export type GridSelection =
  | {
      all: true;
      exclude: (string | number)[];
    }
  | { all: false; include: (string | number)[] };

export interface Selection {
  all: boolean;
  /** 全选后排除掉的行数据的 id 列表 */
  exclude: Set<string | number>;
  /** 未全选时选中的行数据的 id 列表 */
  include: Set<string | number>;
}

export interface RenderState {
  visualWidth: number;
  visualHeight: number;
  total: number;
  startRow: number;
  endRow: number;
}
