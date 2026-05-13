//const API_BASE_URL = 'http://localhost:5204/api';

// Nếu test bằng điện thoại Expo Go, đổi thành IP máy tính, ví dụ:
const API_BASE_URL = 'http://192.168.1.86:5204/api';

type ApiResponse<T> = {
  success: boolean;
  message: string | null;
  data: T;
};

export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  const json: ApiResponse<T> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Có lỗi xảy ra khi gọi API');
  }

  return json.data;
}

export async function apiPost<TResponse, TBody>(
  endpoint: string,
  body: TBody
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const rawText = await response.text();

  let json: ApiResponse<TResponse> | null = null;

  try {
    json = JSON.parse(rawText);
  } catch {
    console.log('Backend trả về không phải JSON:', rawText);
    throw new Error('Backend đang lỗi. Xem terminal Backend để biết lỗi thật.');
  }

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Có lỗi xảy ra khi gửi dữ liệu');
  }

  return json.data;
}