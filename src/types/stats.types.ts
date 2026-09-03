export interface MetricStatItem {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  iconType: 'box' | 'clock' | 'chat' | 'heart';
  badgeColor?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  iconName: string;
  path: string;
  badgeCount?: number;
  isActive?: boolean;
}
