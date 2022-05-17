//Diese Klassen representieren die Json Datein und sollten damit die gleiche Struktur haben.
//Sollte nur in der LoadJourneySuccses Action benutzt werden.
//Reducer nimmt daten und fügt in den Store(kann komplett anders aussehen)
export interface Journey {
  id: number;
  title: string;
  sections: [] ;
}
export interface Step {
  id: number,
  isVisited: boolean,
  content: string,
}

/*
export const JOURNEYS = [
  {
    id: 1,
    title: "Getting Started | Hello World",
    steps: [
      {
        id: 1,
        isVisited: true,
        content: "Welcome to the Introduction this is going to be nonsense",
      },
      {
        id: 2,
        isVisited: false,
        content: "Bliblablub",
      },
      {
        id: 3,
        isVisited: false,
        content: "Stept one of your Journey is accomplished",
      }
    ],
    currentStep: 1,
    amountSteps: 3,
    journeyFinished: false,
  },
  {
    id: 2,
    title: "2nd Journey",
    steps: [
      {
        id: 1,
        isVisited: true,
        content: "Welcome to your second journey",
      },
      {
        id: 2,
        isVisited: false,
        content: "Bliblablub",
      },
      {
        id: 3,
        isVisited: false,
        content: "Step two of your Journey is accomplished",
      }
    ],
    currentStep: 1,
    amountSteps: 3,
    journeyFinished: false,
  }
]
*/
