import type { IPluginConfig } from "./danger-plugin.js";
import {
  dartLicenseAuditor,
  detailsOutputter,
  getFriendlyProjectNameFromPath,
} from "./danger-plugin.js";

export { dartLicenseAuditor, detailsOutputter, getFriendlyProjectNameFromPath };
export type { IPluginConfig };
