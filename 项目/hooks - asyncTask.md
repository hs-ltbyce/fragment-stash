## [`useLocalStorageAsyncTask`](https://github.com/hs-ltbyce/fragment-stash/blob/main/%E9%A1%B9%E7%9B%AE/code/use-localstorage-tasks/use-local-storage-tasks.ts)

`useLocalStorageAsyncTask`可以用来管理本地存储异步任务。它可以帮助开发者创建、保存、查询和清除异步任务，并且支持异步任务的状态轮询和完成后的回调处理。使用该 Hook 可以简化异步任务管理的复杂性，提高开发效率

### 用法

```jsx
import { useLocalStorageAsyncTask } from "./useLocalStorageAsyncTask";

function App() {
  const { taskId, message, clear, add } = useLocalStorageAsyncTask("taskId");

  const handleClick = async () => {
    const taskId = await startAsyncTask();
    add(taskId);
  };

  return (
    <div>
      <p>Task ID: {taskId}</p>
      <p>Message: {message}</p>
      <button onClick={handleClick}>Start Task</button>
      <button onClick={clear}>Clear Task</button>
    </div>
  );
}
```

### 参数

`useLocalStorageAsyncTask` 接受两个参数：

1.  `key`：创建异步任务时的键。如果没有传入该参数，则使用默认值 `'taskId'`。
2.  `options`：可选的参数对象，包含以下属性：

    - `immediate`（默认为 `false`）：是否在组件挂载时立即执行检查任务状态的函数。如果设为 `true`，则会在组件挂载后立即执行。
    - `delay`（默认为 `3000`）：轮询检查任务状态的时间间隔，以毫秒为单位。
    - `enable`（默认为 `true`）：是否启用轮询检查任务状态的功能。
    - `asyncQueryRequest`：自定义异步获取状态时间的函数。如果未指定该参数，则默认使用 `getAsyncTaskStatus` 函数从服务器获取任务状态。
    - `callback`：异步任务结束后的回调函数。

### 返回值

`useLocalStorageAsyncTask` 返回一个对象，该对象包含以下属性：

- `taskId`：当前正在进行的任务的 ID。
- `message`：任务状态的消息。
- `clear`：从任务队列中删除当前任务的函数。
- `add`：将新的任务添加到任务队列中的函数。
- `addAsyncTask(taskId: string, customKey?: string): void`
  - 用于向异步任务列表中添加一个新的异步任务
  - `taskId`: 新添加的异步任务的 ID
  - `customKey` (optional): 自定义的键值，用于将异步任务与特定的键关联起来。如果不提供，则使用传入 `useLocalStorageAsyncTask` 的 `key`
- `fetchAsyncTaskStatus(taskId: string): Promise<GetAsyncTaskStatusResponse>`
  - 用于获取给定 `taskId` 的异步任务的状态
  - 返回 `Promise`，成功时将返回 `GetAsyncTaskStatusResponse` 类型的结果，包括任务状态、进度消息和任何错误消息
- `asyncQueryStatus(taskId?: string): Promise<void>`
  - 用于异步查询给定 `taskId` 的任务状态
  - 如果 `taskId` 未定义，则不执行任何操作
  - 查询任务状态时使用 `fetchAsyncTaskStatus` 函数获取异步任务状态。如果查询成功，则使用 `setProgressMsg` 函数更新进度消息，并在任务成功或失败时调用 `clearAsyncTask` 函数，并使用 `options?.callback?.(res)` 执行任务结束回调函数

使用示例:

```jsx
import React from "react";
import useLocalStorageAsyncTask from "./useLocalStorageAsyncTask";

const MyComponent = () => {
  const { taskId, message, clear, add } = useLocalStorageAsyncTask("myTaskId");

  const handleClick = async () => {
    // 创建异步任务
    const taskId = await createAsyncTask();
    // 将异步任务添加到列表中
    add(taskId);
  };

  return (
    <div>
      <div>Task ID: {taskId}</div>
      <div>Progress Message: {message}</div>
      <button onClick={handleClick}>Create Async Task</button>
      <button onClick={clear}>Clear Async Task</button>
    </div>
  );
};
```

在上面的示例中，`useLocalStorageAsyncTask` 函数的第一个参数是自定义的键值 `myTaskId`，将用于将异步任务与该键关联起来。在 `handleClick` 函数中，通过调用 `createAsyncTask` 函数创建一个新的异步任务，并将其添加到异步任务列表中。用户还可以通过单击 `Clear Async Task` 按钮来清除当前异步任务。

create by chatGPT
