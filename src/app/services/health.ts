import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Health {
  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getLatestAIResult(): Observable<any> {
    return this.http.get(`${this.baseUrl}/ai-result/latest?t=${Date.now()}`, {
      withCredentials: true,
    });
  }

  getLatestAIResultForce(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/ai-result/latest?force=true&t=${Date.now()}`,
      {
        withCredentials: true,
      },
    );
  }

  getLatestImage(): Observable<any> {
    return this.http.get(`${this.baseUrl}/images/latest?t=${Date.now()}`);
  }

  // ===== เพิ่มใหม่: ดึงภาพล่าสุด + crop ทุกใบในภาพนั้น =====
  getLatestImageGroup(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/ai-result/latest-group?t=${Date.now()}`,
      {
        withCredentials: true,
      },
    );
  }
}