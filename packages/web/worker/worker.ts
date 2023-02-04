import "./patchGlobal";

import {
  checkPackage,
  checkTgz,
  getProblems,
  getSummarizedProblems,
  type Analysis,
  type ProblemSummary,
  type ResolutionProblem,
} from "are-the-types-wrong-core";

export interface CheckPackageEventData {
  kind: "check-package";
  packageName: string;
  version: string | undefined;
}

export interface CheckFileEventData {
  kind: "check-file";
  file: Uint8Array;
}

export interface ResultMessage {
  kind: "result";
  data: {
    analysis: Analysis;
    problemSummaries: ProblemSummary[];
    resolutionProblems: ResolutionProblem[];
  };
}

onmessage = async (event: MessageEvent<CheckPackageEventData | CheckFileEventData>) => {
  const analysis =
    event.data.kind === "check-file"
      ? await checkTgz(event.data.file)
      : await checkPackage(event.data.packageName, event.data.version);
  const problemSummaries = getSummarizedProblems(analysis);
  const resolutionProblems = analysis.containsTypes ? getProblems(analysis) : [];
  postMessage({
    kind: "result",
    data: {
      analysis,
      problemSummaries,
      resolutionProblems,
    },
  } satisfies ResultMessage);
};
