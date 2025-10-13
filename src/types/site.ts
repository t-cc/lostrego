export interface Site {
  id?: string;
  name: string;
  logo?: string; // base64 image
  appId?: string;
}

export interface SiteUser {
  id?: string;
  user: string; // reference to user document ID (email)
  site: string; // reference to site document ID
}
