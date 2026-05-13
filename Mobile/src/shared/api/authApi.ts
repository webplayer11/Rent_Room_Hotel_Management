// src/shared/api/authApi.ts
// Dịch vụ gọi API xác thực từ Backend .NET

export interface LoginRequest {
  identifier: string;   // email hoặc số điện thoại
  password: string;
}

export interface LoginResponse {
  token: string;
  role: 'Admin' | 'Owner' | 'Customer';
}

/**
 * Cấu trúc phản hồi chuẩn từ Backend (ResponseApi.cs)
 */
export interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string | null;
  data: T | null;
}

// Thay bằng địa chỉ thực của Backend .NET
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:5204'; // Dùng cho Android Emulator

/**
 * Hàm giải mã JWT payload đơn giản cho React Native
 */
function getRoleFromToken(token: string): 'Admin' | 'Owner' | 'Customer' {
  try {
    const payloadBase64 = token.split('.')[1];
    // Base64Url to Base64
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    
    // Giải mã Base64 (dùng btoa/atob nếu có, hoặc thủ công)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = base64.replace(/=+$/, '');
    let output = '';
    
    if (str.length % 4 === 1) throw new Error('Invalid base64');
    
    for (let bc = 0, bs = 0, buffer, i = 0; (buffer = str.charAt(i++)); ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4) ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)))) : 0) {
      buffer = chars.indexOf(buffer);
    }

    const jsonPayload = decodeURIComponent(
      output.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    const payload = JSON.parse(jsonPayload);
    
    // ASP.NET Core Identity roles
    const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload['role'];
    return role as any;
  } catch (e) {
    console.error('Lỗi giải mã token:', e);
    return 'Customer';
  }
}

/**
 * Gọi API đăng nhập Backend .NET
 * Backend trả về ApiResponse<AuthResponseDto>
 */
export async function loginApi(payload: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email: payload.identifier, // Map identifier sang email (Backend dùng LoginDto.Email)
      password: payload.password,
    }),
  });

  const result: ApiResponse<{ token: string; refreshToken: string }> = await response.json();

  if (!response.ok || !result.isSuccess || !result.data) {
    throw new Error(result.message || 'Đăng nhập thất bại.');
  }

  const { token } = result.data;
  const role = getRoleFromToken(token);

  return { token, role };
}
