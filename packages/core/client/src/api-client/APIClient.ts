import { APIClient as APIClientSDK } from '@nocobase/sdk';
import { Result } from 'ahooks/lib/useRequest/src/types';
import { notification } from 'antd';
import React from 'react';

const handleErrorMessage = (error) => {
  const reader = new FileReader();
  reader.readAsText(error?.response?.data, 'utf-8');
  reader.onload = function () {
    notification.error({
      message: JSON.parse(reader.result as string).errors?.map?.((error: any) => {
        return React.createElement('div', { children: error.message });
      }),
    });
  };
};
export class APIClient extends APIClientSDK {
  services: Record<string, Result<any, any>> = {};
  silence = false;

  service(uid: string) {
    return this.services[uid];
  }

  interceptors() {
    this.axios.interceptors.request.use((config) => {
      config.headers['X-With-ACL-Meta'] = true;
      const match = location.pathname.match(/^\/apps\/([^/]*)\//);
      if (match) {
        config.headers['X-App'] = match[1];
      }
      return config;
    });
    super.interceptors();
    this.notification();
  }

  notification() {
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (this.silence) {
          throw error;
        }
        const redirectTo = error?.response?.data?.redirectTo;
        if (redirectTo) {
          return (window.location.href = redirectTo);
        }
        if (error?.response?.data?.type === 'application/json') {
          handleErrorMessage(error);
        } else {
          notification.error({
            message: error?.response?.data?.errors?.map?.((error: any) => {
              return React.createElement('div', { children: error.message });
            }),
          });
        }
        throw error;
      },
    );
  }

  silent() {
    this.silence = true;
    return this;
  }
}
