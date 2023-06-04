export const transTreeToList = <
  TreeDataItem extends { children?: TreeDataItem[] }
>(
  treeData: Array<TreeDataItem>
): Array<Omit<TreeDataItem, "children">> => {
  let listData: Array<Omit<TreeDataItem, "children">> = [];
  for (let i = 0; i < treeData.length; i += 1) {
    listData.push({
      ...treeData[i],
      children: null,
    });
    if (Array.isArray(treeData[i].children)) {
      listData = [...listData, ...transTreeToList(treeData[i].children!)];
    }
  }
  return listData;
};
