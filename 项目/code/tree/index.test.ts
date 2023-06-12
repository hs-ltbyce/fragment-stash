import {
  getLeafsFromTreeData,
  getParentFromTreeData,
  getTreeDataNode,
  loopTreeList,
  transListToTree,
  transTreeToList,
} from "../tree";

const list = [
  { id: 1, name: "Node 1", parentId: null },
  { id: 2, name: "Node 2", parentId: 1 },
  { id: 3, name: "Node 3", parentId: 1 },
  { id: 4, name: "Node 4", parentId: 2 },
  { id: 5, name: "Node 5", parentId: 2 },
  { id: 6, name: "Node 6", parentId: 3 },
  { id: 7, name: "Node 7", parentId: null },
];

const tree = [
  {
    id: 1,
    name: "Node 1",
    parentId: null,
    children: [
      {
        id: 2,
        name: "Node 2",
        parentId: 1,
        children: [
          { id: 4, name: "Node 4", parentId: 2 },
          { id: 5, name: "Node 5", parentId: 2 },
        ],
      },
      {
        id: 3,
        name: "Node 3",
        parentId: 1,
        children: [{ id: 6, name: "Node 6", parentId: 3 }],
      },
    ],
  },
  { id: 7, name: "Node 7", parentId: null },
];

describe("transListToTree", () => {
  it("should transform flat list to tree structure", () => {
    const result = transListToTree(list, "id", "parentId");
    expect(result).toEqual([
      {
        id: 1,
        name: "Node 1",
        parentId: null,
        children: [
          {
            id: 2,
            name: "Node 2",
            parentId: 1,
            children: [
              { id: 4, name: "Node 4", parentId: 2 },
              { id: 5, name: "Node 5", parentId: 2 },
            ],
          },
          {
            id: 3,
            name: "Node 3",
            parentId: 1,
            children: [{ id: 6, name: "Node 6", parentId: 3 }],
          },
        ],
      },
      { id: 7, name: "Node 7", parentId: null },
    ]);
  });

  it("should handle empty list", () => {
    const result = transListToTree([], "id", "parentId");
    expect(result).toEqual([]);
  });

  it("should handle list with single root node", () => {
    const result = transListToTree(
      [{ id: 1, name: "Node 1", parentId: null }],
      "id",
      "parentId"
    );
    expect(result).toEqual([{ id: 1, name: "Node 1", parentId: null }]);
  });

  it("should handle list with multiple root nodes", () => {
    const result = transListToTree(
      [
        { id: 1, name: "Node 1", parentId: null },
        { id: 2, name: "Node 2", parentId: null },
      ],
      "id",
      "parentId"
    );
    expect(result).toEqual([
      { id: 1, name: "Node 1", parentId: null },
      { id: 2, name: "Node 2", parentId: null },
    ]);
  });
});

describe("transTreeToList", () => {
  it("should transform tree structure to flat list", () => {
    const result = transTreeToList(tree);
    const expected = [
      { id: 1, name: "Node 1", parentId: null },
      { id: 2, name: "Node 2", parentId: 1 },
      { id: 4, name: "Node 4", parentId: 2 },
      { id: 5, name: "Node 5", parentId: 2 },
      { id: 3, name: "Node 3", parentId: 1 },
      { id: 6, name: "Node 6", parentId: 3 },
      { id: 7, name: "Node 7", parentId: null },
    ];
    expect(result).toEqual(expected);
  });
});

describe("getTreeDataNode", () => {
  it("should return the tree node with the specified key", () => {
    const result = getTreeDataNode(tree, "id", 2);
    expect(result).toEqual({
      id: 2,
      name: "Node 2",
      parentId: 1,
      children: [
        { id: 4, name: "Node 4", parentId: 2 },
        { id: 5, name: "Node 5", parentId: 2 },
      ],
    });
  });

  it("should return undefined if the tree node with the specified key is not found", () => {
    const result = getTreeDataNode(tree, "id", 8);
    expect(result).toBeUndefined();
  });
});

describe("loopTreeList", () => {
  it("should call the callback function for each tree item", () => {
    const callback = jest.fn();
    loopTreeList(tree, callback);

    expect(callback).toHaveBeenCalledTimes(7);
    expect(callback).toHaveBeenCalledWith({
      id: 1,
      name: "Node 1",
      parentId: null,
      children: [
        {
          id: 2,
          name: "Node 2",
          parentId: 1,
          children: [
            { id: 4, name: "Node 4", parentId: 2 },
            { id: 5, name: "Node 5", parentId: 2 },
          ],
        },
        {
          id: 3,
          name: "Node 3",
          parentId: 1,
          children: [{ id: 6, name: "Node 6", parentId: 3 }],
        },
      ],
    });
    expect(callback).toHaveBeenCalledWith({
      id: 2,
      name: "Node 2",
      parentId: 1,
      children: [
        { id: 4, name: "Node 4", parentId: 2 },
        { id: 5, name: "Node 5", parentId: 2 },
      ],
    });
  });

  it("should not call the callback function if it is not provided", () => {
    const callback = jest.fn();
    loopTreeList(tree);

    expect(callback).not.toHaveBeenCalled();
  });
});

describe("getLeafsFromTreeList", () => {
  it("should return an array of leaf nodes for the given id", () => {
    const leafs = getLeafsFromTreeData(tree, 2);

    expect(leafs).toEqual([
      { id: 4, name: "Node 4", parentId: 2 },
      { id: 5, name: "Node 5", parentId: 2 },
    ]);
  });

  it("should return an empty array if the id is not found", () => {
    const leafs = getLeafsFromTreeData(tree, 8);

    expect(leafs).toEqual([]);
  });
});

describe("getParentFromTreeData", () => {
  it("should return undefined if the id is not found", () => {
    expect(getParentFromTreeData(tree, "id", 42)).toBeUndefined();
  });

  it("should return undefined if the node is no parent", () => {
    expect(getParentFromTreeData(tree, "id", 1)).toBeUndefined();
    expect(getParentFromTreeData(tree, "id", 7)).toBeUndefined();
  });

  it("should return the tree node with the specified key", () => {
    expect(getParentFromTreeData(tree, "id", 2)).toEqual({
      id: 1,
      name: "Node 1",
      parentId: null,
      children: [
        {
          id: 2,
          name: "Node 2",
          parentId: 1,
          children: [
            { id: 4, name: "Node 4", parentId: 2 },
            { id: 5, name: "Node 5", parentId: 2 },
          ],
        },
        {
          id: 3,
          name: "Node 3",
          parentId: 1,
          children: [{ id: 6, name: "Node 6", parentId: 3 }],
        },
      ],
    });
  });

  it("returns parent node for second-level children", () => {
    expect(getParentFromTreeData(tree, "id", 4)).toEqual({
      id: 2,
      name: "Node 2",
      parentId: 1,
      children: [
        { id: 4, name: "Node 4", parentId: 2 },
        { id: 5, name: "Node 5", parentId: 2 },
      ],
    });

    expect(getParentFromTreeData(tree, "id", 6)).toEqual({
      id: 3,
      name: "Node 3",
      parentId: 1,
      children: [{ id: 6, name: "Node 6", parentId: 3 }],
    });
  });
});
