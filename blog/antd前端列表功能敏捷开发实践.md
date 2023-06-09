## 前言  
在项目中，经常会遇到一些表格列表的展示，通常都是调用接口获取返回的列表信息，然后展示在列表中。这个逻辑非常简单，但是其中一些必要的工作又无法省略，例如： 列表分页查询、使用表单进行条件筛选、拿到数据要手动更新表格等等。这一系列工作总是会带来一些问题：浪费大量代码时间使效率低下、重复工作下导致的常见bug、表格交互操作不统一。

## 解决方案实践   

通过ahooks提供的[useAntdTable](https://ahooks.js.org/zh-CN/hooks/use-antd-table/)，借助于useAntdTable封装的功能，能极大的简化对列表功能的实现。将一系列的开发过程模板化、格式化，这样最后整个列表功能就剩下UI需要自定义去实现。

#### 请求  

首先对于请求来说，一定要有一个统一的返回类型，通常情况下列表查询的接口应该是: 

```typescript

import { AntdTableResult, Params } from 'ahooks/lib/useAntdTable/types';

export interface APIResponseList<T> {
  list: T[];
  total: number;
}

export type AntdTableProps<TData, TParams> = AntdTableResult<
  APIResponseList<TData>,
  TParams & Params
>['tableProps'];
```

我们请求列表接口返回的类型定义就应该是：

```typescript
interface Response extends APIResponseList<TData> {
    ...
}

```

#### Table  

对于我们的列表，我们只需要传入tableProps，它包含了：dataSource、loading、onChange、pagination等

```JSX
interface Props {
    tableProps: AntdTableProps<SolutionListItem, { solutionName: string }>  
}

const TableUI = (props: Props) => {
    const {tableProps} = props;
    return (
        <Table
          rowKey="id"
          columns={columns}
          {...tableProps}
          pagination={{
            ...tablePaginationConfig,
            ...tableProps.pagination,
          }}
        />
    )
}   
```

#### Pagination

为保证分页风格的统一，我们使用统一的分页配置： 

```typescript
export const tablePaginationConfig: false | TablePaginationConfig = {
  showQuickJumper: true,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`,
};
```

#### Container  

在container层我们只需要如下： 

```JSX

  const getTableData = (
    params: {
      current: number;
      pageSize: number;
    },
    formData: {
      solutionName?: string;
    },
  ) => getSolutionList({ ...params, ...formData });

  const { tableProps, search } = useAntdTable(getTableData, {
    defaultCurrent: 1,
    defaultPageSize: 10,
    form,
  });

  return <TableUI tableProps={tableProps}>
```

使用getTableData包裹我们的异步函数，主要是进行请求参数转换和返回值转换，或者异步函数直接符合要求，这一步可以直接省略：

```typescript

export const getSolutionList = async (params: {
  current: number;
  pageSize: number;
},formData: { solutionName?: string }): Promise<GetSolutionListResponse> => {
  ...
  return {
    ...,
    list,
    total,
  }
};

const { tableProps, search } = useAntdTable(getSolutionList, {
  defaultCurrent: 1,
  defaultPageSize: 10,
  form,
});
```

#### 总结  

以上就是整个列表快速开发的全部步骤，这里的步骤对于所有列表来说唯一不同的地方在于我们要使用不同的表单，但是表单部分是和列表分离的，因此对于这个列表来说，我们只需要将几段模板化的代码组合一下就可以实现一个新的UI。

同时它统一了列表的交互方式，这带来了一些好处：
- 无需处理表格加载的loadding
- 无需处理分页事件（这常常导致bug）
- 无需处理列表数据重置

这样不仅加快了功能实现的速度同时又大大降低了bug产生的概率，极大的提高了工作效率。