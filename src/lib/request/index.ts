export const requestPost = async <T, R>(url: string, params: T): Promise<R> => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        // 建议添加更多默认头部
      },
      method: 'POST',
      body: JSON.stringify(params),
    });
    console.log('response', response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()) as R;
  } catch (error) {
    console.error('Request failed:', error);
    throw error; // 重新抛出错误以便调用方处理
  }
};

export const requestGet = async <T, R>(url: string, params?: T): Promise<R> => {
  try {
    // 如果有参数，构建带查询参数的URL
    let requestUrl = url;
    if (params) {
      const queryParams = new URLSearchParams();

      Object.entries(params as any).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const queryString = queryParams.toString();
      if (queryString) {
        requestUrl += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 可以添加认证头等
        // 'Authorization': `Bearer ${token}`
      },
    });

    console.log('response', response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()) as R;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};
