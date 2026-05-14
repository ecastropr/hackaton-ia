import semver from "semver";
import dependencyPolicy from "../../policy/DEPENDENCY_POLICY.json";
import { DependencyInput, RuleOutcome } from "../types";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function validateDependencies(deps: DependencyInput[] = []): RuleOutcome[] {
  const outcomes: RuleOutcome[] = [];

  for (const dep of deps) {
    const match = dependencyPolicy.blocked_packages.find((pkg) => {
      return normalize(pkg.ecosystem) === normalize(dep.ecosystem) && normalize(pkg.package) === normalize(dep.package);
    });

    if (!match) {
      continue;
    }

    let hitsBlockedRange = false;
    if (semver.valid(dep.version)) {
      hitsBlockedRange = semver.satisfies(dep.version, match.version_range, { includePrerelease: true });
    }

    if (!hitsBlockedRange) {
      continue;
    }

    outcomes.push({
      rule: "DEPENDENCY_SECURITY",
      passed: false,
      severity: match.severity,
      message: `${dep.package}@${dep.version} bloqueado: ${match.reason}`,
      details: [
        `ecosystem=${dep.ecosystem}`,
        `version_range=${match.version_range}`,
        `alternative=${match.alternative}`
      ]
    });
  }

  return outcomes;
}