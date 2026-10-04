export interface GamePerformance {
  fps: number; avgFrameMs: number; p95FrameMs: number;
  avgSimulationMs: number; avgRenderMs: number; avgSteps: number;
  avgTargetSearches: number; avgProjectileChecks: number;
  avgRivalAiMs: number; avgAllyAiMs: number; avgProjectileMs: number;
  allies: number; rivals: number; bullets: number; particles: number; loot: number;
  worldColliders: number; solidWorldViolations: number;
  unstuckTriggers: number; unstuckActive: number; stuckPressure: number;
  flowLaneRedirects: number; edgeRecoveries: number; hardUnstuckTriggers: number;
  leftEdgePopulation: number; rightEdgePopulation: number;
  allyCentroidX: number; allyCentroidY: number; rivalCentroidX: number; rivalCentroidY: number;
  speed: number; camera: { centerX: number; centerY: number; zoom: number };
  viewport: { width: number; height: number; dpr: number };
  sampledAt: number;
}
declare global { interface Window { __GAME_PERF__?: GamePerformance; } }
