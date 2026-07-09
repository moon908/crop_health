/* eslint-disable no-var */
declare global {
  var globalAnalysisCache: Record<string, any> | undefined;
  var globalImageCache: Record<string, Buffer> | undefined;
}

// In-memory persistent caches for crop health analysis results and uploaded images
export const ANALYSIS_CACHE = globalThis.globalAnalysisCache ?? {};
export const IMAGE_CACHE = globalThis.globalImageCache ?? {};

if (process.env.NODE_ENV !== "production") {
  globalThis.globalAnalysisCache = ANALYSIS_CACHE;
  globalThis.globalImageCache = IMAGE_CACHE;
}
