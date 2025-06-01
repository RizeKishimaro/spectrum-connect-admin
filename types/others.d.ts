export type SIPProvider = {
  id: number
  IpHost: string
  DIDNumber: string
  IpRange: string
  SipUsername: string
  SipPassword: string
  SipTech: string
  AccessToken: string
  CallLimit: string
  EndpointName: string
  _count: any
  companies: string
  rtpAddresses: string
}

export type Company = {
  id: number
  name: string
  membersCount: string
  address: string
  country: string
  state: string
  SIPProvider: SIPProvider
  agentsCount: number

}

type Agent = {
  id: string;
  name: string;
  sipUname: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  status: string;
  systemCompany: any;
};

export type IVRNode = {
  id: string;
  name: string;
  action: 'Playback' | 'PlayWithDTMF' | 'transfer';
  parameter?: [string, { option: string[] }];
  dtmfKey?: string;
  option?: string[];
  children?: IVRNode[];
};



