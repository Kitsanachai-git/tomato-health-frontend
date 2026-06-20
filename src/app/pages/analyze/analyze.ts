import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Health } from '../../services/health';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

export interface Notification {
  id: number;
  type: 'disease' | 'healthy';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface LeafResult {
  id: number;
  disease_name: string;
  confidence: number;
  recommendation: string;
  crop_url: string;
}

@Component({
  selector: 'app-analyze',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
  ],
  templateUrl: './analyze.html',
  styleUrls: ['./analyze.scss'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate(
          '300ms ease',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease',
          style({ opacity: 0, transform: 'translateY(-10px)' }),
        ),
      ]),
    ]),
  ],
})
export class Analyze implements OnInit, OnDestroy {
  imageUrl: any;
  leaves: LeafResult[] = [];
  leafCount = 0;
  loading = true;

  date = '';
  time = '';
  scanTime = '-';
  nextRefreshIn = 30 * 60;

  notifications: Notification[] = [];
  showBanner = true;
  private lastImageId: number | null = null;
  private notifIdCounter = 0;
  private intervalId: any;
  private countdownId: any;

  constructor(
    private api: Health,
    private auth: Auth,
    private router: Router,
  ) {}

  get unreadCount() {
    return this.notifications.filter((n) => !n.read).length;
  }

  // มีใบไหนเป็นโรคบ้างไหมในกลุ่มนี้
  get hasDisease(): boolean {
    return this.leaves.some(
      (l) => l.disease_name?.toLowerCase() !== 'healthy',
    );
  }

  get nextRefreshDisplay(): string {
    const m = Math.floor(this.nextRefreshIn / 60);
    const s = this.nextRefreshIn % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  ngOnInit(): void {
    this.loadData();
    this.startAutoRefresh();

    this.countdownId = setInterval(() => {
      if (this.nextRefreshIn > 0) this.nextRefreshIn--;
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    clearInterval(this.countdownId);
  }

  private startAutoRefresh(): void {
    clearInterval(this.intervalId);
    this.intervalId = setInterval(
      () => {
        this.loadData();
        this.nextRefreshIn = 30 * 60;
      },
      30 * 60 * 1000,
    );
  }

  loadData() {
    const start = Date.now();
    this.loading = true;

    this.api.getLatestImageGroup().subscribe((res: any) => {
      this.handleResult(res, Date.now() - start);
    });
  }

  manualRefresh() {
    const start = Date.now();
    this.loading = true;

    this.api.getLatestImageGroup().subscribe((res: any) => {
      this.handleResult(res, Date.now() - start);
    });

    this.nextRefreshIn = 30 * 60;
    this.startAutoRefresh();
  }

  private handleResult(res: any, elapsed: number) {
    this.imageUrl = res?.image_url ?? null;
    this.leaves = res?.leaves ?? [];
    this.leafCount = res?.leaf_count ?? 0;

    const now = new Date();
    this.date = now.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    this.time = now.toLocaleTimeString('th-TH');
    this.scanTime = elapsed + ' ms';
    this.loading = false;

    if (res?.image_id && res.image_id !== this.lastImageId) {
      this.lastImageId = res.image_id;

      if (!this.hasDisease) return;

      this.showBanner = true;

      // แจ้งเตือนเฉพาะใบที่เป็นโรค
      this.leaves
        .filter((l) => l.disease_name?.toLowerCase() !== 'healthy')
        .forEach((l) => {
          this.notifications.unshift({
            id: ++this.notifIdCounter,
            type: 'disease',
            title: `ตรวจพบ: ${l.disease_name}`,
            message: l.recommendation ?? '',
            time: `${this.date} ${this.time}`,
            read: false,
          });
        });

      if (this.notifications.length > 20) {
        this.notifications = this.notifications.slice(0, 20);
      }
    }
  }

  markRead(n: Notification) {
    n.read = true;
  }

  markAllRead() {
    this.notifications.forEach((n) => (n.read = true));
  }

  dismissBanner() {
    this.showBanner = false;
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}