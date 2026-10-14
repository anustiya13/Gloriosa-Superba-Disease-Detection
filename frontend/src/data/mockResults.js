// ============================================================
// mockResults.js
// Mock AI prediction data for frontend development.
//
// TODO: Remove this file when the real backend API is connected.
//       All data will come from the POST /api/predict response.
// ============================================================

/**
 * Mock disease result — used when no real backend is available.
 * Structure mirrors the expected real backend JSON response.
 *
 * Expected future backend response shape:
 * {
 *   disease: string,
 *   severity: "Healthy" | "Mild" | "Moderate" | "Severe",
 *   confidence: number (0–100),
 *   description: string,
 *   recommendation: {
 *     actions: string[],
 *     treatment: string[],
 *   }
 * }
 */

export const mockResults = [
  {
    id: "mock-1",
    disease: "Leaf Blight",
    severity: "Moderate",
    confidence: 91,
    description:
      "The plant shows signs of leaf blight. Brownish patches are visible on affected leaves.",
    recommendation: {
      actions: [
        "Remove severely affected leaves immediately",
        "Avoid overhead watering to reduce leaf wetness",
        "Monitor nearby plants for similar symptoms",
        "Isolate the affected plant if possible",
      ],
      treatment: [
        "Apply copper-based fungicide as directed",
        "Spray neem oil solution (2%) on affected areas",
        "Repeat treatment after 7 days if symptoms persist",
      ],
    },
  },
  {
    id: "mock-2",
    disease: null,
    severity: "Healthy",
    confidence: 97,
    description: "The plant appears healthy with no visible disease symptoms.",
    recommendation: {
      actions: [
        "Continue regular watering schedule",
        "Monitor for any early signs of disease",
        "Maintain good soil nutrition",
      ],
      treatment: [],
    },
  },
  {
    id: "mock-3",
    disease: "Stem Rot",
    severity: "Severe",
    confidence: 88,
    description:
      "Severe stem rot detected. The base of the stem shows significant discoloration and soft tissue.",
    recommendation: {
      actions: [
        "Remove the affected plant to prevent spread",
        "Do not replant in the same soil immediately",
        "Inspect neighboring plants for early signs",
        "Improve drainage in the planting area",
      ],
      treatment: [
        "Apply systemic fungicide to soil around the plant",
        "Use well-drained soil for replanting",
        "Treat surrounding soil with lime to reduce acidity",
      ],
    },
  },
  {
    id: "mock-4",
    disease: "Mosaic Virus",
    severity: "Mild",
    confidence: 84,
    description:
      "Early signs of mosaic virus detected. Light mottling and discoloration is visible on leaves.",
    recommendation: {
      actions: [
        "Remove and destroy affected leaves",
        "Control aphid population which spreads the virus",
        "Avoid handling healthy plants after touching affected ones",
        "Wash hands and tools before working with other plants",
      ],
      treatment: [
        "Apply insecticide to control aphid vectors",
        "Use reflective mulch to deter aphids",
        "There is no cure for virus; focus on prevention",
      ],
    },
  },
];

/**
 * Simulates a random result for demo purposes.
 * Replace with real API call in production.
 */
export function getRandomMockResult() {
  const index = Math.floor(Math.random() * mockResults.length);
  return mockResults[index];
}

/**
 * Mock history entries for the History page.
 * TODO: Replace with real backend/database data.
 */
export const mockHistory = [
  {
    id: "h1",
    date: "2026-10-03",
    disease: "Leaf Blight",
    severity: "Moderate",
    imageUrl: null,
  },
  {
    id: "h2",
    date: "2026-10-01",
    disease: null,
    severity: "Healthy",
    imageUrl: null,
  },
  {
    id: "h3",
    date: "2026-09-28",
    disease: "Mosaic Virus",
    severity: "Mild",
    imageUrl: null,
  },
  {
    id: "h4",
    date: "2026-09-25",
    disease: "Stem Rot",
    severity: "Severe",
    imageUrl: null,
  },
];
