/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
import axios, { AxiosError, AxiosResponse } from 'axios';
import { Commit, ActionContext } from 'vuex';
import { ResponseSuccess, ResponseFailure, BeebopError } from './types';

export interface ResponseWithType<T> extends ResponseSuccess {
    data: T
}

export function isAPIError(object: any): object is BeebopError {
  return object && typeof object.error === 'string'
        && (object.detail === undefined || typeof object.detail === 'string');
}

export function isAPIResponseFailure(object: any): object is ResponseFailure {
  return object && object.status === 'failure'
        && (Array.isArray(object.errors))
        && object.errors.every((e: any) => isAPIError(e));
}

export interface API<S, E> {

    withError: (type: E) => API<S, E>
    withSuccess: (type: S) => API<S, E>
    ignoreErrors: () => API<S, E>
    ignoreSuccess: () => API<S, E>

    get<T>(url: string): Promise<void | ResponseWithType<T>>
}

type OnError = (failure: ResponseFailure) => void;
type OnSuccess = (success: ResponseSuccess) => void;

export class APIService<S extends string, E extends string> implements API<S, E> {
    private readonly _commit: Commit;

    constructor(context: ActionContext<any, any>) {
      this._commit = context.commit;
    }

    private _ignoreErrors = false;

    private _ignoreSuccess = false;

    static getFirstErrorFromFailure = (failure: ResponseFailure) => {
      if (failure.errors.length === 0) {
        return APIService
          .createError('API response failed but did not contain any error information. Please contact support.');
      }
      return failure.errors[0];
    };

    static createError(detail: string): BeebopError {
      return {
        error: 'MALFORMED_RESPONSE',
        detail,
      };
    }

    private _onError: OnError | null = null;

    private _onSuccess: OnSuccess | null = null;

    withError = (type: E) => {
      this._onError = (failure: ResponseFailure) => {
        if (APIService.getFirstErrorFromFailure(failure).error === 'Wrong Token') {
          this._commit('setToken', null);
        }
        this._commit(type, APIService.getFirstErrorFromFailure(failure));
      };
      return this;
    };

    ignoreErrors = () => {
      this._ignoreErrors = true;
      return this;
    };

    ignoreSuccess = () => {
      this._ignoreSuccess = true;
      return this;
    };

    withSuccess = (type: S) => {
      this._onSuccess = (data: any) => {
        this._commit(type, data);
      };
      return this;
    };

    private _handleAxiosResponse(promise: Promise<AxiosResponse>) {
      return promise.then((axiosResponse: AxiosResponse) => {
        const success = axiosResponse && axiosResponse.data;
        const { data } = success;
        if (this._onSuccess) {
          this._onSuccess(data);
        }
        return axiosResponse.data;
      }).catch((e: AxiosError) => this._handleError(e));
    }

    private _handleError = (e: AxiosError) => {
      console.log(e.response?.data || e);
      if (this._ignoreErrors) {
        return;
      }

      const failure = e.response && e.response.data;

      if (!isAPIResponseFailure(failure)) {
        this._commitError(APIService.createError('Could not parse API response. Please contact support.'));
      } else if (this._onError) {
        this._onError(failure);
      } else {
        this._commitError(APIService.getFirstErrorFromFailure(failure));
      }
    };

    private _commitError = (error: BeebopError) => {
      this._commit({ type: 'addError', payload: error });
    };

    private _verifyHandlers(url: string) {
      if (this._onError == null && !this._ignoreErrors) {
        console.warn(`No error handler registered for request ${url}.`);
      }
      if (this._onSuccess == null && !this._ignoreSuccess) {
        console.warn(`No success handler registered for request ${url}.`);
      }
    }

    async get<T>(url: string): Promise<void | ResponseWithType<T>> {
      this._verifyHandlers(url);
      return this._handleAxiosResponse(axios.get(url));
    }

    async post<T>(url: string, body: any): Promise<void | ResponseWithType<T>> {
      this._verifyHandlers(url);
      const headers = { 'Content-Type': 'application/json' };
      return this._handleAxiosResponse(axios.post(url, body, { headers }));
    }
}

export const api = <S extends string, E extends string>(ctx: ActionContext<any, any>):
    APIService<S, E> => new APIService<S, E>(ctx);
