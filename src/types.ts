interface KeyCount {
  keys: Record<string, number>;
  special: number;
};

interface KeyProject {
  projects: Record<string, KeyCount>;
  global: number;
}

interface KeyData {
  dates: Record<string, KeyProject>;
  total: number;
}

export { KeyCount, KeyProject, KeyData };
