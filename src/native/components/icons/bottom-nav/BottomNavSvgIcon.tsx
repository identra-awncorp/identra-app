import { useMemo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

export type BottomNavIconProps = {
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
};

type BottomNavSvgIconProps = BottomNavIconProps & {
  xml: string;
};

const tintedFillPattern = /fill="rgb\((?!255,255,255|255,242,195)[^)]+\)"/g;
const surfaceFillPattern = /fill="rgb\((?:255,255,255|255,242,195)\)"/g;

function escapeXmlColor(color: string) {
  return color.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function tintBottomNavSvgXml(xml: string, color: string, backgroundColor: string) {
  const iconColor = escapeXmlColor(color);
  const surfaceColor = escapeXmlColor(backgroundColor);

  return xml
    .replace(/preserveAspectRatio="none"/g, 'preserveAspectRatio="xMidYMid meet"')
    .replace(tintedFillPattern, 'fill="' + iconColor + '"')
    .replace(surfaceFillPattern, 'fill="' + surfaceColor + '"');
}

export function BottomNavSvgIcon({
  backgroundColor = 'transparent',
  color = '#1F3353',
  size = 31,
  style,
  xml,
}: BottomNavSvgIconProps) {
  const tintedXml = useMemo(() => tintBottomNavSvgXml(xml, color, backgroundColor), [backgroundColor, color, xml]);

  return <SvgXml xml={tintedXml} width={size} height={size} style={style} />;
}
