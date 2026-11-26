export type Coordinates = [number, number];

export type CampusId = "I" | "JK";

export type CourseArea = {
  name: string;
  courses: string[];
};

export type CourseGroup = {
  campus: CampusId;
  address: string;
  /** Campus I não é dividido em áreas; Campus JK é. */
  areas?: CourseArea[];
  courses?: string[];
};

/** Catálogo único de cursos da UFVJM/Diamantina, agrupado por campus e área. */
export const COURSE_CATALOG: CourseGroup[] = [
  {
    campus: "I",
    address: "Centro, Rua da Glória",
    courses: ["Odontologia"],
  },
  {
    campus: "JK",
    address: "Rodovia MGT 367, Km 583",
    areas: [
      {
        name: "Agrárias",
        courses: ["Agronomia", "Engenharia Florestal", "Zootecnia"],
      },
      {
        name: "Saúde e Biológicas",
        courses: [
          "Ciências Biológicas",
          "Educação Física",
          "Enfermagem",
          "Farmácia",
          "Fisioterapia",
          "Medicina",
          "Nutrição",
        ],
      },
      {
        name: "Exatas e Engenharias",
        courses: [
          "Ciência e Tecnologia",
          "Engenharia de Alimentos",
          "Engenharia Geológica",
          "Engenharia Mecânica",
          "Engenharia Química",
          "Matemática",
          "Química",
          "Química Tecnológica",
          "Sistemas de Informação",
        ],
      },
      {
        name: "Humanas e Letras",
        courses: [
          "Geografia",
          "História",
          "Humanidades",
          "Letras",
          "Pedagogia",
          "Políticas Públicas e Gestão Social",
          "Psicologia",
          "Turismo",
        ],
      },
    ],
  },
];

const COURSE_CAMPUS = new Map<string, CampusId>(
  COURSE_CATALOG.flatMap((group) => {
    const courses = [...(group.courses ?? []), ...(group.areas ?? []).flatMap((area) => area.courses)];
    return courses.map((course): [string, CampusId] => [course, group.campus]);
  }),
);

/** Campus derivado do curso — nunca escolhido de forma independente. */
export function campusForCourse(course: string): CampusId | undefined {
  return COURSE_CAMPUS.get(course.trim());
}

export type Rider = {
  id: number;
  name: string;
  initials: string;
  course: string;
  rating: number;
  color: string;
};

export const riders: Rider[] = [
  {
    id: 1,
    name: "Marina Lopes",
    initials: "ML",
    course: "Engenharia Florestal",
    rating: 4.9,
    color: "coral",
  },
  {
    id: 2,
    name: "Lucas Vieira",
    initials: "LV",
    course: "Sistemas de Informação",
    rating: 4.8,
    color: "blue",
  },
  { id: 3, name: "Ana Clara", initials: "AC", course: "Odontologia", rating: 5, color: "violet" },
];

export type FixtureRide = {
  id: number;
  driver: Rider;
  from: string;
  to: string;
  time: string;
  arrive: string;
  price: number;
  seats: number;
  extra: number;
  days: string;
  distance: string;
  note: string;
  passengers: Rider[];
  originCoordinates?: [number, number];
  destinationCoordinates?: [number, number];
};

export const fixtureRides: FixtureRide[] = [
  {
    id: 1,
    driver: riders[0],
    from: "Bairro da Palha",
    to: "Campus JK",
    time: "07:10",
    arrive: "07:42",
    price: 6,
    seats: 2,
    extra: 4,
    days: "Seg, qua e sex",
    distance: "8,4 km",
    note: "Paro próximo à praça. Carro prata.",
    passengers: [riders[2]],
    originCoordinates: [-43.585381, -18.2547098],
    destinationCoordinates: [-43.571112, -18.1958324],
  },
  {
    id: 2,
    driver: riders[1],
    from: "Centro Histórico",
    to: "Campus JK",
    time: "07:25",
    arrive: "07:55",
    price: 5,
    seats: 1,
    extra: 7,
    days: "Seg a qui",
    distance: "7,1 km",
    note: "Saída pontual. Posso buscar na rua de cima.",
    passengers: [riders[0], riders[2]],
    originCoordinates: [-43.601494, -18.2421738],
    destinationCoordinates: [-43.571112, -18.1958324],
  },
  {
    id: 3,
    driver: riders[2],
    from: "Rio Grande",
    to: "Campus I",
    time: "08:05",
    arrive: "08:22",
    price: 4,
    seats: 3,
    extra: 11,
    days: "Hoje",
    distance: "4,2 km",
    note: "Tenho espaço para mochila.",
    passengers: [],
    originCoordinates: [-43.5949043, -18.2412535],
    destinationCoordinates: [-43.601494, -18.2421738],
  },
];

export const CAMPUS_COORDINATES: Record<string, Coordinates> = {
  JK: [-43.571112, -18.1958324],
  I: [-43.601494, -18.2421738],
};

export const coordinatesForPlace = (place: string): Coordinates => {
  const normalized = place.toLowerCase();
  if (normalized.includes("campus jk")) return CAMPUS_COORDINATES.JK;
  if (normalized.includes("campus i")) return CAMPUS_COORDINATES.I;
  if (normalized.includes("palha")) return [-43.585381, -18.2547098];
  if (normalized.includes("rio grande")) return [-43.5949043, -18.2412535];
  return [-43.601494, -18.2421738];
};

export const coordinatesForPickup = (personId: number, index: number): Coordinates => {
  const known: Record<number, Coordinates> = {
    1: [-43.5968, -18.2328],
    2: [-43.5896, -18.2249],
    3: [-43.5829, -18.2158],
  };
  return known[personId] || [-43.594 + index * 0.002, -18.231 + index * 0.003];
};

