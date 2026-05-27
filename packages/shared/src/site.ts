export interface Site {
  id?: string;
  name: string;
  logo?: string;
  appId?: string;
}

export interface SiteUser {
  id?: string;
  user: string;
  site: string;
}
