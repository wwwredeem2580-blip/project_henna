import { generateAccessToken, generateRefreshToken } from "../../src/utils/auth/token";
import { describe, it, expect } from "vitest";

describe('handleError', () => {
  it('should generate token', () => {
    const token = generateAccessToken(
      { sub: '1', 
        email: 'test@gmail.com', 
        role: 'user', 
        firstName: 'John', 
        lastName: 'Doe' 
      });
    expect(token).toBeDefined()
  });

  it('should generate refresh token', () => {
    const token = generateRefreshToken(
      { sub: '1', 
        email: 'test@gmail.com', 
        role: 'user', 
        firstName: 'John', 
        lastName: 'Doe' 
      });
    expect(token).toBeDefined();
  });
});