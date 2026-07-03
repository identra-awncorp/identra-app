import { Grid2X2 } from 'lucide-react-native';

import type { BottomNavIconProps } from './BottomNavSvgIcon';

export function MiniAppNavIcon({
  color = '#1F3353',
  size = 31,
  style,
}: BottomNavIconProps) {
  return <Grid2X2 color={color} size={size} strokeWidth={2.2} style={style} />;
}
