export interface PopulatedUserCard {
  card: Card;
  interval: number;
  lastReviewed: string;
  nextReview: string;
  _id: string;
}

export interface Card {
  _id: string;
  question: string;
  answer: string;
  interval: number;
  imageLink: string;
}
