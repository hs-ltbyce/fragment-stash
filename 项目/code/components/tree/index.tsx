import { Empty, Input, Tree, TreeProps } from "antd";
import { Key, useEffect, useMemo, useRef } from "react";
import { ScadaTreeListItem } from "src/data/scada-tree-data";
import useMergedState from "rc-util/es/hooks/useMergedState";
import { getParentFromTreeData, transListToTree } from "src/data/tree";
import { useDebounce } from "ahooks";
import { SearchOutlined } from "@ant-design/icons";
import { HighlightTitle } from "./style";

const { TreeNode } = Tree;

export interface TreeDataItem
  extends Omit<ScadaTreeListItem, "title" | "children"> {
  children?: TreeDataItem[];
}

interface Props {
  dataSource: ScadaTreeListItem[];
  treeProps?: TreeProps;
  searchValue?: string;
}

const getTreeNode = (treeData: TreeDataItem[]): React.ReactNode => {
  if (treeData && treeData.length > 0) {
    return treeData.map((item) => {
      const { id, title, children, disableCheckbox, ...rest } = item;

      if (children && children.length) {
        return (
          <TreeNode
            disableCheckbox={disableCheckbox}
            key={id}
            title={title}
            {...rest}
          >
            {getTreeNode(children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          disableCheckbox={disableCheckbox}
          {...rest}
          key={id}
          title={title}
        />
      );
    });
  }
  return [];
};

const getHighlightTitle = (
  data: ScadaTreeListItem[],
  searchValue: string
): TreeDataItem[] => {
  const loop = (data: ScadaTreeListItem[]): TreeDataItem[] =>
    data.map((item): TreeDataItem => {
      const { deviceCount, title: strTitle } = item;
      const index = strTitle.indexOf(searchValue);
      const beforeStr = strTitle.substring(0, index);
      const afterStr = strTitle.slice(index + searchValue.length);
      const suffixCountStr = deviceCount ? `(${deviceCount})` : "";
      const title =
        index > -1 ? (
          <span>
            {beforeStr}
            <HighlightTitle>{searchValue}</HighlightTitle>
            {afterStr}
            {suffixCountStr}
          </span>
        ) : (
          <span>
            {strTitle}
            {suffixCountStr}
          </span>
        );
      if (item.children) {
        return { ...item, title, children: loop(item.children) };
      }

      return {
        ...item,
        title,
      };
    });

  return loop(data);
};

const getParentKey = (
  key: string,
  tree: ScadaTreeListItem[]
): React.Key | undefined => getParentFromTreeData(tree, "id", key)?.id;

const ScadaTree = (props: Props) => {
  const { dataSource, treeProps } = props;
  const { searchValue: propsSearchValue } = props;

  const treeRef = useRef<any>(null);
  const [searchValue, setSearchValue] = useMergedState<string>("", {
    value: propsSearchValue,
  });
  const debouncedSearchValue = useDebounce(searchValue, { wait: 500 });
  const [expandedKeys, setExpandedKeys] = useMergedState<Key[]>([], {
    value: treeProps?.expandedKeys,
  });
  const [autoExpandParent, setAutoExpandParent] = useMergedState<
    TreeProps["autoExpandParent"]
  >(true, {
    value: treeProps?.autoExpandParent,
  });
  const [checkedKeys, setCheckedKeys] = useMergedState<
    TreeProps["checkedKeys"]
  >([], {
    value: treeProps?.checkedKeys,
  });

  if (!dataSource.length) return <Empty style={{ marginTop: "50%" }} />;

  const defaultTreeData = useMemo(
    () => transListToTree(dataSource, "id", "parentId"),
    [dataSource]
  );

  const treeData = useMemo(
    () => getHighlightTitle(defaultTreeData, debouncedSearchValue),
    [defaultTreeData, debouncedSearchValue]
  );

  const handleSelectedAutoExpends: TreeProps["onSelect"] = (_, info) => {
    const clickKey = info.node.key;
    const clickKeyIncluded = expandedKeys.includes(clickKey);
    const newExpandKeys = clickKeyIncluded
      ? expandedKeys?.filter((key) => key !== clickKey)
      : [...expandedKeys, clickKey];
    setExpandedKeys(newExpandKeys);
    setAutoExpandParent(false);
  };

  const onTreeSelect: TreeProps["onSelect"] = (selectedKeys, info) => {
    handleSelectedAutoExpends(selectedKeys, info);
    treeProps?.onSelect?.(selectedKeys, info);
    console.log(info, "onTreeSelect");
  };

  const onTreeExpand: TreeProps["onExpand"] = (newExpandedKeys, info) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
    treeProps?.onExpand?.(newExpandedKeys, info);
    console.log(info, "onTreeSelect");
  };

  const onTreeCheck: TreeProps["onCheck"] = (checked, info) => {
    const checkedKeys = Array.isArray(checked) ? checked : checked.checked;
    setCheckedKeys(checkedKeys);
    treeProps?.onCheck?.(checked, info);
    console.log(info, "onTreeCheck");
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchValue(value);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onTreeScrollTo = (key: string) => {
    treeRef.current?.scrollTo({
      key,
      align: "top",
      offset: 99,
    });
  };

  useEffect(() => {
    // auto collapse tree when searchValue is empty
    if (debouncedSearchValue.trim() === "") {
      setExpandedKeys([]);
    } else {
      const newExpandedKeys = dataSource
        .map((item) => {
          if (item.title.indexOf(debouncedSearchValue) > -1) {
            return getParentKey(item.id, defaultTreeData);
          }
          return null;
        })
        .filter((item, i, self) => item && self.indexOf(item) === i);
      setExpandedKeys(newExpandedKeys as React.Key[]);
      setAutoExpandParent(true);
    }
  }, [debouncedSearchValue]);

  return (
    <>
      <div style={{ padding: "0 8px 8px" }}>
        <Input
          allowClear
          suffix={<SearchOutlined />}
          placeholder="请输入关键字搜索"
          onChange={onSearchChange}
          value={searchValue}
        />
      </div>

      <Tree
        {...treeProps}
        ref={treeRef}
        expandedKeys={expandedKeys}
        checkedKeys={checkedKeys}
        autoExpandParent={autoExpandParent}
        onSelect={onTreeSelect}
        onExpand={onTreeExpand}
        onCheck={onTreeCheck}
      >
        {getTreeNode(treeData)}
      </Tree>
    </>
  );
};

ScadaTree.displayName = "ScadaTree";

export default ScadaTree;
