export enum AsyncTaskStatus {
  IN_PROGRESS = "IN_PROGRESS",
  SUCCESS = "SUCCESS",
  FAIL = "FAIL",
}

export interface GetAsyncTaskStatusResponse<T = any> extends APIResponse {
  taskStatus: AsyncTaskStatus;
  values?: T;
  message?: string;
}
