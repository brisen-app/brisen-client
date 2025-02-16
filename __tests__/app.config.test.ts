import {
  majorVersion as configMajor,
  minorVersion as configMinor,
  patchVersion as configPatch,
  appVersion as configAppVersion,
  runtimeVersion as configRuntimeVersion,
} from '@/app.config'
import {
  majorVersion as bundleMajor,
  minorVersion as bundleMinor,
  patchVersion as bundlePatch,
  appVersion as bundleAppVersion,
  runtimeVersion as bundleRuntimeVersion,
} from '@/src/constants/Constants'

describe('App version', () => {
  it('App version strings should match', () => {
    expect(configAppVersion).toBe(bundleAppVersion)
    expect(configRuntimeVersion).toBe(bundleRuntimeVersion)
  })

  it('App version string formats should be correct', () => {
    expect(configAppVersion).toBe(`${configMajor}.${configMinor}.${configPatch}`)
    expect(configAppVersion).toBe(`${configRuntimeVersion}.${configPatch}`)
    expect(configRuntimeVersion).toBe(`${configMajor}.${configMinor}`)

    expect(bundleAppVersion).toBe(`${bundleMajor}.${bundleMinor}.${bundlePatch}`)
    expect(bundleAppVersion).toBe(`${bundleRuntimeVersion}.${bundlePatch}`)
    expect(bundleRuntimeVersion).toBe(`${bundleMajor}.${bundleMinor}`)
  })
})
