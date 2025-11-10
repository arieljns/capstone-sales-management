export interface HubspotContactProperties {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  company?: string;
  jobtitle?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface HubspotContactResponse {
  id: string;
  properties: HubspotContactProperties & {
    createdate?: string;
    lastmodifieddate?: string;
  };
}
