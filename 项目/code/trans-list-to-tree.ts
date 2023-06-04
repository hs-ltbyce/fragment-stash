import { cloneDeep } from "lodash";

type TransListToTreeDataItem<T> = T & { children?: T[] };

/**
 *
 * @param list
 * @param idKey list obj property name
 * @param parentIdKey list obj property name
 */
export const transListToTree = <ListItem extends {}>(
  list: Array<ListItem>,
  idKey: keyof ListItem,
  parentIdKey: keyof ListItem
): TransListToTreeDataItem<ListItem>[] => {
  const listData = cloneDeep(list);
  const treeData: TransListToTreeDataItem<ListItem>[] = [];
  const mapList = new Map<string, ListItem>();

  // taransfrom list to map
  listData.forEach((item) => {
    mapList.set(item[idKey] as string, item);
  });

  listData.forEach((item) => {
    const parent: TransListToTreeDataItem<ListItem> | undefined = mapList.get(
      item[parentIdKey] as string
    );

    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(item);
      mapList.set(item[parentIdKey] as string, parent);
    } else {
      treeData.push(item);
    }
  });

  return treeData;
};
