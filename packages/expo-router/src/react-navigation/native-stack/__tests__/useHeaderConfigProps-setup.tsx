import type { useHeaderConfigProps } from '../views/useHeaderConfigProps';

export const DEFAULT_COLORS = {
  primary: 'rgb(0, 122, 255)',
  background: 'rgb(242, 242, 242)',
  card: 'rgb(255, 255, 255)',
  text: 'rgb(28, 28, 30)',
  border: 'rgb(216, 216, 216)',
  notification: 'rgb(255, 59, 48)',
};

export const DEFAULT_FONTS = {
  regular: { fontFamily: 'System', fontWeight: '400' as const },
  medium: { fontFamily: 'System', fontWeight: '500' as const },
  bold: { fontFamily: 'System', fontWeight: '600' as const },
  heavy: { fontFamily: 'System', fontWeight: '700' as const },
};

export type HookProps = Parameters<typeof useHeaderConfigProps>[0];

export const defaultProps = (
  overrides?: Partial<Omit<HookProps, 'route'>> & { route?: Partial<HookProps['route']> }
): HookProps => ({
  headerTopInsetEnabled: true,
  headerHeight: 44,
  headerBack: undefined,
  route: { key: 'test-key', name: 'TestScreen', ...(overrides?.route || {}) } as any,
  ...overrides,
});

export function getMocks() {
  const {
    ScreenStackHeaderBackButtonImage: MockedScreenStackHeaderBackButtonImage,
    ScreenStackHeaderCenterView: MockedScreenStackHeaderCenterView,
    ScreenStackHeaderLeftView: MockedScreenStackHeaderLeftView,
    ScreenStackHeaderRightView: MockedScreenStackHeaderRightView,
    ScreenStackHeaderSearchBarView: MockedScreenStackHeaderSearchBarView,
  } = jest.requireMock('react-native-screens') as typeof import('react-native-screens');

  const { useLocale: mockedUseLocale, useTheme: mockedUseTheme } = jest.requireMock(
    '../../native'
  ) as typeof import('../../native');

  return {
    MockedScreenStackHeaderBackButtonImage,
    MockedScreenStackHeaderCenterView,
    MockedScreenStackHeaderLeftView,
    MockedScreenStackHeaderRightView,
    MockedScreenStackHeaderSearchBarView,
    mockedUseLocale,
    mockedUseTheme,
  };
}
