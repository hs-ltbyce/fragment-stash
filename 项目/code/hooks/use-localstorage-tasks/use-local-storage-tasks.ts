import { useInterval, useLocalStorageState } from "ahooks";
import { Options } from "ahooks/lib/createUseStorageState";
import { useEffect, useState } from "react";
import {
  AsyncTaskStatus,
  getAsyncTaskStatus,
  GetAsyncTaskStatusResponse,
} from "../request/get-async-task";

export type AsyncTaskMap = Map<string, string>;
export type AsyncTaskArray = Array<[string, string]>;

export default function useLocalStorageAsyncTask(
  // 创建异步任务时的key， 可以通过创建时传入自定义key覆盖
  key: string,
  options?: Options<AsyncTaskArray> & {
    /** 是否首次渲染立即执行 */
    immediate?: boolean;
    /** 定时器执行间隔 ms */
    delay?: number;
    /** 是否启用轮询 */
    enable?: boolean;
    /** 自定义异步获取状态时间 */
    asyncQueryRequest?: (taskId: string) => Promise<GetAsyncTaskStatusResponse>;
    /** 异步任务结束后的回调 */
    callback?: (asyncRes: GetAsyncTaskStatusResponse) => void;
  }
) {
  const delay = options?.delay ?? 3000;
  const enableInterval = options?.enable ?? true;
  const immediate = options?.immediate ?? false;

  const [interval, setInterval] = useState<number | undefined>(undefined);
  const [progressMsg, setProgressMsg] = useState<string | undefined>(undefined);
  const [asyncTask, setAsyncTask] = useLocalStorageState<AsyncTaskArray>(
    "asyncTask",
    {
      ...options,
    }
  );
  const taskId = new Map(asyncTask).get(key);

  const clearAsyncTask = (): void => {
    const asyncTaskMap: AsyncTaskMap = new Map(asyncTask);
    asyncTaskMap.delete(key);
    setAsyncTask([...asyncTaskMap]);
    setProgressMsg(undefined);
  };

  const addAsyncTask = (taskId: string, customKey?: string): void => {
    const asyncTaskMap: AsyncTaskMap = new Map(asyncTask);
    // 增加异步任务时，如果传入自定义key则使用，否则使用key
    asyncTaskMap.set(customKey ?? key, taskId);
    setAsyncTask([...asyncTaskMap]);
    setProgressMsg(undefined);
  };

  const fetchAsyncTaskStatus = options?.asyncQueryRequest ?? getAsyncTaskStatus;

  const asyncQueryStatus = async (taskId?: string) => {
    if (typeof taskId === "undefined") return;
    const res = await fetchAsyncTaskStatus(taskId);
    setProgressMsg(res?.message);
    if (
      res.taskStatus === AsyncTaskStatus.SUCCESS ||
      res.taskStatus === AsyncTaskStatus.FAIL
    ) {
      clearAsyncTask();
      setInterval(undefined);
      options?.callback?.(res);
    }
  };

  useInterval(() => asyncQueryStatus(taskId), interval, {
    immediate,
  });

  useEffect(() => {
    if (!enableInterval) {
      setInterval(undefined);
      return;
    }
    if (typeof taskId !== "undefined" && enableInterval) {
      setInterval(delay);
    }
  }, [taskId, enableInterval]);

  return {
    taskId,
    message: progressMsg,
    clear: clearAsyncTask,
    add: addAsyncTask,
  };
}
