import type { VNode } from 'vue';

export interface GridColumn<T extends GridData> {
  key: string;
  title: string;
  width: number;
  sortable?: boolean;
  render?: (ctx: CanvasRenderingContext2D, data: T) => void;
}
export interface GridData {
  id: string;
}
export interface GridConfig<T extends GridData> {
  width?: string;
  height?: string;
  scrollbar: {
    buttonBreadth: number;
    buttonLength: number;
    buttonColor: string;
    backgroundColor: string;
  };
  backgroundColor: string;
  header: {
    height: number;
    backgroundColor: string;
  };
  row: {
    height: number;
    expandHeight: number;
  };
  selectColumn: {
    width: number;
    /** 如果 id 不存在，说明数据还未加载 */
    renderFn: (selected: boolean, id?: string | number) => VNode;
  };
  onSelectionChange: (s: GridSelection) => void;
  operateColumn: {
    width: number;
    /** 如果 id 不存在，说明数据还未加载 */
    renderFn: (id?: string | number) => VNode;
  };
  columns: GridColumn<T>[];
  fetchDataFn: (startRow: number, endRow: number) => Promise<T[]>;
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
