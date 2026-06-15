const MAP: Record<string, string> = {
  FoundationModels: 'AI & Foundation Models',
  FoundationModelsUtilities: 'AI & Foundation Models',
  CoreAI: 'AI & Foundation Models',
  CoreAILM: 'AI & Foundation Models',
  CoreAISegmentation: 'AI & Foundation Models',
  Evaluations: 'AI & Foundation Models',
  VisualIntelligence: 'AI & Foundation Models',
  SwiftUI: 'SwiftUI',
  UIKit: 'UIKit',
  Swift: 'Swift',
  'Swift Playground': 'Swift',
  SwiftTesting: 'Swift',
  'Swift Testing': 'Swift',
  XCTest: 'Swift',
  SwiftData: 'Data & Foundation',
  Foundation: 'Data & Foundation',
  CoreTransferable: 'Data & Foundation',
  Observation: 'Data & Foundation',
  UniformTypeIdentifiers: 'Data & Foundation',
  AppIntents: 'App Extensions',
  WidgetKit: 'App Extensions',
  ActivityKit: 'App Extensions',
  MapKit: 'Maps',
  GeoToolbox: 'Maps',
  AVFoundation: 'Media',
  StateReporting: 'System & Performance',
  MetricKit: 'System & Performance',
  CoreSpotlight: 'System & Performance',
  Xcode: 'Developer Tools',
}

export function getGroupName(fw: string): string {
  return MAP[fw] ?? fw
}

/** All individual framework strings that belong to a given group name */
export function getGroupFrameworks(groupName: string): string[] {
  const result = Object.entries(MAP)
    .filter(([, g]) => g === groupName)
    .map(([fw]) => fw)
  // If nothing mapped, the group IS the raw framework name
  return result.length > 0 ? result : [groupName]
}
