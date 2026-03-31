export interface PlanetData {
  name: string;
  field: string;
  color: string;
  glowColor: string;
  orbitRadius: number;
  size: number;
  speed: number;
  tilt: number;
  hasRings?: boolean;
  hasMoon?: boolean;
  hasMoons?: boolean;
  roughness: number;
  metalness: number;
  atmosphereColor?: [number, number, number];
  atmosphereThickness?: number;
  desc: string;
  planetDesc: string;
  tags: string[];
  minds: { name: string; role: string; initial: string }[];
  shaderType: number;
  col1: [number, number, number];
  col2: [number, number, number];
  col3: [number, number, number];
}

export const PLANETS: PlanetData[] = [
  {
    // Mercury → Philosophy: the closest to the sun = closest to pure truth
    name: "Mercury",
    field: "Philosophy",
    color: "#c0ccff",
    glowColor: "#8898ee",
    orbitRadius: 28,
    size: 1.1,
    speed: 2.1,
    tilt: 0.03,
    roughness: 0.88,
    metalness: 0.22,
    shaderType: 0,
    col1: [0.76, 0.8, 1.0],
    col2: [0.32, 0.35, 0.58],
    col3: [0.92, 0.94, 1.0],
    desc: "Philosophy probes the bedrock of existence, knowledge, and value. Like Mercury perpetually racing around the sun, it asks questions that circle back endlessly: What is real? What is just? What is beauty? From Socratic dialogue to phenomenology, it remains humanity's most fundamental intellectual tradition.",
    planetDesc:
      "Mercury is the smallest and innermost planet in the Solar System. Its surface is heavily cratered, resembling Earth's Moon, and it experiences extreme temperature fluctuations—ranging from scorching 800°F (430°C) days to freezing -290°F (-180°C) nights—due to its lack of a significant atmosphere.",
    tags: [
      "Metaphysics",
      "Epistemology",
      "Ethics",
      "Logic",
      "Aesthetics",
      "Phenomenology",
      "Ontology",
    ],
    minds: [
      { name: "Plato", role: "Athenian Philosopher", initial: "P" },
      { name: "Immanuel Kant", role: "Critical Philosophy", initial: "K" },
      { name: "Simone de Beauvoir", role: "Existentialism", initial: "B" },
    ],
  },
  {
    // Venus → Arts: golden, radiant, beautiful
    name: "Venus",
    field: "Arts",
    color: "#ffb050",
    glowColor: "#e07020",
    orbitRadius: 45,
    size: 1.75,
    speed: 1.35,
    tilt: 0.05,
    roughness: 0.22,
    metalness: 0.0,
    atmosphereColor: [1.0, 0.68, 0.3],
    atmosphereThickness: 1.8,
    shaderType: 1,
    col1: [1.0, 0.68, 0.3],
    col2: [0.8, 0.38, 0.1],
    col3: [1.0, 0.9, 0.52],
    desc: "Arts and Humanities encompass humanity's creative and interpretive endeavors — literature, music, visual art, theater, and cultural inquiry. Like Venus blazing in the twilight sky, art illuminates the world with beauty and meaning. It preserves our stories and celebrates the full depth of human experience.",
    planetDesc:
      "Venus is Earth's closest planetary neighbor and the hottest planet in our solar system. Despite being named after the goddess of beauty, it is a hellish world with a crushing, toxic atmosphere consisting mainly of carbon dioxide, wrapped in thick yellowish clouds of sulfuric acid that trap heat in a runaway greenhouse effect.",
    tags: [
      "Literature",
      "Music",
      "Visual Art",
      "Theater",
      "Film",
      "Architecture",
      "Dance",
      "Cultural Studies",
    ],
    minds: [
      { name: "Leonardo da Vinci", role: "Renaissance Polymath", initial: "L" },
      { name: "Frida Kahlo", role: "Iconic Painter", initial: "F" },
      {
        name: "Ludwig van Beethoven",
        role: "Symphonic Composer",
        initial: "B",
      },
    ],
  },
  {
    // Earth → Business: civilization, trade routes, global networks
    name: "Earth",
    field: "Business",
    color: "#38e888",
    glowColor: "#18b860",
    orbitRadius: 65,
    size: 2.0,
    speed: 1.0,
    tilt: 0.41,
    hasMoon: true,
    roughness: 0.6,
    metalness: 0.05,
    atmosphereColor: [0.18, 0.6, 0.98],
    atmosphereThickness: 1.35,
    shaderType: 2,
    col1: [0.14, 0.58, 0.32],
    col2: [0.03, 0.1, 0.35],
    col3: [0.9, 0.92, 0.96],
    desc: "Business and Economics are the engines of civilization — the networks of trade, innovation, and value creation that sustain societies. Like Earth's interconnected biosphere, markets are living systems driven by supply, demand, risk, and human ambition. From the Silk Road to fintech, commerce shapes the world.",
    planetDesc:
      "Earth is our home planet and the only known astronomical object capable of harboring life. It is the densest planet in the Solar System, possessing a protective magnetic field, dynamic tectonic plates, liquid oceans that cover 71% of its surface, and an oxygen-rich atmosphere that sustains a rich diversity of lifeforms.",
    tags: [
      "Entrepreneurship",
      "Finance",
      "Marketing",
      "Economics",
      "Strategy",
      "Management",
      "Investing",
      "Trade",
    ],
    minds: [
      { name: "Adam Smith", role: "Father of Economics", initial: "S" },
      { name: "Warren Buffett", role: "Investment Pioneer", initial: "B" },
      { name: "Steve Jobs", role: "Visionary Entrepreneur", initial: "J" },
    ],
  },
  {
    // Mars → Technology: red, bold, engineering & conquest
    name: "Mars",
    field: "Technology",
    color: "#ff5530",
    glowColor: "#cc2200",
    orbitRadius: 90,
    size: 1.4,
    speed: 0.78,
    tilt: 0.44,
    roughness: 0.92,
    metalness: 0.08,
    atmosphereColor: [0.85, 0.28, 0.12],
    atmosphereThickness: 0.8,
    shaderType: 3,
    col1: [0.92, 0.28, 0.08],
    col2: [0.55, 0.14, 0.03],
    col3: [1.0, 0.52, 0.28],
    desc: "Technology transforms scientific knowledge into tools, structures, and systems that redefine what is possible. From ancient aqueducts to quantum computers and neural networks, engineering is humanity's greatest act of making. It drives progress, solves crises, and forever moves the boundary between imagination and reality.",
    planetDesc:
      "Mars is often called the 'Red Planet' due to the widespread presence of iron oxide (rust) on its surface. It hosts the tallest volcano in the Solar System, Olympus Mons, and massive canyon systems like Valles Marineris. Traces of ancient riverbeds hint at a wet, potentially habitable geological past.",
    tags: [
      "Software",
      "AI",
      "Robotics",
      "Bioengineering",
      "Electrical",
      "Mechanical",
      "Computer Science",
      "Cybersecurity",
    ],
    minds: [
      { name: "Ada Lovelace", role: "First Programmer", initial: "A" },
      { name: "Alan Turing", role: "Father of Computing", initial: "T" },
      { name: "Nikola Tesla", role: "Electrical Engineering", initial: "N" },
    ],
  },
  {
    // Jupiter → Mathematics: vast, fundamental, governs all
    name: "Jupiter",
    field: "Mathematics",
    color: "#ffaa55",
    glowColor: "#cc7020",
    orbitRadius: 132,
    size: 4.8,
    speed: 0.45,
    tilt: 0.05,
    hasMoons: true,
    roughness: 0.7,
    metalness: 0.03,
    atmosphereColor: [0.9, 0.62, 0.32],
    atmosphereThickness: 1.1,
    shaderType: 4,
    col1: [0.9, 0.62, 0.34],
    col2: [1.0, 0.84, 0.54],
    col3: [0.55, 0.3, 0.1],
    desc: "Mathematics is the universe's native language — a discipline of pure abstraction and rigorous logic. Like Jupiter's gravity silently governing the entire solar system, mathematics underlies every science and structure. From Euclidean geometry to Riemannian manifolds, its theorems are eternal truths discovered rather than invented.",
    planetDesc:
      "Jupiter is by far the largest planet in our Solar System, a swirling gas giant made primarily of hydrogen and helium. It is famous for its Great Red Spot—a continuous storm larger than Earth—and its immense magnetic field, which creates intense radiation belts and shepherds dozens of fascinating moons.",
    tags: [
      "Algebra",
      "Calculus",
      "Topology",
      "Number Theory",
      "Statistics",
      "Logic",
      "Analysis",
      "Geometry",
    ],
    minds: [
      { name: "Euclid", role: "Father of Geometry", initial: "E" },
      { name: "Carl Gauss", role: "Prince of Mathematics", initial: "G" },
      { name: "Emmy Noether", role: "Abstract Algebra Pioneer", initial: "N" },
    ],
  },
  {
    // Saturn → History: Chronos = god of time; rings = layers of civilization
    name: "Saturn",
    field: "History",
    color: "#ffe080",
    glowColor: "#ccb040",
    orbitRadius: 182,
    size: 4.0,
    speed: 0.3,
    tilt: 0.47,
    hasRings: true,
    roughness: 0.65,
    metalness: 0.03,
    atmosphereColor: [1.0, 0.85, 0.45],
    atmosphereThickness: 0.95,
    shaderType: 5,
    col1: [0.96, 0.84, 0.48],
    col2: [0.62, 0.52, 0.28],
    col3: [1.0, 0.94, 0.62],
    desc: "History is humanity's collective memory — the record of civilizations, their rise and fall, and the events that shaped our present. Like Saturn's rings — countless layers orbiting an ancient core — history is composed of overlapping strata of time, each one shaping the next. To know history is to understand who we are.",
    planetDesc:
      "Saturn is the sixth planet from the Sun, instantly recognizable by its spectacular and complex ring system composed mostly of chunks of water ice and rock. It is incredibly massive yet has the lowest density of any planet—less dense than water—meaning it would float in a sufficiently large, cosmic ocean.",
    tags: [
      "Ancient History",
      "Archaeology",
      "Political History",
      "Economic History",
      "Historiography",
      "Anthropology",
    ],
    minds: [
      { name: "Herodotus", role: "Father of History", initial: "H" },
      { name: "Ibn Khaldun", role: "Sociology of History", initial: "I" },
      { name: "Hannah Arendt", role: "Political Thought", initial: "A" },
    ],
  },
  {
    // Uranus → Physics: tilted, radical, defying convention
    name: "Uranus",
    field: "Physics",
    color: "#40f0e8",
    glowColor: "#10c0b8",
    orbitRadius: 244,
    size: 3.1,
    speed: 0.18,
    tilt: 1.71,
    roughness: 0.35,
    metalness: 0.02,
    atmosphereColor: [0.18, 0.96, 0.92],
    atmosphereThickness: 1.5,
    shaderType: 6,
    col1: [0.22, 0.92, 0.88],
    col2: [0.08, 0.42, 0.42],
    col3: [0.55, 1.0, 0.98],
    desc: "Physics is the deepest description of reality — from quantum fields at Planck scale to the curvature of spacetime. Like Uranus spinning on its side and defying expectations, physics constantly overturns what we thought we knew. It is the foundation upon which all other natural sciences are built.",
    planetDesc:
      "Uranus is a frigid ice giant that seemingly rolls around the Sun on its side, likely due to a colossal collision early in its history. This extreme 98-degree axial tilt gives it highly unusual seasons where poles face the sun for decades, while its atmosphere of hydrogen, helium, and methane gives it a serene, pale blue hue.",
    tags: [
      "Quantum Mechanics",
      "Relativity",
      "Thermodynamics",
      "Electromagnetism",
      "Astrophysics",
      "Particle Physics",
      "Optics",
    ],
    minds: [
      { name: "Isaac Newton", role: "Laws of Motion & Gravity", initial: "N" },
      { name: "Albert Einstein", role: "Theory of Relativity", initial: "E" },
      {
        name: "Richard Feynman",
        role: "Quantum Electrodynamics",
        initial: "F",
      },
    ],
  },
  {
    // Neptune → Cosmology: the deep blue frontier
    name: "Neptune",
    field: "Cosmology",
    color: "#4488ff",
    glowColor: "#1144cc",
    orbitRadius: 315,
    size: 2.9,
    speed: 0.11,
    tilt: 0.49,
    roughness: 0.45,
    metalness: 0.02,
    atmosphereColor: [0.1, 0.38, 1.0],
    atmosphereThickness: 1.2,
    shaderType: 7,
    col1: [0.1, 0.3, 0.96],
    col2: [0.04, 0.08, 0.68],
    col3: [0.3, 0.62, 1.0],
    desc: "Cosmology investigates the largest scales of existence — the Big Bang, dark matter, dark energy, black holes, and the ultimate fate of the universe. Like Neptune at the edge of our solar system, cosmology gazes into the unimaginable: billions of galaxies, gravitational waves, and light from the first moments after creation.",
    planetDesc:
      "Neptune is the eighth and farthest-known planet from the Sun, a dark, cold, and supersonic world. It is the only planet in our solar system found by mathematical prediction rather than empirical observation. Its vibrant blue atmosphere features the strongest winds in the solar system, whipping freezing clouds at over 1,200 mph.",
    tags: [
      "Astrophysics",
      "Dark Matter",
      "Black Holes",
      "Big Bang",
      "Gravitational Waves",
      "Exoplanets",
      "SETI",
    ],
    minds: [
      { name: "Galileo Galilei", role: "Telescopic Astronomer", initial: "G" },
      {
        name: "Stephen Hawking",
        role: "Theoretical Cosmologist",
        initial: "H",
      },
      { name: "Vera Rubin", role: "Dark Matter Evidence", initial: "R" },
    ],
  },
];
