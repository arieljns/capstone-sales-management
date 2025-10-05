export interface Comment {
  id: string;
  name: string;
  src: string;
  message: string;
  date: number;
}

export type Member = {
  id: string;
  name: string;
  email: string;
  img: string;
};

export type Product = {
  id: string;
  img: string;
  name: string;
  price: number;
  productCode: string;
};

export type Ticket = {
  ticket_id: number;
  ticket_labels: string[];
  ticket_attachments: {
    id: string;
    name: string;
    src: string;
    size: string;
  }[];
  ticket_comments: Comment[];
  ticket_stage:
    | 'QuotationSent'
    | 'FollowUp'
    | 'Negotiation'
    | 'DecisionPending'
    | 'ClosedWon'
    | 'ClosedLost';
  ticket_dealValue: number;
  bm_id: number;
  bm_name: string;
  bm_companySize: string;
  am_id: number;
  am_sentiment: string;
  am_decisionMaker: string;
  am_activationAgreement: string;
  am_expiredDate: string;
  am_products: Product[];
};

export type Columns = Record<string, Ticket[]>;
