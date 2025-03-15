import React from 'react';
import {View, Text, ViewStyle} from 'react-native';
import {Card, useTheme, Divider} from '@rneui/themed';

type CardType = 'default' | 'divider';

interface CustomCardProps {
  title: string;
  subtitle?: string;
  content?: string;
  type?: CardType;
  style?: ViewStyle;
}

const CustomCard: React.FC<CustomCardProps> = ({
  title,
  subtitle,
  content,
  type = 'default',
  style,
}) => {
  const {theme} = useTheme();

  return (
    <Card
      containerStyle={[theme.components.Card.containerStyle, style]}
      wrapperStyle={theme.components.Card.wrapperStyle}>
      <Text style={theme.components.Text.title}>{title}</Text>
      {type === 'divider' && <Divider style={{marginVertical: 10}} />}
      {subtitle && <Text style={theme.components.Text.subtitle}>{subtitle}</Text>}
      {content && <Text style={theme.components.Text.content}>{content}</Text>}
    </Card>
  );
};

export default CustomCard;
