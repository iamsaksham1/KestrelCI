/**
 * @file server/services/github/manifestParsers.js
 * @description Safe parsing of small repository manifest files (JSON, text, TOML).
 * Extracts package managers, declared scripts, dependency counts, and framework hints.
 * Security: NEVER evals code, NEVER runs scripts, safe parsing only.
 */

/**
 * Safely parses package.json
 */
export function parsePackageJson(content) {
  if (!content || typeof content !== 'string') return null;
  try {
    const pkg = JSON.parse(content);
    const scripts = pkg.scripts ? Object.keys(pkg.scripts) : [];
    const deps = pkg.dependencies ? Object.keys(pkg.dependencies) : [];
    const devDeps = pkg.devDependencies ? Object.keys(pkg.devDependencies) : [];
    const allDeps = [...new Set([...deps, ...devDeps])];

    const frameworks = [];
    const testFrameworks = [];

    // Framework detection
    if (allDeps.some(d => d === 'react' || d === 'react-dom' || d === 'next')) frameworks.push('React');
    if (allDeps.some(d => d === 'vue' || d === 'nuxt')) frameworks.push('Vue');
    if (allDeps.some(d => d === 'express')) frameworks.push('Express');
    if (allDeps.some(d => d === 'fastify')) frameworks.push('Fastify');
    if (allDeps.some(d => d === 'nest' || d === '@nestjs/core')) frameworks.push('NestJS');
    if (allDeps.some(d => d === 'tailwindcss')) frameworks.push('Tailwind');
    if (allDeps.some(d => d === 'svelte')) frameworks.push('Svelte');

    // Test framework detection
    if (allDeps.some(d => d === 'vitest')) testFrameworks.push('vitest');
    if (allDeps.some(d => d === 'jest')) testFrameworks.push('jest');
    if (allDeps.some(d => d === 'mocha')) testFrameworks.push('mocha');
    if (allDeps.some(d => d === 'cypress')) testFrameworks.push('cypress');
    if (allDeps.some(d => d === 'playwright' || d === '@playwright/test')) testFrameworks.push('playwright');

    // Check package manager if packageManager field is specified
    let packageManager = 'npm';
    if (pkg.packageManager) {
      if (pkg.packageManager.startsWith('yarn')) packageManager = 'yarn';
      else if (pkg.packageManager.startsWith('pnpm')) packageManager = 'pnpm';
      else if (pkg.packageManager.startsWith('bun')) packageManager = 'bun';
    }

    return {
      ecosystem: 'Node.js',
      packageManager,
      scripts,
      dependenciesCount: allDeps.length,
      frameworks,
      framework: frameworks.length > 0 ? frameworks.join(', ') : null,
      testFrameworks,
      hasTests: scripts.includes('test') || testFrameworks.length > 0,
      hasLint: scripts.includes('lint') || allDeps.some(d => d.includes('eslint')),
      hasBuild: scripts.includes('build')
    };
  } catch {
    return {
      ecosystem: 'Node.js',
      packageManager: 'npm',
      scripts: [],
      dependenciesCount: 0,
      frameworks: [],
      framework: null,
      testFrameworks: [],
      hasTests: false,
      hasLint: false,
      hasBuild: false
    };
  }
}

/**
 * Safely parses requirements.txt
 */
export function parseRequirementsTxt(content) {
  if (!content || typeof content !== 'string') return null;
  const lines = content.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#') && !l.startsWith('-'));

  const frameworks = [];
  const testFrameworks = [];

  for (const line of lines) {
    const pkgName = line.split(/[=<>~;]/)[0].trim().toLowerCase();
    if (pkgName === 'flask') frameworks.push('Flask');
    if (pkgName === 'django') frameworks.push('Django');
    if (pkgName === 'fastapi') frameworks.push('FastAPI');
    if (pkgName === 'tornado') frameworks.push('Tornado');
    if (['pytest', 'unittest', 'nose', 'tox'].includes(pkgName)) testFrameworks.push(pkgName);
  }

  return {
    ecosystem: 'Python',
    packageManager: 'pip',
    scripts: [],
    dependenciesCount: lines.length,
    frameworks,
    framework: frameworks.length > 0 ? frameworks.join(', ') : null,
    testFrameworks,
    hasTests: testFrameworks.length > 0,
    hasLint: lines.some(l => l.toLowerCase().includes('flake8') || l.toLowerCase().includes('black') || l.toLowerCase().includes('ruff')),
    hasBuild: false
  };
}

