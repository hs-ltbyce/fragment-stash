export interface ScadaTreeListItem extends Omit<TreeNodeProps, "children"> {
  id: string;
  parentId: string;
  title: string;
  order: number;
  deviceCount?: number;
  deviceInfo?: Device;
  indicatorInfo?: IndicatorObject;
  children?: ScadaTreeListItem[];
}
