import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Health {
  private baseUrl = '';

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.put(`${this.baseUrl}/upload/`, formData, {
      headers: { 'x-api-key': environment.uploadApiKey },
    });
  }

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

  getLatestImageGroup(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/ai-result/latest-group?t=${Date.now()}`,
      {
        withCredentials: true,
      },
    );
  }
}