/**
 * Safely parses pyproject.toml
 */
export function parsePyprojectToml(content) {
  if (!content || typeof content !== 'string') return null;
  const lines = content.split('\n').map(l => l.trim());
  const hasPoetry = lines.some(l => l.includes('[tool.poetry'));
  const hasHatch = lines.some(l => l.includes('[tool.hatch'));
  const hasFlit = lines.some(l => l.includes('[tool.flit'));

  let packageManager = 'pip';
  if (hasPoetry) packageManager = 'Poetry';
  else if (hasHatch) packageManager = 'Hatch';
  else if (hasFlit) packageManager = 'Flit';

  const frameworks = [];
  if (content.toLowerCase().includes('fastapi')) frameworks.push('FastAPI');
  if (content.toLowerCase().includes('django')) frameworks.push('Django');
  if (content.toLowerCase().includes('flask')) frameworks.push('Flask');

  const testFrameworks = [];
  if (content.toLowerCase().includes('pytest')) testFrameworks.push('pytest');

  return {
    ecosystem: 'Python',
    packageManager,
    scripts: [],
    dependenciesCount: lines.filter(l => l.includes('=') && !l.startsWith('#')).length,
    frameworks,
    framework: frameworks.length > 0 ? frameworks.join(', ') : null,
    testFrameworks,
    hasTests: testFrameworks.length > 0,
    hasLint: content.toLowerCase().includes('ruff') || content.toLowerCase().includes('black'),
    hasBuild: true
  };
}

/**
 * Safely parses go.mod
 */
export function parseGoMod(content) {
  if (!content || typeof content !== 'string') return null;
  const requireLines = content.split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('require') || (l && !l.startsWith('module') && !l.startsWith('go') && !l.startsWith('//')));

  const frameworks = [];
  if (content.includes('gin-gonic')) frameworks.push('Gin');
  if (content.includes('fiber')) frameworks.push('Fiber');

  return {
    ecosystem: 'Go',
    packageManager: 'go',
    scripts: ['build', 'test'],
    dependenciesCount: requireLines.length,
    frameworks,
    framework: frameworks.length > 0 ? frameworks.join(', ') : null,
    testFrameworks: ['go test'],
    hasTests: true,
    hasLint: content.includes('golangci-lint'),
    hasBuild: true
  };
}

/**
 * Safely parses Cargo.toml
 */
export function parseCargoToml(content) {
  if (!content || typeof content !== 'string') return null;
  const lines = content.split('\n').map(l => l.trim());
  const depsCount = lines.filter(l => l.includes('=') && !l.startsWith('#')).length;

  const frameworks = [];
  if (content.includes('actix-web')) frameworks.push('Actix Web');
  if (content.includes('axum')) frameworks.push('Axum');
  if (content.includes('tokio')) frameworks.push('Tokio');

  return {
    ecosystem: 'Rust',
    packageManager: 'cargo',
    scripts: ['build', 'test'],
    dependenciesCount: depsCount,
    frameworks,
    framework: frameworks.length > 0 ? frameworks.join(', ') : null,
    testFrameworks: ['cargo test'],
    hasTests: true,
    hasLint: true, // cargo clippy
    hasBuild: true
  };
}

/**
 * Safely parses pom.xml or build.gradle
 */
