import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TextInputProps, 
  Animated 
} from 'react-native';
import { colors } from '../constants/colors';
import { LucideIcon } from 'lucide-react-native';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  containerStyle?: any;
}

export const AppInput = ({ 
  label, 
  error, 
  icon: Icon, 
  containerStyle, 
  onFocus, 
  onBlur, 
  ...props 
}: AppInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useState(new Animated.Value(0))[0];

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onBlur?.(e);
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.1],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View 
        style={[
          styles.inputContainer, 
          { 
            borderColor: error ? colors.danger : borderColor,
            shadowOpacity: shadowOpacity,
            elevation: isFocused ? 2 : 0,
          }
        ]}
      >
        {Icon && (
          <Icon 
            size={20} 
            color={error ? colors.danger : isFocused ? colors.primary : colors.muted} 
            style={styles.icon} 
          />
        )}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.muted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    height: '100%',
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