export function parseJavaManifest(content, isGradle = false) {
  if (!content || typeof content !== 'string') return null;
  const isJunit = content.toLowerCase().includes('junit');
  const frameworks = [];
  if (content.toLowerCase().includes('springframework') || content.toLowerCase().includes('spring-boot')) {
    frameworks.push('Spring Boot');
  }
  if (content.toLowerCase().includes('micronaut')) {
    frameworks.push('Micronaut');
  }

  return {
    ecosystem: 'Java',
    packageManager: isGradle ? 'gradle' : 'maven',
    scripts: isGradle ? ['build', 'test'] : ['package', 'test'],
    dependenciesCount: (content.match(/<dependency>|implementation\(/g) || []).length,
    frameworks,
    framework: frameworks.length > 0 ? frameworks.join(', ') : null,
    testFrameworks: isJunit ? ['junit'] : [],
    hasTests: isJunit,
    hasLint: false,
    hasBuild: true
  };
}

export function parsePomXml(content) {
  return parseJavaManifest(content, false);
}

export function parseBuildGradle(content) {
  return parseJavaManifest(content, true);
}

export function parseGitHubWorkflows(files = []) {
  const workflowFiles = files.map(f => f.name || f.path || 'workflow');
  return {
    workflowsCount: workflowFiles.length,
    workflowFiles
  };
}

/**
 * Aggregate detected stack from all present manifests.
 */
export function aggregateDetectedStack(manifests = [], { hasDockerfile = false, hasCI = false } = {}) {
  let primaryEcosystem = 'other';
  let primaryPackageManager = 'none';
  let allScripts = [];
  let allFrameworks = [];
  let allTestFrameworks = [];
  let totalDeps = 0;
  let hasTests = false;
  let hasLint = false;
  let hasBuild = false;

  for (const item of manifests) {
    let parsed = null;
    const path = item.path || '';
    const content = item.content || '';

    if (path === 'package.json') {
      parsed = parsePackageJson(content);
    } else if (path === 'requirements.txt') {
      parsed = parseRequirementsTxt(content);
    } else if (path === 'pyproject.toml') {
      parsed = parsePyprojectToml(content);
    } else if (path === 'go.mod') {
      parsed = parseGoMod(content);
    } else if (path === 'Cargo.toml') {
      parsed = parseCargoToml(content);
    } else if (path === 'pom.xml') {
      parsed = parseJavaManifest(content, false);
    } else if (path === 'build.gradle') {
      parsed = parseJavaManifest(content, true);
    }

    if (parsed) {
      if (primaryEcosystem === 'other' || primaryEcosystem === 'unknown') {
        primaryEcosystem = parsed.ecosystem;
        primaryPackageManager = parsed.packageManager;
      }
      allScripts = [...new Set([...allScripts, ...(parsed.scripts || [])])];
      allFrameworks = [...new Set([...allFrameworks, ...(parsed.frameworks || [])])];
      allTestFrameworks = [...new Set([...allTestFrameworks, ...(parsed.testFrameworks || [])])];
      totalDeps += (parsed.dependenciesCount || 0);
      if (parsed.hasTests) hasTests = true;
      if (parsed.hasLint) hasLint = true;
      if (parsed.hasBuild) hasBuild = true;
    }
  }

  return {
    ecosystem: primaryEcosystem,
    packageManager: primaryPackageManager,
    scripts: allScripts,
    dependenciesCount: totalDeps,
    frameworks: allFrameworks,
    framework: allFrameworks.length > 0 ? allFrameworks.join(', ') : null,
    testFrameworks: allTestFrameworks,
    hasTests,
    hasLint,
    hasBuild,
    hasDockerfile,
    hasCI
  };
}

export default {
  parsePackageJson,
  parseRequirementsTxt,
  parsePyprojectToml,
  parseGoMod,
  parseCargoToml,
  parseJavaManifest,
  parsePomXml,
  parseBuildGradle,
  parseGitHubWorkflows,
  aggregateDetectedStack
};
